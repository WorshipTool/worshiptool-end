import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { codes, formatted } from "src/utils/formatted";
import { GetSongQuery, SearchQuery, ListQuery, PostMergeBody, PostRenamePlaylistBody } from './dtos';
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { User } from "src/auth/decorators/user.decorator";
import { ROLES, User as UserObject } from "src/database/entities/user.entity";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { AddSongDataService } from "./services/adding/add.service";
import { GetSongsInPlaylistParams, PostCreatePlaylistBody, PostAddVariantToPlaylistBody, GetIsVariantInPlaylistQuery, PostDeletePlaylistBody, DeletePlaylistQuery, DeleteRemoveVariantFromPlaylistQuery, GetSearchInPlaylistQuery, PostReorderPlaylistBody, PostTransposePlaylistItemBody } from './services/playlists/dtos';
import { query } from "express";
import { AllowOnlyAdmin } from "src/auth/decorators/allowonlyadmin.decorator";
import { PlaylistService } from "./services/playlists/playlist.service";
import { Chord } from "@pepavlin/sheet-api";

@Controller("songs")
export class SongsController{

    constructor(
        private songsService: SongsService,
        private addService: AddSongDataService,
        private playlistService: PlaylistService
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

    @Delete("playlist")
    async deletePlaylistByGuid(@Query() params: DeletePlaylistQuery, @User() user: UserObject){
        return await this.songsService.deletePlaylist(params.guid, user);
    }

    @AllowNonUser()
    @Get("playlist")
    async getSongsInPlaylistByGuid(@Query() query: GetSongsInPlaylistParams){
        return this.songsService.getVariantsInPlaylist(query.guid);
    }

    @Post("playlist/add")
    async addVariantToPlaylist(@Body() body: PostAddVariantToPlaylistBody, @User() user: UserObject){
        if(body.variant===undefined || body.playlist===undefined)
            return formatted(undefined, codes["Bad Request"], "Variant or playlist is undefined");
        return this.songsService.addVariantToPlaylist(body.variant, body.playlist, user);
    }
    @Post("playlist/remove")
    async removeVariantFromPlaylist(@Body() body: DeleteRemoveVariantFromPlaylistQuery, @User() user: UserObject){
        return this.songsService.removeVariantFromPlaylist(body.variant, body.playlist, user)
    }

    @Delete("playlist/remove")
    async removeVariantFromPlaylistDelete(@Query() query: DeleteRemoveVariantFromPlaylistQuery, @User() user: UserObject){
        return this.songsService.removeVariantFromPlaylist(query.variant, query.playlist, user)
    }

    @Post("playlist/rename")
    async renamePlaylist(@Body() body: PostRenamePlaylistBody, @User() user: UserObject){
        return this.playlistService.renamePlaylist(body.guid, body.title, user);
    }

    @Get("isinplaylist")
    async isVariantInPlaylist(@Query() query: GetIsVariantInPlaylistQuery){
        return this.songsService.isVariantInPlaylist(query.variant, query.playlist);
    }

    @AllowOnlyAdmin()
    @Get("variant/random")
    async getRandomVariant(){
        return formatted(await this.songsService.getRandomVariant());
    }

    @Get("playlist/search")
    async searchInPlaylist(@Query() params: GetSearchInPlaylistQuery, @User() user: UserObject){
        return await this.playlistService.searchInPlaylist(params.guid, params.searchKey, params.page, user);
    }

    @Post("playlist/reorder")
    async reorderPlaylist(@Body() body: PostReorderPlaylistBody, @User() user: UserObject){
        return await this.playlistService.reorderPlaylist(body.guid, body.items, user);
    }

    @Post("playlist/item/transpose")
    async transposePlaylistItem(@Body() body: PostTransposePlaylistItemBody, @User() user: UserObject){
        return await this.playlistService.transposePlaylistItem(body.guid, body.key, user);
    }


}