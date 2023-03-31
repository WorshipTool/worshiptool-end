import { Get, Inject, Injectable } from "@nestjs/common";
import { SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "src/database/constants";
import { Song } from "src/database/entities/song.entity";
import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { In, Like, Not, Repository } from "typeorm";
import { NewSongData, NewSongDataToVariant} from "./adding/dtos";
import { ROLES, User } from "src/database/entities/user.entity";
import { skipForPage, takePerPage } from "../contants";
import normalizeSearchText from "src/utils/normalizeSearchText";

@Injectable()
export class SongService{
    constructor(
        @Inject(SONG_REPOSITORY)
        private songRepository: Repository<Song>,
        @Inject(SONG_NAMES_REPOSITORY)
        private nameRepository: Repository<SongName>,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>
    ){}

    async search(k:string, user:User, page:number): Promise<Song[]> {
        const key = normalizeSearchText(k);
        const names = await this.nameRepository.find({
          where:{
            searchValue: Like(`%${key}%`),
            variants: [
              {
                display:true
              },
              {
                display:user?user.role!=ROLES.Admin:true
              },
              {
                createdBy: user
              },
              {
                createdBy:{
                  role: ROLES.Loader
                }
              }
            ]
          },
          relations:{
            song: true,
            variants: true
          }
        })


        
        // const names = await this.nameRepository.createQueryBuilder()
        // .leftJoinAndSelect("song", "song.mainNameGuid = guid")
        //   .where("name.name LIKE :key", { key: `%${key}%` })
        //   .andWhere((qb) => {
        //     const subQuery1 = qb
        //       .andWhere("variant.display = :display1", { display1: true })
        //       .getQuery();
        //     const subQuery2 = qb
        //       .andWhere("variant.display = :display2", { display2: user?user.role!=ROLES.Admin:true })
        //       .getQuery();
        //     const subQuery3 = qb
        //       .andWhere("name.createdBy = :createdBy", { createdBy: user })
        //       .getQuery();
        //     return `(${subQuery1} OR ${subQuery2} OR ${subQuery3})`;
        //   })
        //   .getMany();
        



        
        const guids1 : string[] = names.map((name)=>{
          return name.song.guid;
        });
        const variants = await this.variantRepository
                .find({                  
                  where:[{
                    sheetText: Like(`%${key}%`),
                    display: In([true,user?user.role!=ROLES.Admin:true])
                  }//,
                  // {
                  //   sheetText: Like(`%${key}%`),
                  //   createdBy:{
                  //     role: ROLES.Loader
                  // }
                    
                  ],
                  relations:{
                    song:true
                  }
                })


        const guids2 : string[] = variants.map((variant)=>{
          return variant.song.guid;
        });


        return await this.songRepository.find({
            where:[{guid: In(guids1)}/*,{guid: In(guids2)}*/],
            take: takePerPage,
            skip: skipForPage(page)
        })
        
    }

    async random(page:number) : Promise<Song[]>{
        const variants = await this.variantRepository.find({
          where:{
            display: true
          },
          relations:{
            song:true
          },
          order:{

          }
          
          
        });
        const index=Math.round(Math.random()*(variants.length-takePerPage));
        const cutVariants = variants.slice(index, index+takePerPage)
        const songs = cutVariants.map((v)=>v.song);
        return songs;
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
          mainName: true,
          tags:true
        }
      })
    }

    async getTitlesBySong(song:Song) : Promise<SongName[]>{
      return await this.nameRepository.find({where:{song}})
    }

    async findVariantsBySong(song: Song){
      return await this.variantRepository.find({
        where:{
          song
        },
        relations:{
          mainTitle: true,
          createdBy:true,
          sources: true
        }
      })
    }

    async getUnverified(){
      const variants = await this.variantRepository
        .find({
          where: {
            verified: false,
            createdBy:{
              role: Not(ROLES.Loader)
            }

          },
          relations: {
            song:true,
            createdBy:true
          }
        })

      const guids = variants.map((v)=>v.song.guid);

      if(guids.length==0)return [];

      return await this.songRepository.find({where:{guid: In(guids)}})
    }
    async getLoaderUnverified(){
      const variants = await this.variantRepository
        .find({
          where: {
            verified: false,
            createdBy: {
              role: ROLES.Loader
            }
          },
          relations: {
            song:true,
            createdBy:true
          }
        })

      const guids = variants.map((v)=>v.song.guid);

      if(guids.length==0)return [];

      return await this.songRepository.find({where:{guid: In(guids)}})
    }

    async verifyVariantByGUID(guid:string){
      return await this.variantRepository.createQueryBuilder()
        .update({verified: true, display: true}).where("guid= :guid", {guid}).execute();
    }
    async unverifyVariantByGUID(guid:string){
      return await this.variantRepository.createQueryBuilder()
        .update({verified: false, display: false}).where("guid= :guid", {guid}).execute();
    }
    async deleteVariantByGUID(guid:string){
      const variant = (await this.variantRepository.findOneBy({
        guid
      }))


      return await this.variantRepository.remove(variant);
    }

    async getParentSongIfExists(data:Partial<NewSongData>):Promise<Song | undefined>{

      //find song without variant with same name
      if(data.title){
        const r = await this.songRepository.findOne({
          where:{
            variants:[],
            tags:[],
            mainName:{
              name: data.title
            }
          },
          relations:{
            mainName: true
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

}