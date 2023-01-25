import { Get, Inject, Injectable } from "@nestjs/common";
import { SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "src/database/constants";
import { Song } from "src/database/entities/song.entity";
import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { In, Like, Not, Repository } from "typeorm";
import { NewSongData } from "../dtos";
import { ROLES, User } from "src/database/entities/user.entity";
import { skipForPage, takePerPage } from "../contants";

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
        const key = k.replace(/\s/gi, "");
        const names = await this.nameRepository.find({
          where:{
            name: Like(`%${key}%`),
            variants: [
              {
                display:true
              },
              {
                display:user?user.role!=ROLES.Admin:true
              },
              {
                createdBy: user
              }
            ]
          },
          relations:{
            song: true,
            variants: true
          }
        })
        const guids1 : string[] = names.map((name)=>{
          return name.song.guid;
        });
        const variants = await this.variantRepository
                .find({                  
                  where:{
                    sheetText: Like(`%${key}%`),
                    display: true
                  },
                  relations:{
                    song:true
                  }
                })


        const guids2 : string[] = variants.map((variant)=>{
          return variant.song.guid;
        });


        return await this.songRepository.find({
            where:[{guid: In(guids1)},{guid: In(guids2)}],
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

          },
          take: takePerPage,
          skip: Math.round(Math.random()*300)//skipForPage(page)
          
          
        });
        const songs = variants.map((v)=>v.song);
        return songs;
    }

    async createNewSong(newSongData : NewSongData, user: User): Promise<string>{
        const songGUID =  (await this.songRepository.createQueryBuilder().insert().values({guid: undefined}).execute())
                            .identifiers[0].guid;

        const song = await this.songRepository.findOne({where:{guid: songGUID}})
    
        const nameGUID = (await this.nameRepository.createQueryBuilder().insert().values({guid: undefined, song, name: newSongData.title}).execute())
                            .identifiers[0].guid;

        const title = await this.nameRepository.createQueryBuilder().where({guid:nameGUID}).getOne();
    
        await this.songRepository.createQueryBuilder().update({mainName: title}).where({guid: songGUID}).execute();
    
        const variant : SongVariant = {
          guid: undefined,
          song, 
          sheet: newSongData.sheetData,
          sheetText: newSongData.sheetText.replace(/\n/gi,"").replace(/\s/gi,""),
          mainTitle: title,
          verified: false, 
          display: false,
          createdBy: user,
          links:[]
        };
    
        const variantGUID = (await this.variantRepository.createQueryBuilder().insert().values(variant).execute())
                            .identifiers[0].guid;
    
        return songGUID;
    }

    async findByGUID(guid:string) : Promise<Song>{
      return await this.songRepository.findOne({
        where:{
          guid
        },
        relations: {
          mainName: true
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
          createdBy:true
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


}