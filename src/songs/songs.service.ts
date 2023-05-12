import { Inject, Injectable } from "@nestjs/common";
import { SongService } from "./services/song.service";
import { GetSongQuery, GetSongResult, SearchResult, SongData, SongDataVariant, ListResult, PostMergeResult } from './dtos';
import { RequestResult, codes, formatted } from "src/utils/formatted";
import { CreatorService } from "./services/creator.service";
import { ROLES, User } from "src/database/entities/user.entity";
import { MessengerService } from "src/messenger/messenger.service";
import { MediaService } from "./services/media.service";
import { Song } from "src/database/entities/song.entity";
import { GetPlaylistsResult, PostCreatePlaylistBody, PostCreatePlaylistResult } from './services/playlists/dtos';
import { PlaylistService } from './services/playlists/playlist.service';

@Injectable()
export class SongsService{
    constructor(
        private songService: SongService,
        private creatorService: CreatorService,
        private messengerService: MessengerService,
        private mediaService: MediaService,
        private playlistService: PlaylistService
    ){}


    async processGetQuery(query: GetSongQuery, user: User): Promise<GetSongResult>{
        if(query.page===undefined)query.page=0;

        let songs : Song[] = [];
        switch(query.key){
            case "random":
                songs = await this.songService.random(query.page);
                break;
            case "unverified":
                songs = await this.songService.getUnverified();
                break;
            case "loaderUnverified":
                songs = await this.songService.getLoaderUnverified();
                break;
            default:
                break;
        }

        return{songs: await Promise.all( songs.map(async (s)=>{
            return (await this.gatherSongData(s.guid)).data;
        }))};
          
    }

    async search(searchKey: string, user : User, page: number): Promise<SearchResult>{
        if(page===undefined)page=0;
        return {songs: await this.songService.search(searchKey, user, page)}
    }

    async list(page:number) : Promise<ListResult>{
        if(page===undefined)page=0;

        return {songs: await this.songService.list(page)};
    }

    async gatherSongData(guid: string): Promise<RequestResult<SongData>>{
        const song = await this.songService.findByGUID(guid);

        if(song==null) return formatted(null, codes["Not Found"]);



        const mainTitleObject = song.mainTitle;


        const variantObjects = await this.songService.findVariantsBySong(song);
        const variants : SongDataVariant[] = await Promise.all(variantObjects.map(async (v)=>{
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
                creators
            }
        }));

        const media = await this.mediaService.findAllBySong(song);


        return formatted<SongData>({
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
    async deleteVariantByGUID(guid:string){
        return await this.songService.deleteVariantByGUID(guid);
    }

    async mergeByGuids(guid1:string, guid2:string) : Promise<RequestResult<PostMergeResult>>{
        if(guid1===guid2) return formatted(undefined, codes["Unknown Error"], "Guids are the same.");

        const result = await this.songService.mergeByGuids(guid1, guid2);
        if(!result){
            return formatted(undefined, codes["Unknown Error"], "Cant merge this two songs");
        }

        return formatted({guid: result}, codes["Success"]);
    }

    async getPlaylistsByUser(user: User) : Promise<RequestResult<GetPlaylistsResult>>{
        const pls = await this.playlistService.getPlaylistByUser(user);
        return formatted(pls, codes["Success"])
    }

    async createPlaylist(body: PostCreatePlaylistBody,user: User) : Promise<RequestResult<PostCreatePlaylistResult>>{
        const result = await this.playlistService.createPlaylist(body, user);
        return formatted(result, codes.Success);
    }

    async deletePlaylist(guid:string, user:User){
        return await this.playlistService.deletePlaylist(guid, user);
    }   
    
    async getSongsInPlaylist(guid: string){
        return await this.playlistService.getSongsInPlaylist(guid);
    }

    async addVariantToPlaylist(variantGuid:string, playlistGuid:string, user: User){
        return await this.playlistService.addVariantToPlaylist(variantGuid, playlistGuid, user);
    }
    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user: User){
        return await this.playlistService.removeVariantFromPlaylist(variantGuid, playlistGuid, user);
    }

    async isVariantInPlaylist(variant:string, playlist:string){
        return await this.playlistService.isVariantInPlaylist(variant, playlist);
    }
}