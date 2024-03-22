import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CSVLINK_REPOSITORY } from "../../../database/constants";
import { CSVLink } from "../../../database/entities/csvlink.entity";
import { SongVariant } from "../../../database/entities/songvariant.entity";
import { SongDataCreator } from "../../songs.dto";
import { CreatorData } from "./creators.dto";

@Injectable()
export class CreatorsService{
    constructor(
        @Inject(CSVLINK_REPOSITORY)
        private CSVLinkRepository: Repository<CSVLink>
        ){}

    async findByVariantGuid(variantGuid: string) : Promise<CreatorData[]>{
        const links = await this.CSVLinkRepository.find({
            where:{
                variant:{guid:variantGuid}
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