import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SimilarVariantService } from "./similar.variant.service";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { Song } from "../../database/entities/song.entity";
import { In, Repository } from "typeorm";
import { SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SONG_NAMES_REPOSITORY, SOURCE_REPOSITORY } from "../../database/constants";
import { SongTitle } from "../../database/entities/songtitle.entity";
import normalizeSearchText from "../../tech/normalizeSearchText";
import { Sheet } from "@pepavlin/sheet-api";
import { User } from "../../database/entities/user.entity";
import { SongDataSource } from "../services/adding/add.dto";
import { Source } from "../../database/entities/source.entity";
import { SongAddingTechService } from "./song.adding.tech.service";

type CreateVariantInDto = {
    title: string,
    sheetData: string,
    source?: SongDataSource

}

@Injectable()
export class SongAddingService{

    constructor(
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        @Inject(SONG_NAMES_REPOSITORY)
        private nameRepository: Repository<SongTitle>, 
        @Inject(SOURCE_REPOSITORY)
        private sourceRepository: Repository<Source>, 

        private techService: SongAddingTechService
    ){}

    /**
     * Creates completely new variant in new song
     * @param data title and sheet data
     * @returns created variant or null if failed
     */
    async createVariant(data: CreateVariantInDto, user: User, print: boolean = false) : Promise<SongVariant>{
        if(print) console.log("Creating new variant with data: ", data)

        if(!this.techService.isSheetDataValid(data.sheetData)){
            throw new NotFoundException("Sheet data is not valid.");
        }


        // Creates new song
        const songGuid: string = (await this.songRepository.insert({})).identifiers[0].guid;
        const song : Song = await this.songRepository.findOne({where:{guid:songGuid}});
        if(song===null){
            throw new NotFoundException("Song not found.");
        }

        
        //Create title at first

        const titleData : SongTitle = {
            guid:undefined,
            variant: undefined,
            title: data.title,
            searchValue: normalizeSearchText(data.title)
        }
        const titleGuid = (await this.nameRepository.insert(titleData)).identifiers[0].guid;
        const title = await this.nameRepository.findOne({where:{guid:titleGuid}});

        song.mainTitle = title;
        this.songRepository.save(song);




        let sources : Source[] = [];
        if(data.source){
            const r = await this.sourceRepository.insert(data.source);
            const guid = r.identifiers[0].guid;
            sources = await this.sourceRepository.find({where:{guid}})
        }


        const sheet = new Sheet(data.sheetData);
        let sheetText = normalizeSearchText(sheet.getText());

        const variantData : SongVariant = {
            guid: undefined,
            song, 
            sheetData: data.sheetData,
            searchValue: sheetText,
            prefferedTitle: title,
            verified: false, 
            createdBy: user,
            links: [],
            titles:[title],
            sources:sources,
            toneKey: null,
            type: null,
            playlistItems: [],
            deleted: false
        };
        const variantGuid : string = (await this.variantRepository.insert(variantData)).identifiers[0].guid;
        const variant : SongVariant = await this.variantRepository.findOne({
            where:{
                guid:variantGuid
            }
        });

        // Attach variant to title
        title.variant = variant;
        await this.nameRepository.save(title);
    

        await this.sourceRepository.update({
            guid: In(sources.map((s)=>s.guid))
        },{variant: variant});
      

        return variant;
    }

    /**
     * 
     * @param variant variant to join to song
     * @param song song to join variant to, must contains guid
     * @returns joined variant or null if failed
     */
    joinVariantToSong(variant: SongVariant, song: Song) : SongVariant{
        console.log("Joining variant to song: ", variant.guid, song.guid)
        return null;
    }

    
}