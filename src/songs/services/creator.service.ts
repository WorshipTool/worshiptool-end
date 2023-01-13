import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, CSLINK_REPOSITORY } from "src/database/constants";
import { Creator } from "src/database/entities/creator.entity";
import { CSVLink } from "src/database/entities/csvlink.entity";
import { Repository } from "typeorm";
import { SongDataCreator } from "../dtos";

@Injectable()
export class CreatorService{

    constructor(
        @Inject(CREATOR_REPOSITORY)
        private creatorRepository: Repository<Creator>,
        @Inject(CSLINK_REPOSITORY)
        private CSVLinkRepository: Repository<CSVLink>
    ){}  

    async findAllBySVGUIDs(songGUID: string, variantGUIDs: string[]) : Promise<SongDataCreator[]>{
        const links = await this.CSVLinkRepository.createQueryBuilder()
            .where("songGUID=:guid",{guid:songGUID})
            .orWhere("variantGUID IN (:...guids)",{guids: variantGUIDs})
            .getMany();

        const creatorGUIDs = links.map((l)=>l.creatorGUID);

        if(creatorGUIDs.length==0)return [];
        
        const creators : Creator[] = await this.creatorRepository.createQueryBuilder()
            .where("guid IN (:...guids)",{guids: creatorGUIDs})
            .getMany();

        return creators.map((creator)=>{
            return {
                name: creator.name,
                type: links.find((l)=>l.creatorGUID==creator.guid).type
            }
        })


    }





}