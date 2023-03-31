import { Inject, Injectable } from "@nestjs/common";
import { SongService } from "./services/song.service";
import { GetSongQuery, GetSongResult, SongData, SongDataVariant } from "./dtos";
import { RequestResult, codes, formatted } from "src/utils/formatted";
import { CreatorService } from "./services/creator.service";
import { ROLES, User } from "src/database/entities/user.entity";
import { MessengerService } from "src/messenger/messenger.service";
import { MediaService } from "./services/media.service";

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

        switch(query.key){
            case "search":
                const searched = await this.songService.search(query.searchKey, user, query.page);
                return {songs:  await Promise.all( searched.map(async (s)=>{
                    return (await this.gatherSongData(s.guid)).data;
                }))};
            case "random":
                const random = await this.songService.random(query.page);
                return {songs:  await Promise.all( random.map(async (s)=>{
                    return (await this.gatherSongData(s.guid)).data;
                }))};
            case "all":
                const all = await this.songService.search("", user, query.page);
                return {songs:  await Promise.all( all.map(async (s)=>{
                    return (await this.gatherSongData(s.guid)).data;
                }))};
            case "unverified":
                const unverified = await this.songService.getUnverified();
                return {songs:  await Promise.all( unverified.map(async (s)=>{
                    return (await this.gatherSongData(s.guid)).data;
                }))};
            case "loaderUnverified":
                const loaderUnverified = await this.songService.getLoaderUnverified();
                return {songs:  await Promise.all( loaderUnverified.map(async (s)=>{
                    return (await this.gatherSongData(s.guid)).data;
                }))};
            default:
              return {songs: []}
        }
          
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