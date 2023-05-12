import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, SearchQuery, ListQuery, PostMergeBody } from './dtos';
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { User } from "src/auth/decorators/user.decorator";
import { ROLES, User as UserObject } from "src/database/entities/user.entity";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { AddSongDataService } from "./services/adding/add.service";
import { GetSongsInPlaylistParams, PostCreatePlaylistBody, PostAddVariantToPlaylistBody, GetIsVariantInPlaylistQuery, DeleteRemoveVariantFromPlaylistBody as PostRemoveVariantFromPlaylistBody, PostDeletePlaylistBody } from './services/playlists/dtos';
import { query } from "express";

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

    @AllowNonUser()
    @Post("merge")
    async mergeTwoVariants(@Body() {guid1, guid2}:PostMergeBody){
        return this.songsService.mergeByGuids(guid1, guid2);
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

    @Get("playlists")
    async getPlaylistsOfUser(@User() user: UserObject){
        return await this.songsService.getPlaylistsByUser(user);
    }

    @Post("playlist")
    async createPlaylist(@Body() body: PostCreatePlaylistBody, @User() user: UserObject){
        if(body.title===undefined) body.title = "Playlist name";
        return await this.songsService.createPlaylist(body, user);
    }

    @Post("deleteplaylist")
    async deletePlaylist(@Body() body: PostDeletePlaylistBody, @User() user: UserObject){
        return await this.songsService.deletePlaylist(body.guid, user);
    }

    @AllowNonUser()
    @Get("playlist/:guid")
    async getSongsInPlaylist(@Param() param: GetSongsInPlaylistParams){
        return this.songsService.getSongsInPlaylist(param.guid);
    }

    @Post("playlist/add")
    async addVariantToPlaylist(@Body() body: PostAddVariantToPlaylistBody, @User() user: UserObject){
        return this.songsService.addVariantToPlaylist(body.variant, body.playlist, user);
    }
    @Post("playlist/remove")
    async removeVariantFromPlaylist(@Body() body: PostRemoveVariantFromPlaylistBody, @User() user: UserObject){
        return this.songsService.removeVariantFromPlaylist(body.variant, body.playlist, user)
    }

    @Get("isinplaylist")
    async isVariantInPlaylist(@Query() query: GetIsVariantInPlaylistQuery){
        return this.songsService.isVariantInPlaylist(query.variant, query.playlist);
    }


}