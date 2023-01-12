import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, NewSongData, SongData } from "./dtos";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";

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

    @UseGuards(JwtAuthGuard)
    @Post()
    addNewSong(@Body() data: NewSongData){
        return formatted(this.songsService.processNewSongData(data));
    }
}