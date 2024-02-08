import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GETTER_DOMAIN_REPOSITORY, GETTER_SEARCH_REPOSITORY, GETTER_SOURCES_REPOSITORY, GETTER_SUBURL_REPOSITORY } from "src/database/constants";
import { GetterSource } from "src/database/entities/getter/getter-source.entity";
import { Repository, In } from 'typeorm';
import { ParserService } from "src/songs/services/parser.service";
import { GetterDomain, GetterDomainStatus } from "src/database/entities/getter/getter-domain.entity";
import { customsearch } from '@googleapis/customsearch';
import { MessengerService } from "src/messenger/messenger.service";
import { GetterSearch } from "src/database/entities/getter/getter-search.entity";
import { GetterService } from "../getter.service";

import * as cheerio from "cheerio";
import { GETTER_URL_MAX_LENGTH, GetterSubUrl, GetterSubUrlExploreStatus, GetterSuburlType } from "src/database/entities/getter/getter-suburl.entity";
import { GetterDomainService } from "./getter-domain.service";
import { isUrlValid } from "src/tech/urls.tech";

@Injectable()
export class GetterSubUrlService{
    constructor(
        @Inject(GETTER_SUBURL_REPOSITORY)
        private suburlRepository: Repository<GetterSubUrl>,
        private getterService: GetterService,
        private domainService: GetterDomainService

    ){}

    async getAllSubUrls(url : string, useTimeout?: boolean, print: boolean = true) : Promise<{
        urls: string[],
        html: string
    } | null>{
        try{
            const html = await this.getterService.getHtml(url,useTimeout);

            const basePath = url.split("/").slice(0,3).join("/");
    
            const $ = cheerio.load(html);
            const links = $("a")
    
            // Loop over all the anchor tags
            const urls = links.toArray().map((value) => {
                const url = $(value).attr("href");
                if(!url) return null;
                
                if(url.startsWith("/")) return basePath+url;
    
                return url;
            })
            .filter((url)=>this.getterService.isUrlValid(url))
            .filter((value, index, self) => self.indexOf(value) === index)
    
    
            return {
                urls,
                html
            }
        }catch(e){
            if(print) console.log("\tError during exploration:", e.message)

            return null;
        }
        
    }

    async chooseNext(explorWithErrors = false){
        const site = await this.suburlRepository.findOne({
            where: {
                explored: In(
                    explorWithErrors ? [
                        GetterSubUrlExploreStatus.Unexplored, 
                        GetterSubUrlExploreStatus.ExploredWithError
                    ] :
                    [
                        GetterSubUrlExploreStatus.Unexplored,
                    ]
                ),
                domain:{
                    status: GetterDomainStatus.Approved
                },
                type: GetterSuburlType.Page
            },
            order: {
                explored: "ASC",
                probability: "DESC"
            }
        })

        if(!site){
            return null;
        }
        
        site.explored = GetterSubUrlExploreStatus.Exploring;
        await this.suburlRepository.save(site);

        return site;
    }

    async processNext(site? : GetterSubUrl, print: boolean = true) : Promise<string[] | null>{

        if(!site){
            site = await this.chooseNext();
        }

        if(!site){
            if(print) console.log("No site");
            return null
        }



        if(print) console.log("Exploring", site.url)

        const data = await this.getAllSubUrls(site.url, 
            site.explored !== GetterSubUrlExploreStatus.ExploredWithError,
            print);



        if(!data){
            if(print) console.log("\tError during exploration:", site.url)
            site.explored = GetterSubUrlExploreStatus.ExploredWithError;
            await this.suburlRepository.save(site);
            return null
        }

        site.explored = GetterSubUrlExploreStatus.Explored;

        const {
            urls,
            html
        } = data;

        // console.log(urls)

        site.probability = this.calculateProbability(html);
        await this.suburlRepository.save(site);
        
        return urls.filter((url)=>{
            return url && url.length <= GETTER_URL_MAX_LENGTH
        })
    }

    async addDomain(url: string){
        const domain = await this.domainService.getDomainObject(url);

        await this.suburlRepository.save({url, domain})
        return "Done"
    }

    calculateProbability(html: string){
        const includies = [
            "akord",
            "chord",
            "noty",
            "lyrics",
            "zpevnik",
            "song",
        ]

        let score = 0;

        for(const include of includies){
            if(html.includes(include)){
                score += 1;
            }
        }

        score = (score / includies.length)*100;
        return score;

    }

