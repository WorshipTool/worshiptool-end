import { Inject, Injectable } from "@nestjs/common";
import { Media } from "../../../database/entities/media.entity";
import { Repository } from "typeorm";
import { MEDIA_REPOSITORY } from "../../../database/constants";

@Injectable()
export class MediaService{
    constructor(
        @Inject(MEDIA_REPOSITORY)
        private mediaRepository: Repository<Media>,
    ){}

    getBySongGuid(songGuid: string) : Promise<Media[]>{
        return this.mediaRepository.find({
            where:{song:{guid:songGuid}}
        });
    }
}