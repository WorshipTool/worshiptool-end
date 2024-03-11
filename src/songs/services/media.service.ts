import { Inject, Injectable } from "@nestjs/common"
import { Repository, InsertResult } from "typeorm";
import { MEDIA_REPOSITORY, SONG_REPOSITORY } from "../../database/constants";
import { Media } from "../../database/entities/media.entity";
import { Song } from "../../database/entities/song.entity";
import { SongDataMedia } from "../songs.dto";
@Injectable()
export class MediaService{

    constructor(
        @Inject(MEDIA_REPOSITORY)
        private mediaRepository: Repository<Media>,
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>
    ){}  


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

    async findAllBySong(song: Song):Promise<Media[]>{

        return await this.mediaRepository.find({where:{
            song: song
        }})
    }



}