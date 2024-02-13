import { Injectable, Inject, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_SOURCES_REPOSITORY, GETTER_DOMAIN_REPOSITORY, GETTER_SEARCH_REPOSITORY } from "../database/constants";
import { GetterDomain } from "../database/entities/getter/getter-domain.entity";
import { GetterSearch } from "../database/entities/getter/getter-search.entity";
import { GetterSource } from "../database/entities/getter/getter-source.entity";
import { MessengerService } from "../messenger/messenger.service";
import { ParserService } from "../songs/services/parser.service";
import { isUrlValid } from "../tech/urls.tech";
import { PostAddGetterSourceDto, PostProcessNextResult } from "./getter.dto";
import { GetterDomainService } from "./modules/getter-domain/getter-domain.service";
import { ScrapeResult } from "./scripts/scrapers/template/ScrapeResult";
import { ScraperTemplate } from "./scripts/scrapers/template/ScraperTemplate";

import * as fs from 'fs';
import { v4 } from 'uuid';
import * as config from './scripts/config.json';
import * as puppeteer from "../../node_modules/puppeteer";

@Injectable()
export class GetterService{
    constructor(
        @Inject(GETTER_SOURCES_REPOSITORY)
        private sourcesRepository: Repository<GetterSource>,
        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,
        @Inject(GETTER_SEARCH_REPOSITORY)
        private searchRepository: Repository<GetterSearch>,

        private parserService: ParserService,
        private messengerService: MessengerService,
        private domainService: GetterDomainService,
    ){
        
    }

    async add(data: PostAddGetterSourceDto){
        if(!data.url) throw new BadRequestException("Url is required");
        if(!this.isUrlValid(data.url)) throw new BadRequestException("Url is not valid");

        // Check if already exists
        const existing = await this.sourcesRepository.findOne({
            where:{
                url: data.url
            }
        });
        if(existing) return "Already exists";

        const result = await this.sourcesRepository.createQueryBuilder()
            .insert().values({
                url: data.url
            }).execute();

        return "Added"
    }

    async getNext(){
        const result = await this.sourcesRepository.createQueryBuilder().select().getOne();
        return result;
    }

    async processNext() : Promise<PostProcessNextResult>{
        const next = await this.getNext();
        if(!next) return {
            message: "Nothing to process"
        };
        try{
            const result = await this.parseUrl(next.url);
            await this.sourcesRepository.delete(next);
            if(!result) return {
                message: "Nothing found in this url"
            }
            return {
                message: "Success",
                data: result
            };
        }catch(e){
            await this.sourcesRepository.delete(next);
            throw e;
        }


    }

    async makeScreenshot(url: string){
        const path = `public/temp/${v4()}.png`;

        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 1280,
                height: 1000,
            }
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(5000);
        await page.screenshot({ path, fullPage: true});
        await browser.close();
        return path;

    }

    browser: puppeteer.Browser = null;
    async prepareBrowser(){
        console.log("Preparing browser")

        if(!this.browser){
            //Use puppeteer to get the html
            this.browser = await puppeteer.launch({
                headless: true
            });
        }
    }

    async closeBrowser(){
        if(this.browser){
            await this.browser.close();
            this.browser = null;
        }
    }

    async getHtml(url: string, useTimeout: boolean = true){
        
        if(!this.browser){
            //Use puppeteer to get the html
            await this.prepareBrowser()
        }

        const page = await this.browser.newPage();
        
        await page.goto(url, {
            timeout: useTimeout ? 10 * 1000 : 0
        });
        try{
            await page.waitForNetworkIdle({
                timeout: useTimeout ? 10 * 1000 : 0
                
            });
        }catch(e){
            console.log("Waiting for network idle took too long. Continuing anyway.");
        }
    
        
        // await page.waitForTimeout(5000);
        const html = await page.content();
        await page.close();
        return html;
    }

    findScraper(url: string){
        for(const scraper of config.pages){
            if(url.includes(scraper.domain)){
                return scraper;
            }
        }
        return null;
    }

    isUrlValid(url: string) {
        return isUrlValid(url);
      }

    async parseWithScreenshot(url: string) : Promise<ScrapeResult>{
        // Make the screenshot
        const path = await this.makeScreenshot(url);

        // Parse the screenshot
        const result = await this.parserService.parse(path);

        // Delete the file
        fs.unlinkSync(path);

        if(result.sheets.length==0) return null;

        return {
            title: result.sheets[0].title,
            sheetData: result.sheets[0].data
        }
    }

    async parseUrl(url: string){
        if(!this.isUrlValid(url))
            throw new BadRequestException("Url is not valid: " + url);
        

        const scraperData = this.findScraper(url);
        if(!scraperData){
            const result = await this.parseWithScreenshot(url);
            return result;
        }

        // Check if scraperData.extracter file exists
        if(!fs.existsSync(scraperData.extracter)){
            throw new InternalServerErrorException("Scraper file not found");
        }


        const html = await this.getHtml(url);


        require('ts-node/register');

        const scraperClass = require(scraperData.extracter)

        const scraper : ScraperTemplate = new scraperClass.default();
        const data = scraper.scrape(html)





        return data;
    }


    async sendApprovalMessage(domain: GetterDomain, autoCall : boolean = true){

        const autoTitles = [
            "Nalezli jsme novou doménu!",
            "Našli jsme novou stránku!",
            "Nová doména ke schválení!"
        ]

        const notAutoTitles = [
            "Zde je další doména",
            "Tady máte další!",
            "Další doména ke schválení"
        ]

        const url = domain.domain;
        const title = autoCall ? 
            autoTitles[Math.floor(Math.random() * autoTitles.length)] : 
            notAutoTitles[Math.floor(Math.random() * notAutoTitles.length)];
        const subtitle = `Ověř zda ${domain.domain} obsahuje pouze křesťanské písničky.`;

        this.messengerService.sendCustomMessage({
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                   {
                    "title":title,
                    // "image_url":url,
                    "subtitle":subtitle,
                    "default_action": {
                      "type": "web_url",
                      "url": url,
                      "webview_height_ratio": "full"
                    },
                    "buttons":[
                        {
                            "type":"postback",
                            "title":"Schválit",
                            "payload":JSON.stringify({
                                method: "APPROVE_DOMAIN",
                                domain: domain.domain,
                                autoCall: autoCall
                            }),
                            // "payload":"ahoj"
                        },
                        {
                        "type":"postback",
                        "title":"Zamítnout",
                        "payload":JSON.stringify({
                            method: "REJECT_DOMAIN",
                            domain: domain.domain,
                            autoCall: autoCall
                        })
                      }              
                    ]      
                  }
                ]
              }
        }
    })
    }


    askToMore(){
        this.messengerService.sendCustomMessage({
            "text":"Chcete schválovat dál?",
            "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Pokračovat",
                  "payload":"",
                  "image_url":"https://cdn-icons-png.flaticon.com/128/8832/8832138.png"
                },{
                  "content_type":"text",
                  "title":"Už ne",
                  "payload":"",
                  "image_url":"https://cdn-icons-png.flaticon.com/512/6276/6276642.png"
                }
              ]
        })
    }

}