import { Get, Inject, Injectable } from "@nestjs/common";
import { SONG_REPOSITORY } from "src/database/constants";
import { Song } from "src/database/entities/song.entity";
import { Repository } from "typeorm";

@Injectable()
export class SongService{
    constructor(
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>
    ){}

    async getTest(){
        return await this.songRepository.count();
    }
}