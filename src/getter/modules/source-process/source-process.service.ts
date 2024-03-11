import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { GetterSource } from "../../../database/entities/getter/getter-source.entity";
import { IsNull, Not, Repository } from "typeorm";
import { GETTER_SOURCES_REPOSITORY } from "../../../database/constants";
import { GetterDomain, GetterDomainStatus } from "../../../database/entities/getter/getter-domain.entity";
import { ParsePageGenericResult, SourceExtractService } from "./source-extract/source-extract.service";
import { ProgramSongAddingService } from "../../../songs/adding/byprogram/program.song.adding.service";
import { parallel } from "../../../tech/parallel/parallel.tech";

@Injectable()
export class SourceProcessService{
    constructor(
        @Inject(GETTER_SOURCES_REPOSITORY)
        private sourcesRepository: Repository<GetterSource>,
        private extractService: SourceExtractService,
        private programAddService: ProgramSongAddingService
    ){}

    async chooseNextSources(count: number = 1) : Promise<GetterSource[] | null> {
        return await this.sourcesRepository.find({
            where: {
                domain: {
                    status: GetterDomainStatus.Approved
                },
                processed: IsNull()
            },
            order: {
                processed: "ASC",
                domain: {
                    hasScraper: "DESC"
                }
            },
            relations: {
                domain: true
            },
            take: count
        
        })
    }

    async chooseNextSource() : Promise<GetterSource | null> {
        const sources = await this.chooseNextSources();
        if(sources.length === 0) return null;
        return sources[0];
    }

    async processSource(source: GetterSource, callFromLoop: boolean = false, result?: ParsePageGenericResult){

        if(!source.domain){
            throw new InternalServerErrorException("Source has no domain");
        }

        if(!callFromLoop) this.extractService.prepareBrowser();

        result = result || await this.extractService.parseSourceGeneric(source, source.domain);

        if(result.success && result.data){
            // Stream to add service
            for(const song of result.data){
                const success = await this.programAddService.processDataStream(song);
                if(!success){
                    console.log("Failed to process song from source: ", source.url);
                }
            }
        }else{
            console.log("Failed to extract data from source: ", source.url);
        }

        // Mark source as processed
        source.processed = new Date();
        await this.sourcesRepository.save(source);


        if(!callFromLoop) this.extractService.closeBrowser();

        return true;
    }

    async processNextSource(print: boolean = false, callFromLoop: boolean = false){
        const source = await this.chooseNextSource();
        if(!source) return false;

        if(print) console.log("Processing source: ", source.url)

        return this.processSource(source, callFromLoop)
    }

    async processLoopWithTimeout(maxTime: number, print: boolean = true){
        const parallelCount = 1;//5;

        const minutes = Math.round(((maxTime / 1000) / 60) * 100) / 100;
        console.log("The process will take approximately", minutes, "minutes. With parallel count:", parallelCount)

        const startTime = Date.now();

        await this.extractService.prepareBrowser();


        while(Date.now() - startTime < maxTime){
            console.log()
            try{
                const results = await parallel(async (count)=>{
                    // Make sure to filter out duplicate sources
                    return (await this.chooseNextSources(count)).filter((r, index, self)=>{
                        return self.findIndex((s)=>s.url === r.url) === index;
                    });;
                },async (index, data)=>{
                    const source = data[index];
                    if(!source){
                        return null;
                    }

                    const result = await this.extractService.parseSourceGeneric(source, source.domain, true);
                    return {
                        result, source
                    };
                },parallelCount);

                const filteredItems = results.filter((r)=>r)

                const filtered = [];
                for(const item of filteredItems){
                    const r = await this.processSource(item.source, true, item.result);
                    if(r){
                        filtered.push(item);
                    }
                }


                if(filtered.length === 0){
                    console.log("No more sources to process");
                    return;
                }

            }catch(e){
                console.log("\nError processing source", e, "\n");
            }
        }

        await this.extractService.closeBrowser();

        console.log("Timeout reached");
    }
}