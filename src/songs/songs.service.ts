import { Inject, Injectable } from "@nestjs/common";
import { SongService } from "./services/song.service";
import { GetSongQuery, GetSongResult, SearchResult, SongData, SongDataVariant, ListResult } from './dtos';
import { RequestResult, codes, formatted } from "src/utils/formatted";
import { CreatorService } from "./services/creator.service";
import { ROLES, User } from "src/database/entities/user.entity";
import { MessengerService } from "src/messenger/messenger.service";
import { MediaService } from "./services/media.service";
import { Song } from "src/database/entities/song.entity";

@Injectable()
export class SongsService{
    constructor(
        private songService: SongService,
        private creatorService: CreatorService,
        private messengerService: MessengerService,
        private mediaService: MediaService
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


        const titles = await this.songService.getTitlesBySong(song);

        const mainTitleObject = titles.find((v)=>JSON.stringify(song.mainName)==JSON.stringify(v));


        const variantObjects = await this.songService.findVariantsBySong(song);
        const variants : SongDataVariant[] = await Promise.all(variantObjects.map(async (v)=>{
            const titleObject = titles.find((t)=>JSON.stringify(t)==JSON.stringify(v.mainTitle));

            const creators = await this.creatorService.findAllByVariant(v);
            return {
                guid: v.guid,
                prefferedTitle: titleObject?titleObject.name:null,
                sheetData: v.sheetData,
                sheetText: v.searchValue,
                verified: v.verified,
                createdBy: v.createdBy.guid,
                createdByLoader: v.createdBy.role==ROLES.Loader,
                sources: v.sources,
                creators
            }
        }));

        // if(variants.filter((v)=>v===undefined).length>0){
        //     return formatted(null, codes["Unknown Error"], "Title for variant not found.");
        // }

        const songCreators = await this.creatorService.findAllBySong(song);

        const media = await this.mediaService.findAllBySong(song);


        return formatted<SongData>({
            guid:song.guid,
            mainTitle: mainTitleObject?mainTitleObject.name:undefined,
            alternativeTitles: titles.map((t)=>t.name),
            creators:songCreators,
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
}