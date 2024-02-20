import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Repository, In, LessThan, Not, MoreThan } from "typeorm";
import { GETTER_SUBURL_REPOSITORY } from "../../../database/constants";
import { GetterDomainStatus } from "../../../database/entities/getter/getter-domain.entity";
import { GetterSubUrl, GetterSuburlType, GetterSubUrlExploreStatus } from "../../../database/entities/getter/getter-suburl.entity";
import { isUrlValid } from "../../../tech/urls.tech";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { DomainExploreUtilsService } from "./domain-explore-utils.service";
import * as cheerio from "cheerio";
import { GetterSubUrlService } from "../getter-suburl/getter-suburl.service";
import { GetterSource } from "../../../database/entities/getter/getter-source.entity";
import { GetterSourceService } from "../getter-source/getter-source.service";
import { isUrlInLengthLimit } from "../../tech/utils";


const includies = [
    "akord",
    "chord",
    "noty",
    "lyrics",
    "song",
    "píseň"
    // "zpevnik",
    // "transpo",
]

const MIN_SYNC_COUNT = 1;
const MAX_SYNC_COUNT = 12;

const MAX_COUNT_PER_LOOP = 500;


@Injectable()
export class DomainExploreSuburlsService {
    constructor(
        private readonly exploreUtils: DomainExploreUtilsService,
        @Inject(GETTER_SUBURL_REPOSITORY)
        private suburlRepository: Repository<GetterSubUrl>,
        private getterSuburlService: GetterSubUrlService,
        private sourceService: GetterSourceService
    ) {}





