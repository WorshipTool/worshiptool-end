import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, NewSongData, SongData } from "./dtos";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { User } from "src/auth/decorators/user.decorator";
import { ROLES, User as UserObject } from "src/database/entities/user.entity";

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
    async getSongData(@Param() {guid}: {guid:string}){
        return await this.songsService.gatherSongData(guid);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addNewSong(@Body() data: NewSongData){
        return formatted(await this.songsService.processNewSongData(data));
    }

    @UseGuards(JwtAuthGuard)
    @Post("variant/verify/:guid")
    async verify(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin) && (user.role!=ROLES.Trustee))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.verifyVariantByGUID(guid);
        if(result.affected>0)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }

    @UseGuards(JwtAuthGuard)
    @Post("variant/unverify/:guid")
    async unverify(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.unverifyVariantByGUID(guid);
        if(result.affected>0)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }

    @UseGuards(JwtAuthGuard)
    @Post("variant/delete/:guid")
    async delete(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.deleteVariantByGUID(guid);
        if(result.affected>0)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }
}