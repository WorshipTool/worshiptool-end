import { BadRequestException, ConflictException, Get, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Sheet } from "@pepavlin/sheet-api";
import { Repository, In, Like, Not } from "typeorm";
import { SONG_REPOSITORY, SONG_NAMES_REPOSITORY, SONG_VARIANTS_REPOSITORY, PLAYLIST_ITEMS_REPOSITORY, PLAYLIST_REPOSITORY } from "../../database/constants";
import { Playlist } from "../../database/entities/playlist.entity";
import { PlaylistItem } from "../../database/entities/playlistitem.entity";
import { Song } from "../../database/entities/song.entity";
import { SongTitle } from "../../database/entities/songtitle.entity";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { User, ROLES } from "../../database/entities/user.entity";
import { SongVariantDTO } from "../../dtos/songvariant.dto";
import { mapSourceToDTO } from "../../dtos/source.dto";
import normalizeSearchText from "../../tech/normalizeSearchText";
import { skipForPage, takePerPage } from "../contants";
import { SearchSongData, ListSongData, PostEditVariantBody } from "../songs.dto";
import { NewSongData } from "./adding/add.dto";
import { PlaylistUtilsService } from "./playlists/playlistutils.service";

@Injectable()
export class SongService{
    constructor(
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>,
        @Inject(SONG_NAMES_REPOSITORY)
        private nameRepository: Repository<SongTitle>,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        @Inject(PLAYLIST_ITEMS_REPOSITORY)
        private itemsRepository: Repository<PlaylistItem>,
        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,
        private playlistUtilsService: PlaylistUtilsService
    ){}

    async search({searchKey, page, playlist}: {searchKey: string, page: number, playlist?: string}, user:User): Promise<SearchSongData[]> {
        const key = normalizeSearchText(searchKey);

        if(key=="")return [];

        

        const playlistItems = await this.itemsRepository.find({
          where:{
            playlist:{
              guid: playlist
            }
          },
          relations:{
            variant:true
          }
        })

        const conditionsSame = {
            guid: playlist?
                In(playlistItems.map(i=>i.variant.guid))
                :
                undefined,
            deleted: false
        };

        const names = await this.nameRepository.find({
          where:{
            searchValue: Like(`%${key}%`),
            variant: [
              {
                verified:true,
                ...conditionsSame
              },
              {
                verified:user?user.role!=ROLES.Admin:true,
                ...conditionsSame
              },
              {
                createdBy: user,
                ...conditionsSame
              },
              {
                createdBy:{
                  role: ROLES.Loader
                },
                ...conditionsSame
              }
            ]
          },
          relations:{
            variant: {
              createdBy:true,
              song:true
            }
          },
          skip: skipForPage(page),
          take: takePerPage
        })


        const arr1 : SearchSongData[]  = await Promise.all(names.map(async (name)=>{
          return {
            guid: name.variant.song.guid,
            variant: await this.getVariantByGuid(name.variant.guid)
          }
          

        }));

        // Search by sheet data
        const variants = await this.variantRepository
        .find({                  
            where:[{
                searchValue: Like(`%${key}%`),
                verified: In([true,user?user.role!=ROLES.Admin:true]),
                ...conditionsSame
            },
            {
                searchValue: Like(`%${key}%`),
                createdBy:{
                role: ROLES.Loader
                },
                ...conditionsSame
            }, 
            {
                searchValue: Like(`%${key}%`),
                createdBy: user,
                ...conditionsSame
            }],
          relations:{
            song:true,
            prefferedTitle:true,
            createdBy:true
          },
            order:{
                createdBy: {
                    role: "DESC"
                }
            },
          skip: skipForPage(page),
          take: takePerPage
        })

        const arr2 : SearchSongData[] = await Promise.all(variants.map(async (v)=>({
          guid: v.song.guid,
          variant: await this.getVariantByGuid(v.guid)
        })));
      
        const merged = [...arr1, ...arr2];


        const uniq : SearchSongData[] = merged.reduce((acc, curr) => {
          const existingObj = acc.find((obj) => obj.guid === curr.guid);
          if (!existingObj) {
            acc.push(curr);
          } else {
            Object.assign(existingObj, curr);
          }
          return acc;
        }, []);

        return uniq;

        
    }

    async random(page:number) : Promise<SongVariant[]>{
        const variants = await this.variantRepository.find({
          where:{
            verified: true,
            deleted: false,
          },
          relations:{
            song:true,
          }
          
        }); 
        
        const random = variants.sort(()=>Math.random()-0.5)
        return random.slice(0, takePerPage);;
    }