    async getAllSubUrls(url : string, useTimeout?: boolean, print: boolean = true) : Promise<{
        urls: string[],
        html: string
    } | null>{
        try{
            const html = await this.exploreUtils.getHtml(url,useTimeout);

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
            .filter((url)=>isUrlValid(url))
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
                exploredWithErrorCount: LessThan(2),
                domain:{
                    status: Not(GetterDomainStatus.Rejected),
                    hasExplorer: false,
                    level: MoreThan(0)
                },
                type: GetterSuburlType.Page
            },
            order: {
                domain: {
                    status: "ASC",
                    level: "ASC",
                    parent: {
                        status: "ASC",
                    }
                },
                explored: "ASC",
            },
            relations: {
                domain: {
                    parent: true
                }
            }
        })

        if(!site){
            return null;
        }
        
        site.explored = GetterSubUrlExploreStatus.Exploring;
        await this.suburlRepository.save(site);

        return site;
    }

    async processPage(site : GetterSubUrl, print: boolean = true) : Promise<string[] | null>{
        if(print) console.log("Exploring", site.url)

        const data = await this.getAllSubUrls(site.url, 
            site.explored !== GetterSubUrlExploreStatus.ExploredWithError,
            print);

        site.lastExplored = new Date();

        if(!data){
            if(print) console.log("\tError during exploration:", site.url)
            site.explored = GetterSubUrlExploreStatus.ExploredWithError;
            site.exploredWithErrorCount++;
            await this.suburlRepository.save(site);
            return null
        }

        site.explored = GetterSubUrlExploreStatus.Explored;
        site.exploredWithErrorCount = 0;

        const {
            urls,
            html
        } = data;


        site.probability = await this.calculateProbability(html);
        
        if(site.probability >= 50)
            await this.sourceService.addSource(site.url);

        await this.suburlRepository.save(site);
        
        return urls.filter((url)=>{
            return url && isUrlInLengthLimit(url);
        })
    }

    /**
     * 
     * @returns True if there are still sites to explore, false if there are no more sites to explore
     */
    async processLoop(count: number, print: boolean = false, maxTime: number = -1){
        
        if(count > MAX_COUNT_PER_LOOP) 
            throw new BadRequestException(`Count cannot be higher than ${MAX_COUNT_PER_LOOP}`);


        await this.exploreUtils.prepareBrowser();

        let syncCount = Math.ceil((MIN_SYNC_COUNT + MAX_SYNC_COUNT) / 2);
        let lastIncrease = true;
        let lastPer = Infinity;
        const threshold = 100;

        
        const start = new Date().getTime();

        let noSites = false;

        let exploreWithErrors = false;
        for(let i = 0; i < count;){
            const targetCount = Math.min(syncCount, count-i);
            if(print) console.log("Current sync count:", targetCount, " Last per time:", Math.round(lastPer/100)/10, "s");

            const currentStart = new Date().getTime();

            // First, choose the sites to explore
            const sites : GetterSubUrl[] = []
            for(let j = 0; j < targetCount; j++){
                const s = (await this.chooseNext(exploreWithErrors));
                if(!s) break;
                if(s) sites.push(s);
            }
            if(sites.length === 0 && exploreWithErrors){
                if(print) console.log("No sites")
                noSites = true;
                break;
            }else if(sites.length === 0 && !exploreWithErrors){
                exploreWithErrors = true;
                if(print) console.log("No unexplored sites, trying with previously explored sites with errors.")
                continue;
            }
            exploreWithErrors = false;


            // For each site, create processNext promise
            const promises : Promise<string[]>[] = sites.map((site, index)=>{
                if(site){
                    return this.processPage(site, print).then((result)=>{
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


            await this.getterSuburlService.addPages(urls);

            // Print the progress
            const now = new Date().getTime();
            const e = (now - start);
            const elapsed = e/1000;
            const per = elapsed / i;


            console.log();
            console.log(`Processed next ${targetCount} sites with ${errorCount} errors`);
            console.log("Processed", i, "of", count, "in", 
                Math.round(elapsed), "sec", "at", Math.round(per*10)/10, "s per site")
            console.log("Estimated time left", Math.round((count-i)*per/60), "min")
            console.log();

            if(e > maxTime && maxTime > 0){
                console.log("Max time reached")
                break;
            }

            

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

        await this.exploreUtils.closeBrowser();

        return !noSites;
    }

    async processSmartLoop(time: number, print: boolean = false){

        const minutes = Math.round(((time / 1000) / 60) * 100) / 100;
        console.log("The process will take approximately", minutes, "minutes")
        
        const start = new Date().getTime();
        

        let timeLeft = time;

        let loop = 0;
        let count = MAX_COUNT_PER_LOOP;

        while(timeLeft > 0){
            console.log("--- STARTING PART", loop+1, "---");
            if( !await this.processLoop(count, print, timeLeft)){
                console.log("No more suburls to explore")
                break;
            }
            loop++;

            // Do I have time for another loop?
            const now = new Date().getTime();
            const elapsed = now - start;
            timeLeft = time - elapsed;

        }

    }

    async containsSong(html: string){
        const keyClassWord = [
            "song",
            "piesen",
            "pisen",
            "chord",
            "akord"
        ]

        const forbiddenClassWord = [
            "songs",
            "piesne",
            "tag",
            "chords",
            "akordy",
        ]

        // check if exists element with class including substring from keyClassWord
        // but not including substring from forbiddenClassWord
        const $ = cheerio.load(html);
    
        const q = keyClassWord.map((word)=>`[class*="${word}"]`).join(", ");
        let elements = $(q);
        // filter out elements with class including substring from forbiddenClassWord
        elements = elements.filter((index, element)=>{
            for(const word of forbiddenClassWord){
                if($(element).attr("class").includes(word)){
                    return false;
                }
            }
            return true;
        })
        
        // console.log(elements.length)
        const existSongClass = elements.length > 0;
        if(!existSongClass) return false;

        let maxLength = 0;
        let maxNewLineCount = 0;
        elements.each((index, element)=>{
            const text = $(element).text();
            const length = text.length;
            const newLineCount = (text.match(/\n/g) || []).length;

            if(length > maxLength){
                maxLength = length;
                maxNewLineCount = newLineCount;
            }
        })


        // console.log("Max length", maxLength, "Max new lines", maxNewLineCount)

        if(maxLength < 100) return false
        if(maxNewLineCount > 1000) return false
  
        return true;
    }

    async calculateProbability(html: string){
        
        let score = 0;
        
        
        const regexes = includies.map(include => new RegExp(include, 'g'));
        
        for (const regex of regexes) {
            const matches = html.match(regex);
            if (matches) {
                score += 1;
            }
        }
        
        
        score = (score / includies.length)*50;
        // if(score < 1) return score;

        const containsSong = await this.containsSong(html);
        score += containsSong ? 50 : 0;

        return score;

    }
}