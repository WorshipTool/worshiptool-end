import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SongVariant } from "../database/entities/songvariant.entity";
import { User, ROLES } from "../database/entities/user.entity";
import { SongVariantDTO } from "../dtos/songvariant.dto";
import { MessengerService } from "../messenger/messenger.service";
import { CreatorService } from "./services/creator.service";
import { MediaService } from "./services/media.service";
import { GetPlaylistsResult, PostCreatePlaylistBody, PostCreatePlaylistResult } from "./modules/playlists/playlist.dto";
import { PlaylistService } from "./modules/playlists/playlist.service";
import { PlaylistUtilsService } from "./modules/playlists/playlistutils.service";
import { SongService } from "./services/song.service";
import { GetSongQuery, SearchResult, ListResult, SongData, SongDataVariant, PostMergeResult, PostEditVariantBody } from "./songs.dto";

@Injectable()
export class SongsService{
    constructor(
        private songService: SongService,
        private creatorService: CreatorService,
        private messengerService: MessengerService,
        private mediaService: MediaService,
        private playlistService: PlaylistService,
        private playlistUtilsService: PlaylistUtilsService
    ){}


    async processGetQuery(query: GetSongQuery): Promise<SearchResult>{
        
        let variants : SongVariant[] = [];
        switch(query.key){
            case "random":
                variants = await this.songService.random(0);
                break;
            case "unverified":
                variants = await this.songService.getUnverified();
                break;
            case "loaderUnverified":
                variants = await this.songService.getLoaderUnverified();
                break;
            default:
                break;
        }


        const songs = await Promise.all( variants.map(async (s)=>{
            const data = await this.songService.getVariantByGuid(s.guid);;
            return {
                guid: data.songGuid,
                variant: data
            }
        }));


        return {songs}
          
    }

    async search(searchKey: string, user : User, page: number): Promise<SearchResult>{
        if(page===undefined)page=0;
        return {songs: await this.songService.search({searchKey, page}, user)}
    }

    async list(page:number) : Promise<ListResult>{
        if(page===undefined)page=0;

        return {songs: await this.songService.list(page)};
    }

    async gatherSongData(guid: string): Promise<SongData>{
        const song = await this.songService.findByGUID(guid);

        if(song==null) throw new NotFoundException("Song not found");



        const mainTitleObject = song.mainTitle;


        const variantObjects = await this.songService.findVariantsBySong(song);
        const variants : SongDataVariant[] = await Promise.all(variantObjects.map(async (v) : Promise<SongDataVariant>=>{
            const titles = await this.songService.getTitlesByVariant(v);
            const titleObject = titles.find((t)=>JSON.stringify(t)==JSON.stringify(v.prefferedTitle));

            const creators = await this.creatorService.findAllByVariant(v);
            return {
                guid: v.guid,
                prefferedTitle: titleObject?titleObject.title:null,
                titles: titles.map((t)=>t.title),
                sheetData: v.sheetData,
                sheetText: v.searchValue,
                verified: v.verified,
                createdBy: v.createdBy.guid,
                createdByLoader: v.createdBy.role==ROLES.Loader,
                sources: v.sources,
                creators,
                deleted: v.deleted
            }
        }));

        const media = await this.mediaService.findAllBySong(song);


        return ({
            guid:song.guid,
            mainTitle: mainTitleObject?mainTitleObject.title:undefined,
            creators:[],
            variants,
            media,
            tags:song.tags?song.tags.map((t)=>t.value):[]

        })

    }

    async getCount(){
        return await this.songService.getCount();
    }


    async verifyVariantByGUID(guid:string){
        return await this.songService.verifyVariantByGUID(guid);
    }
    async unverifyVariantByGUID(guid:string){
        return await this.songService.unverifyVariantByGUID(guid);
    }

    async mergeByGuids(guid1:string, guid2:string) : Promise<PostMergeResult>{
        if(guid1===guid2) throw new BadRequestException("Cannot merge the same variant");

        const result = await this.songService.mergeByGuids(guid1, guid2);
        return {guid: result}
    }

    async getPlaylistsByUser(user: User) : Promise<GetPlaylistsResult>{
        const pls = await this.playlistService.getPlaylistByUser(user);
        return pls
    }

    async createPlaylist(body: PostCreatePlaylistBody,user: User) : Promise<PostCreatePlaylistResult>{
        const result = await this.playlistService.createPlaylist(body, user);
        return result;
    }

    async deletePlaylist(guid:string, user:User){
        return await this.playlistService.deletePlaylist(guid, user);
    }   
    
    async getVariantsInPlaylist(guid: string){
        return await this.playlistService.getVariantsInPlaylist(guid);
    }

    async addVariantToPlaylist(variantGuid:string, playlistGuid:string, user: User){
        return await this.playlistUtilsService.addVariantToPlaylist(variantGuid, playlistGuid, user);
    }
    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user: User){
        return await this.playlistUtilsService.removeVariantFromPlaylist(variantGuid, playlistGuid, user);
    }

    async isVariantInPlaylist(variant:string, playlist:string){
        return await this.playlistService.isVariantInPlaylist(variant, playlist);
    }

    async getRandomVariant(){
        return await this.songService.getRandomVariant();
    }

    async getSongListOfUser(user: User) : Promise<SongVariantDTO[]>{
        return await this.songService.getSongListOfUser(user);
    }

}