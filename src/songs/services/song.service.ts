import { Get, Inject, Injectable } from "@nestjs/common";
import { SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "src/database/constants";
import { Song } from "src/database/entities/song.entity";
import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { In, Like, Not, Repository } from "typeorm";
import { NewSongData, NewSongDataToVariant} from "./adding/dtos";
import { ROLES, User } from "src/database/entities/user.entity";
import { skipForPage, takePerPage } from '../contants';
import normalizeSearchText from "src/utils/normalizeSearchText";
import { SearchSongData } from "../dtos";

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

    async search(k:string, user:User, page:number): Promise<SearchSongData[]> {
        const key = normalizeSearchText(k);

        if(key=="")return [];

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
            variants: {
              createdBy:true
            }
          },
          skip: skipForPage(page),
          take: takePerPage
        })

        const arr1 : SearchSongData[]  = names.map((name)=>{
          if(name.variants.length>0){
            return {
              guid: name.song.guid,
              title: name.name,
              sheetData: name.variants[0].sheetData,
              verified: name.variants[0].verified,
              createdByLoader: name.variants[0].createdBy.role==ROLES.Loader,
              createdBy: name.variants[0].createdBy.guid
            }
          }

          return {
            guid: name.song.guid,
            title: name.name,
            sheetData: "",
            verified: false,
            createdByLoader: false,
            createdBy: undefined
          }
          

        });

        const variants = await this.variantRepository
        .find({                  
          where:[{
            searchValue: Like(`%${key}%`),
            display: In([true,user?user.role!=ROLES.Admin:true])
          },
          {
            searchValue: Like(`%${key}%`),
            createdBy:{
              role: ROLES.Loader
            }
          }],
          relations:{
            song:true,
            mainTitle:true,
            createdBy:true
          },
          skip: skipForPage(page),
          take: takePerPage
        })

        const arr2 : SearchSongData[] = variants.map((v)=>({
          guid: v.song.guid,
          title: v.mainTitle.name,
          sheetData: v.sheetData,
          verified: v.verified,
          createdBy: v.createdBy.guid,
          createdByLoader: v.createdBy.role==ROLES.Loader
        }))
      
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
          },
          take:takePerPage
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
          },
          take:takePerPage
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