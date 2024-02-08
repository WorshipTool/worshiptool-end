import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GETTER_DOMAIN_REPOSITORY, GETTER_SEARCH_REPOSITORY, GETTER_SOURCES_REPOSITORY } from "src/database/constants";
import { GetterSource } from "src/database/entities/getter/getter-source.entity";
import { Repository, In } from 'typeorm';
import { PostAddGetterSourceDto, PostProcessNextResult } from "./getter.dto";
import { v4 } from 'uuid';
import * as config from "./scrapers/config.json"
import * as puppeteer from 'puppeteer';
import { ScraperTemplate } from "./scrapers/ScraperTemplate";
import { ParserService } from "src/songs/services/parser.service";
import * as fs from 'fs';
import { ScrapeResult } from "./scrapers/ScrapeResult";
import { GetterDomain, GetterDomainStatus } from "src/database/entities/getter/getter-domain.entity";
import { customsearch } from '@googleapis/customsearch';
import { MessengerService } from "src/messenger/messenger.service";
import { GetterSearch } from "src/database/entities/getter/getter-search.entity";
import { GetterDomainService } from "./services/getter-domain.service";
import { isUrlValid } from "src/tech/urls.tech";


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
        if(!this.browser){
            //Use puppeteer to get the html
            this.browser = await puppeteer.launch({
                headless: 'new'
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

    generujNahodneKlicovaSlova(maxDelkaSlova: number) {
        const slovnik = [
            "Křesťanské písně s textem a akordy",
            "Boží láska chválové písně",
            "Vykoupení a odpuštění akordy",
            "Boží věrnost worship songs",
            "Svoboda křesťanské texty",
            "Modlitba a oddanost akordy",
            "Díkůvzdání křesťanské písně",
            "Víra a naděje worship chords",
            "Sláva Boží chvály s textem",
            "Odevzdání se Boží vůli písně",
            "Posvěcení a růst křesťanské akordy",
            "Boží milosrdenství worship songs",
            "Kristův vzkříšení písně s akordy",
            "Boží vedení chvály s textem",
            "Svědectví o věrnosti akordy",
            "Světlo v temnotě křesťanské texty",
            "Boží moudrost worship chords",
            "Naděje ve víře písně s textem",
            "Svátost ve společenství chvály s akordy",
            "Boží pokoj křesťanské texty",
            "Svoboda v Kristu worship songs",
            "Boží milost chvály s textem",
            "Víra jako opora křesťanské akordy",
            "Radost ve službě písně s akordy",
            "Svědectví Boží lásky worship chords",
            "Boží nekonečná trpělivost křesťanské texty"
        ];
      
        const nahodnaKlicovaSlova : string[] = [];
      
        for (let i = 0; i < 1; i++) {
          let slovo = '';
          const delkaSlova = Math.floor(Math.random() * maxDelkaSlova) + 1;
      
          for (let j = 0; j < delkaSlova; j++) {
            const nahodneIndex = Math.floor(Math.random() * slovnik.length);
            slovo += slovnik[nahodneIndex];
      
            // Přidat mezery mezi slovy (kromě posledního)
            if (j < delkaSlova - 1) {
              slovo += ' ';
            }
          }
      
          nahodnaKlicovaSlova.push(slovo);
        }
        
        return nahodnaKlicovaSlova[0] +" křesťanské písně s akordy -bakalářskápráce -dimpomovaprace";
    }

    async getSearchQuery(){
        const existing = await this.searchRepository.findOne({
            where:{
                processedAll: false
            },
            order:{
                lastSearch: "DESC"
            }
        });
        
        if(!existing) return {
            query: this.generujNahodneKlicovaSlova(3),
            page: 0
        };


        return {
            query: existing.query,
            page: existing.lastPage+1
        };
    }

    async search(){

        const useMockData = false;

        const key = "AIzaSyA4OWcFUwakif-pdoQWaW_Fy6Q8DVbxnGE";
        const cx = "675c65a6e9ad74cb5"

        
        const query = await this.getSearchQuery();
        console.log(query);

        
        let resultItems = [];
        if(useMockData){
            resultItems = [
                {
                    title: "Píseň 1",
                    link: "https://www.pisen1.cz"
                },
                {
                    title: "Píseň 2",
                    link: "https://www.pisen2.cz"
                },
                {
                    title: "Píseň 3",
                    link: "https://www.pisen3.cz"
                }
            ]
        }else{
            const result = await customsearch("v1").cse.list({
                cx, key,
                q: query.query,
                start: query.page*10 + 1
            })

            const existing = await this.searchRepository.findOne({
                where:{
                    query: query.query
                }
            });

            const hasNext = Boolean(result.data.queries.nextPage);

            if(!existing){
                await this.searchRepository.createQueryBuilder().insert().values({
                    query: query.query,
                    lastSearch: new Date(),
                    lastPage: query.page,
                    processedAll: !hasNext
                }).execute();
            }else{
                this.searchRepository.createQueryBuilder().update().set({
                    lastPage: query.page,
                    processedAll: !hasNext
                }).where({
                    guid: existing.guid
                }).execute();
            }
            resultItems = result.data.items;
        }

        const items = resultItems.map((item)=>{
            // Extract domain
            const url = new URL(item.link);
            const domain = url.hostname;


            return {
                title: item.title,
                url: item.link,
                domain: this.domainService.getDomain(item.link)
            }
        })

        let newCount = 0;
        // Every new domain should be added to the database
        const domains = items.map((item)=>item.domain);
        for(const d of domains){
            const existing = await this.domainRepository.findOne({
                where:{
                    domain: d
                }
            });
            if(!existing){
                await this.domainRepository.createQueryBuilder().insert().values({
                    domain: d
                }).execute();
                newCount++;
            }
        }


        return {
            query,
            count: items.length,
            newCount: newCount,
            items
        }

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