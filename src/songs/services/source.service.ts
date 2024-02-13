import { Inject, Injectable } from "@nestjs/common"
import { Repository } from "typeorm";
import { SOURCE_REPOSITORY } from "../../database/constants";
import { Song } from "../../database/entities/song.entity";
import { Source } from "../../database/entities/source.entity";

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