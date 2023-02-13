import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY } from "src/database/constants";
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
        @Inject(CSVLINK_REPOSITORY)
        private CSVLinkRepository: Repository<CSVLink>
    ){}  

    async findAllBySong(song: Song) : Promise<SongDataCreator[]>{
        const links = await this.CSVLinkRepository.find({
            where:{
                songOrVariant: "song",
                song
            },
            relations:{
                creator: true,
                song:true
            }
        })

        return links.map((l)=>({
            name:l.creator.name,
            type: l.type
        }))
    }

    async findAllByVariant(variant: SongVariant) : Promise<SongDataCreator[]>{
        const links = await this.CSVLinkRepository.find({
            where:{
                songOrVariant: "variant",
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