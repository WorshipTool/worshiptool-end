import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiNotFoundResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiConflictResponse, ApiForbiddenResponse, ApiResponse, ApiServiceUnavailableResponse, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { AllowNonUser } from "../auth/decorators/allownonuser.decorator";
import { AllowOnlyAdmin } from "../auth/decorators/allowonlyadmin.decorator";
import { User as UserObject, ROLES } from "../database/entities/user.entity";
import { AddSongDataService } from "./services/adding/add.service";
import { ParserSongDataResult } from "./services/parser/parser.dto";
import { ParserService } from "./services/parser/parser.service";
import { PostCreatePlaylistBody, DeletePlaylistQuery, GetSongsInPlaylistParams, PostAddVariantToPlaylistBody, DeleteRemoveVariantFromPlaylistQuery, GetIsVariantInPlaylistQuery, GetSearchInPlaylistQuery, PostReorderPlaylistBody, PostTransposePlaylistItemBody } from "./modules/playlists/playlist.dto";
import { PlaylistService } from "./modules/playlists/playlist.service";
import { GetSongQuery, SearchQuery, ListQuery, GetCountResult, GetSongDataParam, PostMergeBody, PostAddSongDataBody, PostVerifyVariantParams, PostRenamePlaylistBody, GetSongListOfUserResult, PostEditVariantBody } from "./songs.dto";
import { SongsService } from "./songs.service";
import { User } from "../auth/decorators/user.decorator";
import {v4} from "uuid";
import * as fs from "fs";

@ApiTags("Songs")
@Controller("songs")
export class SongsController{

    constructor(
        private songsService: SongsService,
        private addService: AddSongDataService,
        private playlistService: PlaylistService,
        private parserService: ParserService
    ){}

    /**
     * The function returns a list of songs by the given query.
     * @param {GetSongQuery} query - The parameter `query` is of type `GetSongQuery`.
     * @returns a formatted response with the list of songs.
     */
    @ApiOperation({summary: "Returns a list of songs by the given query."})
    @AllowNonUser()
    @Get()
    async getByQuery(@Query() query: GetSongQuery){
        return await this.songsService.processGetQuery(query);
    }

    
    /**
     * The function returns a list of songs by the given search query.
     * @param {SearchQuery} query - The parameter `query` is of type `SearchQuery`.
     * @returns a formatted response with the list of songs.
    */
    @ApiOperation({summary: "Returns a list of songs by the given search query."})
    @AllowNonUser()
    @Get("search")
    async getBySearch(@Query() query: SearchQuery, @User() user){
        return await this.songsService.search(query.searchKey, user, query.page)
    }


    /**
     * The function returns a list of public songs by the given page.
     * @param {ListQuery} query - The parameter `query` is of type `ListQuery`.
     * @returns a formatted response with the list of songs.
     */
    @ApiOperation({summary: "Returns a list of public songs by the given page."})
    @AllowNonUser()
    @Get("list")
    async getList(@Query() query: ListQuery){
        return (await this.songsService.list(query.page));
    }


    /**
     * The function returns a count of all songs in the database.
     * @returns a formatted response with the count of songs.
     */
    @ApiOperation({summary: "Returns a count of all songs in the database."})
    @AllowNonUser()
    @Get("count")
    async getSongsCount(){
        const r : GetCountResult = {count: await this.songsService.getCount()};
        return r;
    }


    /**
     * The function gather all data of a song by the given song guid.
     * @param {string} guid - The parameter `guid` is of type `string`.
     * @returns a formatted response with the song data.
     */
    @ApiOperation({summary: "Gathers all data of a song by the given song guid."})
    @ApiNotFoundResponse({
        description: "The song with the given guid has not been found."
    })
    @AllowNonUser()
    @Get("data/:guid")
    async getSongData(@Param() {guid}: GetSongDataParam){
        return await this.songsService.gatherSongData(guid);
    }