    getUrlType(url: string) : GetterSuburlType{
        if(!isUrlValid(url)){
            return null;
        }

        const u = new URL(url);
        const path = u.pathname;

        const audioEndings = [
            ".mp3",
            ".wav",
            ".flac",
            ".ogg",
        ]

        const imageEndings = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
        ]

        const videoEndings = [
            ".mp4",
            ".avi",
            ".mkv",
            ".webm",
        ]

        const otherEndings = [
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
            ".zip",
            ".rar",
            ".7z",
            ".tar",
            ".gz",
            ".bz2",
            ".xz"
        ]

        if(audioEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Audio;
        }

        if(imageEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Image;
        }

        if(videoEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Video;
        }

        if(otherEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Other;
        }

    }

    
    async processLoop(count: number, print: boolean = true){
        
        if(count > 1000) throw new BadRequestException("Count too high. Max 1000.");

        await this.getterService.prepareBrowser();

        const MIN_SYNC_COUNT = 1;
        const MAX_SYNC_COUNT = 20;
        let syncCount = 10;
        let lastIncrease = true;
        let lastPer = Infinity;
        const threshold = 100;

        
        const start = new Date().getTime();



        let exploreWithErrors = false;
        for(let i = 0; i < count;){
            const targetCount = Math.min(syncCount, count-i);
            if(print) console.log("Current sync count:", targetCount, " Last per time:", Math.round(lastPer/100)/10, "s");

            const currentStart = new Date().getTime();

            // First, choose the sites to explore
            const sites = []
            for(let j = 0; j < targetCount; j++){
                const s = (await this.chooseNext(exploreWithErrors));
                
                if(s) sites.push(s);
            }
            if(sites.length === 0 && exploreWithErrors){
                if(print) console.log("No sites")
                break;
            }else if(sites.length === 0 && !exploreWithErrors){
                exploreWithErrors = true;
                if(print) console.log("No unexplored sites, trying with previously explored sites with errors.")
                continue;
            }
            exploreWithErrors = false;


            // For each site, create processNext promise
            const promises = sites.map((site, index)=>{
                if(site){
                    return this.processNext(site, print).then((result)=>{
                        i++;
                        if(print) console.log(i+".", "Processed:", site.url)
                        return result
                    })
                }
            })

            // Wait until all promises are done
            const results = (await Promise.all(promises))

            const errorCount = results.filter((result)=>result === null).length;

            // Make sure there are no duplicates
            let urls = results.flat();
            urls = urls.filter((url)=>url);
            urls = urls.filter((url, index, self)=>{
                return self.indexOf(url) === index;
            })

            // Prepare the new sites, push them to newSites array
            // Check if the site is already in the database
            const newSites = [];
            for(const url of urls){
                if(!url) continue;
                if(await this.suburlRepository.findOne({
                    where:{
                        url
                    }
                })){
                    continue;
                }
                
                const domain = await this.domainService.getDomainObject(url);
                const type = this.getUrlType(url);
                newSites.push({
                    url,
                    domain: domain,
                    type,
                })
            }

            // Insert the new sites to the database
            try{
                await this.suburlRepository.save(newSites);
            }catch(e){
                if(print) console.log("Error during saving new sites:", e.message)
            }


            // Print the progress
            const now = new Date().getTime();
            const elapsed = (now - start)/1000;
            const per = elapsed / i;


            console.log();
            console.log(`Processed next ${targetCount} sites with ${errorCount} errors`);
            console.log("Processed", i, "of", count, "in", 
                Math.round(elapsed), "sec", "at", Math.round(per*10)/10, "s per site")
            console.log("Estimated time left", Math.round((count-i)*per/60), "min")
            console.log();

            

            const currentPer = Math.round((now - currentStart)/targetCount);
            const dist = currentPer - lastPer;

            if(dist > threshold){ // We are slower
                if(lastIncrease){
                    syncCount--;
                    lastIncrease = false;
                }else{
                    syncCount++;
                    lastIncrease = true;
                }
            }else if(-threshold < dist){ // We are faster
                if(lastIncrease){
                    syncCount++;
                    lastIncrease = true;
                }else{
                    syncCount--;
                    lastIncrease = false;
                }
            }else{
                if(Math.random() > 0.8){
                    const add = (Math.random() > 0.5) ? 1 : -1
                    syncCount += add;
                    lastIncrease = add > 0;
                };


            }
            syncCount = Math.max(syncCount, MIN_SYNC_COUNT);
            syncCount = Math.min(syncCount, MAX_SYNC_COUNT);

            lastPer = currentPer;

        }

        await this.getterService.closeBrowser();
    }


}