    async list(page:number) : Promise<ListSongData[]>{
      const songs = await this.songRepository.find({
        where:{
          variants:[{
            verified:true,
            deleted:false
          },{
            createdBy: {
              role: ROLES.Loader
            }
          }]
        },
        relations: {
          variants:{
            createdBy:true
          },
          mainTitle:true
        },
        order:{
          mainTitle:{
            title:"ASC"
          }
        },
        take: takePerPage,
        skip: skipForPage(page)
      });

      const data: ListSongData[] = songs.map((s)=>{
        return {
          guid: s.guid,
          title: s.mainTitle.title
        }
      })
      return data;
    }

    async createEmptySong(): Promise<Song>{
      const r = await this.songRepository.insert({});
      const guid = r.identifiers[0].guid;
      
      return await this.songRepository.findOne({where:{guid}});
    }


    async findByGUID(guid:string) : Promise<Song>{
      return await this.songRepository.findOne({
        where:{
          guid
        },
        relations: {
          mainTitle: true,
          tags:true
        }
      })
    }

    async getTitlesByVariant(variant:SongVariant) : Promise<SongTitle[]>{
      return await this.nameRepository.find({where:{
        variant
      },
      relations: {
        variant:{
          song:true
        }
      }
    })
    }

    async findVariantsBySong(song: Song){
      return await this.variantRepository.find({
        where:{
            song,
        },
        relations:{
          prefferedTitle: true,
          createdBy:true,
          sources: true
        }
      })
    }

    async getUnverified() : Promise<SongVariant[]>{
      const variants = await this.variantRepository
        .find({
          where: {
            verified: false,
            deleted: false,
            createdBy:{
              role: Not(ROLES.Loader)
            }

          },
          relations: {
            song:true,
            createdBy:true
          },
          take:takePerPage
        })

        return variants;
    }
    async getLoaderUnverified(){
      const variants = await this.variantRepository
        .find({
          where: {
            verified: false,
            deleted: false,
            createdBy: {
              role: ROLES.Loader
            }
          },
          relations: {
            song:true,
            createdBy:true
          },
          take:takePerPage
        })

        return variants;

    }

    async verifyVariantByGUID(guid:string){
       const variant = (await this.variantRepository.findOne({
              where:{
                guid
              }
         })) 
        
         if(!variant) throw new NotFoundException("Variant not found");

        if(variant.verified) throw new BadRequestException("Variant is already verified");
        variant.verified=true;
        await this.variantRepository.save(variant);
    }
    async unverifyVariantByGUID(guid:string){
        const variant = (await this.variantRepository.findOne({
            where:{
            guid
            }
        })) 
    
        if(!variant) throw new NotFoundException("Variant not found");
    
        if(!variant.verified) throw new BadRequestException("Variant is already unverified");
        variant.verified=false;
        await this.variantRepository.save(variant);
    }
    async deleteVariantByGUID(guid:string, user: User) : Promise<boolean>{
        const variant = (await this.variantRepository.findOne({
            where:{
                guid
            },
            relations:{
                createdBy:true,
                playlistItems:{
                    playlist:true
                }
            }
        }))


        if(!variant)
            throw new NotFoundException("Variant not found");

        if(variant.createdBy.guid!=user.guid && user.role!==ROLES.Admin)
            throw new UnauthorizedException("User doesn't have permission to delete this variant");

        if(variant.verified)
            throw new BadRequestException("Cannot delete verified variant");

        if(variant.deleted)
            throw new ConflictException("Variant has been already deleted");

        // remove from playlists
        await Promise.all(variant.playlistItems.map(async (item)=>{
            this.playlistUtilsService.removeVariantFromPlaylist(variant.guid, item.playlist.guid, user, true);
        }))

        variant.deleted=true;
        await this.variantRepository.save(variant);

        return true
    }

    async restoreVariantByGuid(guid:string){
        const variant = (await this.variantRepository.findOneBy({
            guid
        }))
    
        if(!variant) throw new NotFoundException("Variant not found");
    
        if(!variant.deleted)
            throw new ConflictException("Variant has not been deleted");
    
        variant.deleted=false;
        await this.variantRepository.save(variant);

        return true
    }

