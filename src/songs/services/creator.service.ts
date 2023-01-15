import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, CSLINK_REPOSITORY } from "src/database/constants";
import { Creator } from "src/database/entities/creator.entity";
import { CSVLink } from "src/database/entities/csvlink.entity";
import { In, Repository } from "typeorm";
import { SongDataCreator } from "../dtos";
import { Song } from "src/database/entities/song.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";

@Injectable()
export class CreatorService{

    constructor(
        @Inject(CREATOR_REPOSITORY)
        private creatorRepository: Repository<Creator>,
        @Inject(CSLINK_REPOSITORY)
        private CSVLinkRepository: Repository<CSVLink>
    ){}  

    async findAllBySongOrVariants(song: Song, variants: SongVariant[]) : Promise<SongDataCreator[]>{
        const links = await this.CSVLinkRepository.find({
            where:[
                {song},
                {variant: {
                    guid: In(variants.map((v)=>v.guid))
                }}
            ],
            relations:{
                creator: true,
                variant: true
            }
        })

        return links.map((l)=>{
            return {
                name: l.creator.name,
                type: l.type
            }
        })


    }





}