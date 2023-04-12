import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, SearchQuery, ListQuery } from './dtos';
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { User } from "src/auth/decorators/user.decorator";
import { ROLES, User as UserObject } from "src/database/entities/user.entity";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { AddSongDataService } from "./services/adding/add.service";

@Controller("songs")
export class SongsController{

    constructor(
        private songsService: SongsService,
        private addService: AddSongDataService
    ){}

    @AllowNonUser()
    @Get()
    async getByQuery(@Query() query: GetSongQuery, @User() user){
        return formatted(await this.songsService.processGetQuery(query, user));
    }
    @AllowNonUser()
    @Get("search")
    async getBySearch(@Query() query: SearchQuery, @User() user){
        return formatted(await this.songsService.search(query.searchKey, user, query.page))
    }

    @AllowNonUser()
    @Get("list")
    async getList(@Query() query: ListQuery){
        return formatted(await this.songsService.list(query.page));
    }

    @AllowNonUser()
    @Get("count")
    async getSongsCount(){
        return formatted({count: await this.songsService.getCount()});
    }

    @AllowNonUser()
    @Get("data/:guid")
    async getSongData(@Param() {guid}: {guid:string}){
        return await this.songsService.gatherSongData(guid);
    }

    @Post()
    async addSongData(@Body() data: any, @User() user : UserObject){
        return this.addService.processNewSongData(data, user);
    }

    @Post("variant/verify/:guid")
    async verify(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin) && (user.role!=ROLES.Trustee))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.verifyVariantByGUID(guid);
        if(result.affected>0)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }

    @Post("variant/unverify/:guid")
    async unverify(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.unverifyVariantByGUID(guid);
        if(result.affected>0)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }

    @Post("variant/delete/:guid")
    async delete(@Param() {guid}: {guid:string}, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            return formatted(null, codes.Unauthorized);

        const result = await this.songsService.deleteVariantByGUID(guid);
        if(result)
            return formatted(null);
        return formatted(null, codes["Unknown Error"]);
    }

}