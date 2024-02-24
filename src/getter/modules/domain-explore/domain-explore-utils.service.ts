import { Injectable } from "@nestjs/common";
import * as puppeteer from 'puppeteer';

@Injectable()
export class DomainExploreUtilsService {
    constructor() {}

    browser: puppeteer.Browser = null;

    async prepareBrowser(){
        // console.log("Preparing browser")
        if(!this.browser){
            //Use puppeteer to get the html
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
        let createNewBroser = false;
        if(!this) createNewBroser = true;

        let browser;

        if(!createNewBroser){
            // console.log("Creating new browser")

            if(!this.browser) await this.prepareBrowser()
            browser = this.browser;
        }else{
            // console.log("Hello");
            browser = await puppeteer.launch({
                headless: true
            });
        }

        const page = await browser.newPage();
        
        await page.goto(url, {
            timeout: useTimeout ? 10 * 1000 : 0
        });
        try{
            await page.waitForNetworkIdle({
                timeout: useTimeout ? 10 * 1000 : 0
                
            });
        }catch(e){
            console.log("Waiting for network idle took too long. Continuing anyway:",url);
        }
    
        
        // await page.waitForTimeout(5000);
        const html = await page.content();
        await page.removeAllListeners();
        await page.close();
        return html;
    }

    
}