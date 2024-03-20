import { Inject, Injectable } from "@nestjs/common";
import { SONG_TITLE_REPOSITORY } from "../../../database/constants";
import { Repository } from "typeorm";
import { SongTitle } from "../../../database/entities/songtitle.entity";
import normalizeSearchText from "../../../tech/normalizeSearchText";

@Injectable()
export class SongTitleService{
    constructor(
        @Inject(SONG_TITLE_REPOSITORY)
        private titleRepository: Repository<SongTitle>
    ){}

    async getOrCreateTitleObject(title:string){
        const existing =  this.titleRepository.findOne({where:{title}});
        if(existing) return existing;
        

        // Create new title
        const titleData : SongTitle = {
            guid:undefined,
            variant: undefined,
            title: title,
            searchValue: normalizeSearchText(title)
        }
        const result = await this.titleRepository.insert(titleData);
        return await this.titleRepository.findOne({where:{guid:result.identifiers[0].guid}});
    }
}