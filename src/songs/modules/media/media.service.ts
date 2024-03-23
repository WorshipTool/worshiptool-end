import { Inject, Injectable } from "@nestjs/common";
import { Media } from "../../../database/entities/media.entity";
import { InsertResult, Repository } from "typeorm";
import { MEDIA_REPOSITORY, SONG_REPOSITORY } from "../../../database/constants";
import { SongDataMedia } from "../../songs.dto";
import { Song } from "../../../database/entities/song.entity";

@Injectable()
export class MediaService{
    constructor(
        @Inject(MEDIA_REPOSITORY)
        private mediaRepository: Repository<Media>,
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>
    ){}

    getBySongGuid(songGuid: string) : Promise<Media[]>{
        return this.mediaRepository.find({
            where:{song:{guid:songGuid}}
        });
    }

    

    async addNewOne(data: SongDataMedia, songGuid?:string) : Promise<InsertResult|Media>{
        const existing = await this.mediaRepository.find({
            where:{
                url: data.url
            },
            relations:{
                song:true
            }
        })
        //if(existing.length>0)return existing[0];

        let sguid = songGuid;

        if(!sguid){
            const r = await this.songRepository.insert({});
            sguid = r.identifiers[0].guid;

        }

        const song = await this.songRepository.findOne({where:{guid:sguid}});
        return await this.mediaRepository.insert({...data, song});
    }


}