    async getParentSongIfExists(data:Partial<NewSongData>):Promise<Song | undefined>{

      //find song without variant with same name
      if(data.title){
        const r = await this.songRepository.findOne({
          where:{
            variants:[],
            tags:[],
            mainTitle:{
              title: data.title
            }
          },
          relations:{
            mainTitle: true
          }
        })

        if(!r) return r;
      }
      

      if(data.sheetData){       
        const result = await this.findMostSimilarVariant(data.sheetData);
        if(result){
          if(result.similarity>0.95){
            const v = await this.variantRepository.findOne({
              where: {
                guid: result.variant.guid
              },
              relations:{
                song:true
              }
            })

            return v.song;


          }
        }
      }

      return undefined;
    }

    async findMostSimilarVariant(sheetData) : Promise<{ similarity: number; variant: SongVariant; } | undefined>{
      var stringSimilarity = require("string-similarity");

      if(!sheetData)return undefined;

      const variants : SongVariant[] = await this.variantRepository.find();
      let variant = null;
      let maxSim = 0;
      for(let i=0; i<variants.length; i++){
        const vv = variants[i];
        if(vv.sheetData==null)continue;
        var similarity = stringSimilarity.compareTwoStrings(sheetData, vv.sheetData);
        if(similarity>maxSim){
          maxSim=similarity;
          variant=vv;
        }
      }

      if(variant) return{
        similarity: maxSim,
        variant
      }
      return undefined;
    }

    async getCount() : Promise<number>{
      return await this.songRepository.count();
    }

    async mergeByGuids(guid1:string, guid2: string) : Promise<string>{
      const song1 = await this.songRepository.findOne({where:{guid:guid1}});
      const result = await this.variantRepository.update({
        song:{
          guid: guid2
        }
      },{song: song1});

      if(result.affected<1) throw new BadRequestException("Cannot merge variants");

      const song2 = (await this.songRepository.findOneBy({
        guid:guid2
      }))


      await this.songRepository.remove(song2);

      return guid1;
    }

    async getRandomVariant() : Promise<SongVariantDTO>{
      const variants = await this.variantRepository.find({
        where:{
            deleted: false
        }
      });
      const index = Math.round(Math.random()*(variants.length-1));
      return this.getVariantByGuid(variants[index].guid);
    }

    async getVariantByGuid(guid:string) : Promise<SongVariantDTO | undefined>{
      const variant = await this.variantRepository.findOne({
        where:{
          guid
        },
        relations:{
          song:true,
          createdBy:true,
          prefferedTitle:true,
          sources:true,
          titles:true,
          links:true,
        }
      });
      if(!variant)return undefined;

      return {
        guid: variant.guid,
        songGuid: variant.song.guid,
        prefferedTitle: variant.prefferedTitle.title,
        titles: variant.titles.map((t)=>t.title),
        sheetData: variant.sheetData,
        sheetText: variant.searchValue,
        verified: variant.verified,
        createdByGuid: variant.createdBy.guid,
        createdByLoader: variant.createdBy.role==ROLES.Loader,
        sources: variant.sources.map((s)=>mapSourceToDTO(s)),
        creators: variant.links?.map((l)=>({
          name: l.creator.name,
          type: l.type
        })),
        deleted: variant.deleted

      };
    }

    async getSongListOfUser(user: User) : Promise<SongVariantDTO[]>{
      const variants =  await this.variantRepository.find({
        where:{
          createdBy: user,
          deleted: false
        },
        order: {
          verified: "DESC"
        
        }
      })

      return await Promise.all(variants.map(async (v)=>{
        return await this.getVariantByGuid(v.guid);
      }))
    }

    async editVariant(body: PostEditVariantBody, user: User) : Promise<boolean>{
      const variant = await this.variantRepository.findOne({
        where:{
          guid: body.guid
        },
        relations:{
          song:true,
          createdBy:true,
          prefferedTitle:true,
          sources:true,
          titles:true,
          links:true,
        }
      });

      if(variant.createdBy.guid!=user.guid && 
        !(user.role==ROLES.Admin && variant.createdBy.role==ROLES.Loader))
        throw new UnauthorizedException("User doesn't have permission to edit this variant");

      if(!variant) 
        throw new NotFoundException("Variant not found");

      if(variant.verified)
        throw new ConflictException("Variant is verified");

      variant.sheetData = body.sheetData;
      const sheetText = (new Sheet(body.sheetData)).getSections().map((s)=>s.text).join("");
      variant.searchValue = normalizeSearchText(sheetText);

      await this.variantRepository.save(variant);

      // Edit preferred title
      const title = await this.nameRepository.findOne({
        where:{
          guid: variant.prefferedTitle.guid
        }
      });
      title.title = body.title;
      title.searchValue = normalizeSearchText(body.title);
      const r = await this.nameRepository.save(title);


      return true
    }
}