import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY } from "../../database/constants";
import { Creator } from "../../database/entities/creator.entity";
import { CSVLink } from "../../database/entities/csvlink.entity";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { SongDataCreator } from "../songs.dto";

@Injectable()
export class CreatorService{

    constructor(
        @Inject(CREATOR_REPOSITORY)
        private creatorRepository: Repository<Creator>,
        @Inject(CSVLINK_REPOSITORY)
        private CSVLinkRepository: Repository<CSVLink>
    ){}  


    async findAllByVariant(variant: SongVariant) : Promise<SongDataCreator[]>{
        const links = await this.CSVLinkRepository.find({
            where:{
                variant
            },
            relations:{
                creator: true,
                variant:true
            }
        })

        return links.map((l)=>({
            name:l.creator.name,
            type: l.type
        }))
    }





}