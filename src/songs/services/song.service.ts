import { Get, Inject, Injectable } from "@nestjs/common";
import { SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "src/database/constants";
import { Song } from "src/database/entities/song.entity";
import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { Repository } from "typeorm";
import { NewSongData } from "../dtos";

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

    async search(k:string): Promise<Song[]> {
        const key = k.replace(/\s/gi, "");
        const names = await this.nameRepository.createQueryBuilder()
          .where("name like :name", {name: `%${key}%`}).getMany();
        const guids1 : string[] = names.map((name)=>{
          return name.songGUID;
        });
        const variants = await this.variantRepository.createQueryBuilder()
                .where("sheetText like :key", {key: `%${key}%`})
                .andWhere("display= :display", {display: true})
                .getMany();


        const guids2 : string[] = variants.map((variant)=>{
          return variant.songGUID;
        });

        const guids = Array.from(new Set( guids1.concat(guids2 ))); //remove duplicates


        if(guids.length<1)return [];

        return await this.songRepository.createQueryBuilder()
        .where("guid IN (:...guids)", {guids: guids}).getMany();
        
    }

    async random(count: number) : Promise<Song[]>{
        const variants = await this.variantRepository.createQueryBuilder().andWhere("display= :display", {display: true}).orderBy("RAND()").limit(count).getMany();
        const guids = variants.map((v)=>v.songGUID);

        if(guids.length==0)return [];

        const songs = await this.songRepository.createQueryBuilder().where("guid IN (:...guids)",{guids}).getMany();
        return songs;
    }

    async createNewSong(newSongData : NewSongData): Promise<string>{
        const songGUID =  (await this.songRepository.createQueryBuilder().insert().values({guid: undefined, mainNameGUID: ""}).execute())
                            .identifiers[0].guid;
    
        const nameGUID = (await this.nameRepository.createQueryBuilder().insert().values({guid: undefined, songGUID: songGUID, name: newSongData.title}).execute())
                            .identifiers[0].guid;
    
        await this.songRepository.createQueryBuilder().update({mainNameGUID: nameGUID}).where({guid: songGUID}).execute();
    
        const variant : SongVariant = {
          guid: undefined,
          songGUID: songGUID, 
          sheet: newSongData.sheetData,
          sheetText: newSongData.sheetText.replace(/\n/gi,"").replace(/\s/gi,""),
          mainNameGUID: nameGUID,
         verified: false, 
         display: false
        };
    
        const variantGUID = (await this.variantRepository.createQueryBuilder().insert().values(variant).execute())
                            .identifiers[0].guid;
    
        return songGUID;
    }

    async findByGUID(guid:string) : Promise<Song>{
      return await this.songRepository.createQueryBuilder()
      .where("guid= :guid", {guid: guid}).getOne();
    }

    async getTitlesBySongGUID(guid:string) : Promise<SongName[]>{
      return await this.nameRepository.createQueryBuilder()
        .where("songGUID= :guid", {guid}).getMany();
    }

    async findVariantsBySongGUID(songGUID: string){
      return await this.variantRepository.createQueryBuilder()
        .where("songGUID=:songGUID", {songGUID})
        .getMany();
    }

    async getUnverified(){
      const variants = await this.variantRepository.createQueryBuilder()
        .where("verified=:verified", {verified: false})
        .getMany();

      const guids = variants.map((v)=>v.songGUID);

      if(guids.length==0)return [];

      return await this.songRepository.createQueryBuilder()
        .where("guid IN (:...guids)",{guids})
        .getMany()
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
      return await this.variantRepository.createQueryBuilder()
        .delete().where("guid= :guid", {guid}).execute();
    }


}