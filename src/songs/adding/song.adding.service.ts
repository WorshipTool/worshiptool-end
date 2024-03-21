import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreatedType, SongVariant } from "../../database/entities/songvariant.entity";
import { Song } from "../../database/entities/song.entity";
import { In, Repository } from "typeorm";
import { SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SONG_TITLE_REPOSITORY, SOURCE_REPOSITORY } from "../../database/constants";
import { SongTitle } from "../../database/entities/songtitle.entity";
import normalizeSearchText from "../../tech/normalizeSearchText";
import { Sheet } from "@pepavlin/sheet-api";
import { User } from "../../database/entities/user.entity";
import { SongDataSource } from "../services/adding/add.dto";
import { Source } from "../../database/entities/source.entity";
import { SongAddingTechService } from "./song.adding.tech.service";
import { SongTitleService } from "../modules/titles/song.title.service";

type CreateVariantInDto = {
    title: string,
    sheetData: string,
    source?: SongDataSource,
    createdType: CreatedType,
    parent?: SongVariant
}

@Injectable()
export class SongAddingService{

    constructor(
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        @Inject(SONG_TITLE_REPOSITORY)
        private nameRepository: Repository<SongTitle>, 
        @Inject(SOURCE_REPOSITORY)
        private sourceRepository: Repository<Source>, 
        private techService: SongAddingTechService,
        private titleService: SongTitleService
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
        const title = await this.titleService.createTitleObject(data.title)
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
            deleted: false,
            createdType: data.createdType,
            parent: data.parent,
            children: null
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

    /**
     * Creates copy of variant
     * @param variant variant to copy
     * @param user user who created copy
     * @returns created variant or null if failed
     */
    async createCopy(variant: SongVariant, user: User) : Promise<SongVariant>{
        const data : CreateVariantInDto = {
            title: variant.prefferedTitle.title,
            sheetData: variant.sheetData,
            createdType: variant.createdType,
            parent: variant
        }
        return await this.createVariant(data, user);
    }

    
}