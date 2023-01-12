import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, NewSongData, SongData } from "./dtos";

@Controller("songs")
export class SongsController{

    constructor(
        private songsService: SongsService
    ){}

    @Get()
    async getByQuery(@Query() query: GetSongQuery){
        return formatted(await this.songsService.processGetQuery(query));
    }

    @Get("data/:guid")
    getSongData(@Param() {guid}: {guid:string}){
        return formatted(this.songsService.gatherSongData(guid));
    }

    @Post()
    addNewSong(@Body() data: NewSongData){
        return formatted(this.songsService.processNewSongData(data));
    }
}