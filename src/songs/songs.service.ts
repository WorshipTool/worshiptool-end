import { Inject, Injectable } from "@nestjs/common";
import { SongService } from "./services/song.service";
import { GetSongQuery, GetSongResult, NewSongData, NewSongDataProcessResult, SongData } from "./dtos";
import { RequestResult, codes, formatted } from "src/utils/formatted";
import { CreatorService } from "./services/creator.service";

@Injectable()
export class SongsService{
    constructor(
        private songService: SongService,
        private creatorService: CreatorService
    ){}


    async processGetQuery(query: GetSongQuery): Promise<GetSongResult>{
        switch(query.key){
            case "search":
                const searched = await this.songService.search(query.body);
                return {guids: searched.map((s)=>s.guid)};
            case "all":
                const all = await this.songService.search("");
                return {guids: all.map((s)=>s.guid)};
            case "random":
                const random = await this.songService.random(query.count);
                return {guids: random.map((s)=>s.guid)};
            case "unverified":
                const unverified = await this.songService.getUnverified();
                return {guids: unverified.map((s)=>s.guid)}
            default:
              return {guids: []}
        }
          
    }

    async gatherSongData(guid: string): Promise<RequestResult<SongData>>{
        const song = await this.songService.findByGUID(guid);

        if(song==null) return formatted(null, codes["Not Found"]);

        const titles = await this.songService.getTitlesBySongGUID(song.guid);

        const mainTitleObject = titles.find((v)=>song.mainNameGUID==v.guid);
        if(mainTitleObject===undefined){
            return formatted(null, codes["Unknown Error"], "Title not found.");
        }

        const mainTitle = mainTitleObject.name;

        const variantObjects = await this.songService.findVariantsBySongGUID(song.guid);
        const variants = variantObjects.map((v)=>{
            const titleObject = titles.find((t)=>t.guid==v.mainNameGUID);
            if(titleObject===undefined){
                return undefined;
            }
            return {
                guid: v.guid,
                prefferedTitle: titleObject.name,
                sheetData: v.sheet,
                sheetText: v.sheetText
            }
        })

        if(variants.filter((v)=>v===undefined).length>0){
            return formatted(null, codes["Unknown Error"], "Title for variant not found.");
        }

        const variantGUIDs : string[] = variantObjects.map((v)=>v.guid);

        const creators = await this.creatorService.findAllBySVGUIDs(song.guid, variantGUIDs);


        return formatted<SongData>({
            guid:song.guid,
            mainTitle,
            alternativeTitles: titles.map((t)=>t.name),
            creators,
            variants
        })

    }

    async processNewSongData(data: NewSongData):Promise<NewSongDataProcessResult>{
        const guid = await this.songService.createNewSong(data);
        return {
            guid,
            message: "New song added."
        }
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