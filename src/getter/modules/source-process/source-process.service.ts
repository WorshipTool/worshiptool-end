import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { GetterSource } from "../../../database/entities/getter/getter-source.entity";
import { Not, Repository } from "typeorm";
import { GETTER_SOURCES_REPOSITORY } from "../../../database/constants";
import { GetterDomain, GetterDomainStatus } from "../../../database/entities/getter/getter-domain.entity";
import { SourceExtractService } from "./source-extract/source-extract.service";
import { ProgramSongAddingService } from "../../../songs/adding/byprogram/program.song.adding.service";

@Injectable()
export class SourceProcessService{
    constructor(
        @Inject(GETTER_SOURCES_REPOSITORY)
        private sourcesRepository: Repository<GetterSource>,
        private extractService: SourceExtractService,
        private programAddService: ProgramSongAddingService
    ){}

    async chooseNextSource() : Promise<GetterSource | null> {
        return await this.sourcesRepository.findOne({
            where: {
                domain: {
                    status: GetterDomainStatus.Approved
                }
            },
            order: {
                processed: "ASC"
            },
            relations: {
                domain: true
            }
        
        })
    }

    async processSource(source: GetterSource){

        if(!source.domain){
            throw new InternalServerErrorException("Source has no domain");
        }

        const result = await this.extractService.parseSourceGeneric(source, source.domain);
        if(result.success && result.data){
            // Stream to add service
            for(const song of result.data){
                await this.programAddService.processDataStream(song);
            }
        }else{
            console.log("Failed to extract data from source: ", source.url);
        }

        // Mark source as processed
        source.processed = new Date();
        await this.sourcesRepository.save(source);

        return true;
    }

    async processNextSource(){
        const source = await this.chooseNextSource();
        if(!source) return false;

        console.log("Processing source: ", source.url)

        return this.processSource(source)
    }

    async processLoopWithTimeout(maxTime: number){
        const startTime = Date.now();
        while(Date.now() - startTime < maxTime){
            const result = await this.processNextSource();
            if(!result){
                console.log("No more sources to process");
                return;
            }
        }
        console.log("Timeout reached");
    }
}