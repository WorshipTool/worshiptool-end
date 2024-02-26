import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProgramSongData } from "../../../../songs/adding/byprogram/program.song.adding.service";
import { isUrlValid } from "../../../../tech/urls.tech";
import * as fs from 'fs';

import * as config from "../../../scripts/config.json"
import { ScraperTemplate } from "../../../scripts/scrapers/template/ScraperTemplate";
import { v4 } from 'uuid';
import * as puppeteer from 'puppeteer';
import { ScrapeResult } from "../../../scripts/scrapers/template/ScrapeResult";
import { ParserService } from "../../../../songs/services/parser.service";
import { GETTER_DOMAIN_REPOSITORY, GETTER_SOURCES_REPOSITORY } from "../../../../database/constants";
import { Repository } from "typeorm";
import { GetterSource } from "../../../../database/entities/getter/getter-source.entity";
import { GetterDomain } from "../../../../database/entities/getter/getter-domain.entity";


type ParsePageGenericResult = {
    success: boolean;
    data?: ProgramSongData[],
    url: string
}

const PAGE_DEFAULT_TIMEOUT = 10 * 1000;

@Injectable()
export class SourceExtractService{
    constructor(
        private parserService: ParserService,

        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,
    ){}

    async parseSourceGeneric(source: GetterSource, domain: GetterDomain) : Promise<ParsePageGenericResult>{

        const url = source.url;

        if(!isUrlValid(url))
            throw new BadRequestException("Url is not valid: " + url);
        

        const scraperData = this.findScraper(url);
        if(!scraperData){
            domain.hasScraper = false;
            await this.domainRepository.save(domain);

            const result = await this.parseWithScreenshot(url);
            if(!result) return {
                success: false,
                url: url
            }
            return {
                success: true,
                data: [{
                    confidence: 0.2,
                    title: result.title,
                    sheetData: result.sheetData,
                    url: url
                }],
                url: url
            
            };
        }

        // Check if scraperData.extracter file exists
        if(!fs.existsSync(scraperData.extracter)){

            domain.hasScraper = false;
            await this.domainRepository.save(domain);

            throw new InternalServerErrorException("Scraper file not found");
        }


        domain.hasScraper = true;
        await this.domainRepository.save(domain);

        const html = await this.getHtml(url);


        require('ts-node/register');

        const scraperClass = require(scraperData.extracter)

        const scraper : ScraperTemplate = new scraperClass.default();
        const data = scraper.scrape(html)

        const success = data.title?.length > 0 || data.sheetData?.length > 0;

        if(!success){
            console.log("Song data not found on page: ", url)
        }

        return {
            success,
            url: url,
            data: success ? [
                {
                    confidence: 1,
                    title: data.title?.length > 0 ? data.title : null,
                    sheetData: data.sheetData?.length > 0 ? data.sheetData : null,
                    url: url
                }
            ] : null
        };
    }
    async getHtml(url:string) : Promise<string>{
        
        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();
        
        await page.goto(url, {
            timeout: PAGE_DEFAULT_TIMEOUT
        });
        try{
            await page.waitForNetworkIdle({
                timeout: PAGE_DEFAULT_TIMEOUT
                
            });
        }catch(e){
            console.log("Waiting for network idle took too long. Continuing anyway.");
        }
    
        
        const html = await page.content();
        await page.close();
        await browser.close();
        return html;
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
            title: result.sheets[0].title.trim(),
            sheetData: result.sheets[0].data
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
        await page.waitForNetworkIdle({
            timeout: PAGE_DEFAULT_TIMEOUT
        });
        await page.screenshot({ path, fullPage: true});
        await browser.close();
        return path;

    }
    
    findScraper(url: string){
        for(const scraper of config.pages){
            if(url.includes(scraper.domain)){
                return scraper;
            }
        }
        return null;
    }
}