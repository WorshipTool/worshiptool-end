import { Inject, Injectable } from "@nestjs/common"
import { CREATOR_REPOSITORY, MEDIA_REPOSITORY, SONG_REPOSITORY, SOURCE_REPOSITORY } from "src/database/constants"
import { InsertResult, Repository } from "typeorm"
import { Song } from "src/database/entities/song.entity"
import { Source } from "src/database/entities/source.entity"

@Injectable()
export class SourceService{

    constructor(
        @Inject(SOURCE_REPOSITORY)
        private sourceRepository: Repository<Song>
    ){}  

    async addNew(data: Partial<Source>){
        return await this.sourceRepository.insert(data);
    }

}