    /**
     * The function merges two variants of a song by the given guids.
     * @param {PostMergeBody} body - The parameter `body` is of type `PostMergeBody`.
     * @returns a formatted response with the guid of the merged variant.
     */
    @ApiOperation({summary: "Merges two variants of a song by the given guids."})
    @ApiBadRequestResponse({
        description: "The variants cannot be merged."
    })
    @AllowNonUser()
    @Post("merge")
    async mergeTwoVariants(@Body() {guid1, guid2}:PostMergeBody){
        return this.songsService.mergeByGuids(guid1, guid2);
    }


    /**
     * The function adds a new song to the database.
     * @param {PostAddSongDataBody} data - The parameter `data` is of type `PostAddSongDataBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     */
    @ApiOperation({summary: "Adds a new song to the database. Or updates an existing one."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to add new song data."
    })
    @ApiNotFoundResponse({
        description: "The song has not been found."
    })
    @ApiBearerAuth()
    @Post()
    async addSongData(@Body() data: PostAddSongDataBody, @User() user : UserObject){
        return this.addService.processNewSongData(data, user);
    }


    /**
     * The function verifies a variant by the given guid.
     * @param {string} guid - The parameter `guid` is of type `string`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the verification.
     */
    @ApiOperation({summary: "Verifies a variant by the given guid."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to verify the variant. Only admins and trustees can verify variants."
    })
    @ApiBadRequestResponse({
        description: "Variant is already verified."
    })
    @ApiNotFoundResponse({
        description: "Variant has not been found."
    })
    @ApiBearerAuth()
    @Post("variant/verify/:guid")
    async verify(@Param() p: PostVerifyVariantParams, @User() user : UserObject){
        if((user.role!=ROLES.Admin) && (user.role!=ROLES.Trustee))
            throw new UnauthorizedException("Only admins and trustees can verify variants.");

        await this.songsService.verifyVariantByGUID(p.guid);
        return true
    }

    /**
     * The function unverifies a variant by the given guid.
     * @param {string} guid - The parameter `guid` is of type `string`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the unverification.
     */
    @ApiOperation({summary: "Unverifies a variant by the given guid."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to unverify the variant. Only admins can unverify variants."
    })
    @ApiBadRequestResponse({
        description: "Variant is already unverified."
    })
    @ApiNotFoundResponse({
        description: "Variant has not been found."
    })
    @ApiBearerAuth()
    @Post("variant/unverify/:guid")
    async unverify(@Param() {guid}: PostVerifyVariantParams, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            throw new UnauthorizedException("Only admins can unverify variants.");

        await this.songsService.unverifyVariantByGUID(guid);
        return true
    }


    




