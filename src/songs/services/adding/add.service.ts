import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ROLES, User } from "src/database/entities/user.entity";
import { NewSongData, NewSongDataProcessResult } from "./add.dto";
import { codes, formatted } from "src/utils/formatted";
import { SongService } from "../song.service";
import { MediaService } from "../media.service";
import { MessengerService } from "src/messenger/messenger.service";
import { SourceService } from "../source.service";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY, MEDIA_REPOSITORY, SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SOURCE_REPOSITORY, TAG_REPOSITORY } from "src/database/constants";
import { In, Repository } from "typeorm";
import { Song } from "src/database/entities/song.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { SongTitle } from "src/database/entities/songtitle.entity";
import { Source } from "src/database/entities/source.entity";
import { Media } from "src/database/entities/media.entity";
import { Tag } from "src/database/entities/tag.entity";
import { Creator, CreatorType } from "src/database/entities/creator.entity";
import { CSVLink } from "src/database/entities/csvlink.entity";
import checkMediaFormat from "src/utils/checkMediaFormat";
import { SongsService } from "src/songs/songs.service";
import normalizeSearchText from "src/utils/normalizeSearchText";
import { Sheet } from "@pepavlin/sheet-api";
import { RequestResult } from "src/utils/request.dto";

@Injectable()
export class AddSongDataService{
    constructor(
        
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        @Inject(SONG_NAMES_REPOSITORY)
        private nameRepository: Repository<SongTitle>,
        @Inject(SOURCE_REPOSITORY)
        private sourceRepository: Repository<Source>,
        @Inject(MEDIA_REPOSITORY)
        private mediaRepository: Repository<Media>,
        @Inject(TAG_REPOSITORY)
        private tagRepository: Repository<Tag>,
        @Inject(CREATOR_REPOSITORY)
        private creatorRepository: Repository<Creator>,
        @Inject(CSVLINK_REPOSITORY)
        private linkRepository: Repository<CSVLink>,
        private songService: SongService
    ){}

    async processNewSongData(data:Partial<NewSongData>, user:User) : Promise<NewSongDataProcessResult>{


        let songGuid = data.songGuid;

        let createdNew = data.songGuid===undefined;


    
        

        //create song
        if(!songGuid){

            //try find existing song
            const s = false;//await this.songService.getParentSongIfExists(data);
            if(s){
                // songGuid = s.guid;
                // createdNew=false;
            }else{
                const r = await this.songRepository.insert({});
                songGuid = r.identifiers[0].guid;
            }
        }

        //check if song exists
        let song : Song = await this.songRepository.findOne({where:{guid:songGuid}});
        if(song===null){
            throw new NotFoundException("Song not found.");
        }

        let variant = undefined;
        //create new variant
        if(data.sheetData||data.title||data.source){


            let title : SongTitle = null;
            if(data.title){
                const titleData : SongTitle = {
                    guid:undefined,
                    variant: undefined,
                    title: data.title,
                    searchValue: normalizeSearchText(data.title)
                }
                const titleGuid = await (await this.nameRepository.insert(titleData)).identifiers[0].guid;
                title = await this.nameRepository.findOne({where:{guid:titleGuid}});

                song.mainTitle = title;
                this.songRepository.save(song);
            }

            let sources : Source[] = [];
            if(data.source){
                const r = await this.sourceRepository.insert(data.source);
                const sourcesGuids = r.identifiers.map((i)=>i.guid);
                sources = await this.sourceRepository.find({
                    where:{
                        guid: In(sourcesGuids)
                    }
                })
            }

            let variantGuid : string = undefined;
            //find same variant
            if(data.sheetData){
                // const r = await this.songService.findMostSimilarVariant(data.sheetData);
                // if(r&&r.similarity>0.95){
                //     //found
                //     variantGuid = r.variant.guid;
                // }
            }

            if(!variantGuid){
                let sheetText = "";
                if(data.sheetData){
                    const sheet = new Sheet(data.sheetData);
                    const sections = sheet.getSections();
                    for(let i=0; i<sections.length; i++){
                        const t=sections[i].text;
                        if( t){
                            sheetText+=t;
                        }
                    }
                }
                sheetText = normalizeSearchText(sheetText);

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
                const variant : any = (await this.variantRepository.insert(variantData)).identifiers[0];
                variantGuid = variant.guid;
                title.variant = variant;
                await this.nameRepository.save(title);
            }
            
            variant = await this.variantRepository.findOne({where:{guid: variantGuid}, relations:{sources:true}});

            

          if(sources){
                await this.sourceRepository.update({guid: In(sources.map((s)=>s.guid))},{variant: variant});
          }
        }

        //add media
        if(data.media){


            for(let i=0; i<data.media.length; i++){
                const media = data.media[i];


                if(!checkMediaFormat(media)){
                    console.log("Media won't be inserted, because of wrong format of url.")
                }else{
                    const ex = await this.mediaRepository.findOne({where:{
                        ...media,
                        song:song
                    }});
                    if(!ex){
                        const r = await this.mediaRepository.insert({...media, song})
                    }else{
                        console.log("Same media in the song already exists.");
                    }
                }

            }
        }

        //add tags
        if(data.tags){
            for(let i=0; i<data.tags.length; i++){
                const tag = data.tags[i];

                let entity: Tag = await this.tagRepository.findOne({
                    where:{
                        value: tag
                    }
                })

                if(!entity){
                    const data = {
                        guid: undefined,
                        value: tag,
                        songs: []
                    }
                    entity = await this.tagRepository.save(data);
                }

                const s = await this.songRepository.findOne({where:{guid:songGuid},
                    relations:{
                        tags:true
                    }});
                await this.songRepository.save({...s, tags: s.tags?[...s.tags, entity]:[entity]})
            }
        }

        //add creators
        if(data.creators){
            for(let i=0; i<data.creators.length; i++){
                const creator = data.creators[i];

                let entity : Creator = await this.creatorRepository.findOne({
                    where:{
                        name: creator.name
                    }
                })

                if(!entity){
                    entity = {
                        guid: undefined,
                        name: creator.name,
                        links: []
                    }
                }

                await this.creatorRepository.save(entity);

                let link : CSVLink = {
                    guid: undefined,
                    creator: entity,
                    variant: variant,
                    type: creator.type
                }

                if(! (await this.linkRepository.findOne({where:link}))){
                    await this.linkRepository.save(link);
                }
            }
        }

        if(!createdNew){
            return ({
                guid: songGuid,
                message: "Data add to existing song."
            })
        }

        return ({            
            guid: songGuid,
            message: "New song created and filled with incoming data."
        });


        
    }


}