    /**
     * The function returns a list of playlists of the given user.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response with the list of playlists.
     */
    @ApiOperation({summary: "Returns a list of playlists of the given user."})
    @ApiUnauthorizedResponse({
        description: "The user is not logged in."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Get("playlists")
    async getPlaylistsOfUser(@User() user: UserObject){
        return await this.songsService.getPlaylistsByUser(user);
    }


    /**
     * The function creates a new empty playlist.
     * @param {PostCreatePlaylistBody} body - The parameter `body` is of type `PostCreatePlaylistBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response with the guid of the created playlist.
     */
    @ApiOperation({summary: "Creates a new empty playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not logged in."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Post("playlist")
    async createPlaylist(@Body() body: PostCreatePlaylistBody, @User() user: UserObject){
        if(body.title===undefined) body.title = "Playlist name";
        return await this.songsService.createPlaylist(body, user); 
    }


    /**
     * The function deletes a playlist by the given guid.
     * @param {DeletePlaylistQuery} params - The parameter `params` is of type `DeletePlaylistQuery`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the deletion.
     */
    @ApiOperation({summary: "Deletes a playlist by the given guid."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to delete the playlist."
    })
    @ApiNotFoundResponse({
        description: "Playlist has not been found."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Delete("playlist")
    async deletePlaylistByGuid(@Query() params: DeletePlaylistQuery, @User() user: UserObject){
        return await this.songsService.deletePlaylist(params.guid, user);
    }



    /**
     * The function returns a list of variants in the given playlist.
     * @param {GetSongsInPlaylistParams} query - The parameter `query` is of type `GetSongsInPlaylistParams`.
     * @returns a formatted response with the list of variants.
     */
    @ApiOperation({summary: "Returns a list of variants in the given playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to get the variants."
    })
    @ApiNotFoundResponse({
        description: "Playlist has not been found."
    })
    @AllowNonUser()
    @ApiTags("Playlists")
    @Get("playlist")
    async getSongsInPlaylistByGuid(@Query() query: GetSongsInPlaylistParams){
        return this.songsService.getVariantsInPlaylist(query.guid);
    }


    /**
     * The function adds a variant to a playlist.
     * @param {PostAddVariantToPlaylistBody} body - The parameter `body` is of type `PostAddVariantToPlaylistBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the addition.
     */
    @ApiOperation({summary: "Adds a variant to a playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to add the variant to the playlist."
    })
    @ApiNotFoundResponse({
        description: "Variant or playlist has not been found."
    })
    @ApiBadRequestResponse({
        description: "Variant or playlist is undefined."
    })
    @ApiForbiddenResponse({
        description: "Playlist has no owner."
    })
    @ApiResponse({
        status: 409,
        description: "Variant already exists in playlist."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Post("playlist/add")
    async addVariantToPlaylist(@Body() body: PostAddVariantToPlaylistBody, @User() user: UserObject){
        if(body.variant===undefined || body.playlist===undefined)
            throw new BadRequestException("Variant or playlist is undefined");
        return this.songsService.addVariantToPlaylist(body.variant, body.playlist, user);
    }


    /**
     * The function removes a variant from a playlist.
     * @param {DeleteRemoveVariantFromPlaylistQuery} body - The parameter `body` is of type `DeleteRemoveVariantFromPlaylistQuery`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the removal.
     */
    @ApiOperation({summary: "Removes a variant from a playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to remove the variant from the playlist."
    })
    @ApiNotFoundResponse({
        description: "Variant or playlist has not been found (in playlist)."
    })
    @ApiBadRequestResponse({
        description: "Variant or playlist is undefined."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Delete("playlist/remove")
    async removeVariantFromPlaylistDelete(@Query() query: DeleteRemoveVariantFromPlaylistQuery, @User() user: UserObject){
        return this.songsService.removeVariantFromPlaylist(query.variant, query.playlist, user)
    }


    /**
     * The function renames a playlist.
     * @param {PostRenamePlaylistBody} body - The parameter `body` is of type `PostRenamePlaylistBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the renaming.
     */
    @ApiOperation({summary: "Renames a playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to rename the playlist."
    })
    @ApiNotFoundResponse({
        description: "Playlist has not been found."
    })
    @ApiBadRequestResponse({
        description: "Guid or title is undefined."
    })
    @ApiBearerAuth()
    @ApiTags("Playlists")
    @Post("playlist/rename")
    async renamePlaylist(@Body() body: PostRenamePlaylistBody, @User() user: UserObject){
        return this.playlistService.renamePlaylist(body.guid, body.title, user);
    }


    /**
     * The function checks if a variant is in a playlist.
     * @param {GetIsVariantInPlaylistQuery} query - The parameter `query` is of type `GetIsVariantInPlaylistQuery`.
     * @returns a formatted response indicating the success of the check.
     */
    @ApiOperation({summary: "Checks if a variant is in a playlist."})
    @AllowNonUser()
    @ApiTags("Playlists")
    @Get("isinplaylist")
    async isVariantInPlaylist(@Query() query: GetIsVariantInPlaylistQuery){
        return this.songsService.isVariantInPlaylist(query.variant, query.playlist);
    }


    /**
     * The function returns a random variant.
     * @returns a formatted response with the random variant.
     */
    @ApiOperation({summary: "Returns a random variant."})
    @AllowOnlyAdmin()
    @Get("variant/random")
    async getRandomVariant(){
        return (await this.songsService.getRandomVariant());
    }


    /**
     * The function searches in a playlist.
     * @param {GetSearchInPlaylistQuery} params - The parameter `params` is of type `GetSearchInPlaylistQuery`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response with the list of variants.
     */
    @ApiOperation({summary: "Searches in a playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to search in the playlist."
    })
    @ApiBadRequestResponse({
        description: "Guid is undefined."
    })
    @ApiBearerAuth()
    @Get("playlist/search")
    async searchInPlaylist(@Query() params: GetSearchInPlaylistQuery, @User() user: UserObject){
        const result =  await this.playlistService.searchInPlaylist(params.guid, params.searchKey, params.page, user);
        return result;
    }


    /**
     * The function reorders a playlist.
     * @param {PostReorderPlaylistBody} body - The parameter `body` is of type `PostReorderPlaylistBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the reordering.
     */
    @ApiOperation({summary: "Reorders a playlist."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to reorder the playlist."
    })
    @ApiNotFoundResponse({
        description: "Playlist has not been found."
    })
    @ApiBadRequestResponse({
        description: "Playlist or items are undefined, out of range or not unique."
    })
    @ApiBearerAuth()
    @Post("playlist/reorder")
    async reorderPlaylist(@Body() body: PostReorderPlaylistBody, @User() user: UserObject){
        return await this.playlistService.reorderPlaylist(body.guid, body.items, user);
    }


    /**
     * The function transposes a playlist item.
     * @param {PostTransposePlaylistItemBody} body - The parameter `body` is of type `PostTransposePlaylistItemBody`.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response indicating the success of the transposition.
     */
    @ApiOperation({summary: "Transposes a playlist item."})
    @ApiUnauthorizedResponse({
        description: "The user is not authorized to transpose the playlist item."
    })
    @ApiNotFoundResponse({
        description: "Playlist item has not been found."
    })
    @ApiBadRequestResponse({
        description: "Guid or key is undefined."
    })
    @ApiBearerAuth()
    @Post("playlist/item/transpose")
    async transposePlaylistItem(@Body() body: PostTransposePlaylistItemBody, @User() user: UserObject){
        return await this.playlistService.transposePlaylistItem(body.guid, body.key, user);
    }


    /**
     * The function parse image to song.
     * @param {Express.Multer.File} file - The parameter `file` is of type `Express.Multer.File`.
     * @returns a formatted response with the parsed song.
     */
    @ApiOperation({summary: "Parse image to song."})
    @ApiBadRequestResponse({
        description: "No file provided."
    })
    @ApiServiceUnavailableResponse({
        description: "Parser is not available."
    })
    @Post("parse")
    @UseInterceptors(
        FileInterceptor('file', {
          storage: diskStorage({
            destination: 'public/temp',
            filename: (req, file, cb) => {
              cb(null, v4() + "."+file.originalname.split(".").pop());
            },
          }),
        })
    )
    @ApiBody({
        required: true,
        type: "multipart/form-data",
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
            },
          },
        },
      })
    @AllowNonUser()
    @ApiConsumes("multipart/form-data")
    async parse(@UploadedFile() file: Express.Multer.File) : Promise<ParserSongDataResult>{
        if(!file) throw new BadRequestException("No file provided");

        const result = await this.parserService.parse(file.path);

        try{
            fs.unlinkSync(file.path);
        }catch(e){
            console.log("Error while deleting file:", e);
        }

        return result;

    }


    /**
     * The function returns a list of songs created by given user.
     * @param {UserObject} user - The parameter `user` is of type `UserObject`.
     * @returns a formatted response with the list of songs.
     */
    @ApiOperation({summary: "Returns a list of songs created by given user."})
    @ApiUnauthorizedResponse({
        description: "The user is not logged in."
    })
    @ApiBearerAuth()
    @Get("mysongs")
    async getSongListOfUser(@User() user: UserObject) : Promise<GetSongListOfUserResult>{
        return {
            variants: await this.songsService.getSongListOfUser(user)
        };
    }

}