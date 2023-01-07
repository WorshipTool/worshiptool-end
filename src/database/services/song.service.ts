import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "../constants";
import { Song } from "../entities/song.entity";
import { SongName } from "../entities/songname.entity";
import { SongVariant } from "../entities/songvariant.entity";
import { INewSongData } from "../interfaces";
import { randomUUID } from "crypto";

@Injectable()
export class SongService {
  constructor(
    @Inject(SONG_REPOSITORY)
    private songRepository: Repository<Song>,
    @Inject(SONG_NAMES_REPOSITORY)
    private nameRepository: Repository<SongName>,
    @Inject(SONG_VARIANTS_REPOSITORY)
    private variantRepository: Repository<SongVariant>,
  ) {}

  async search(k:string): Promise<Song[]> {
    const key = k.replace(/\s/gi, "");
    const names = await this.nameRepository.createQueryBuilder()
      .where("name like :name", {name: `%${key}%`}).getMany();
    const guids1 : string[] = names.map((name)=>{
      return name.songGUID;
    });

    const variants = await this.variantRepository.createQueryBuilder()
      .where("sheetText like :key", {key: `%${key}%`}).getMany();
    const guids2 : string[] = variants.map((variant)=>{
      return variant.songGUID;
    });

    const guids = Array.from(new Set( guids1.concat(guids2 ))); //remove duplicates


    if(guids.length<1)return [];

    return await this.songRepository.createQueryBuilder()
      .where("guid IN (:...guids)", {guids: guids}).andWhere("display= :display", {display: true}).getMany();
  }

  async random(count: number) : Promise<Song[]>{
    const songs = await this.songRepository.createQueryBuilder().andWhere("display= :display", {display: true}).orderBy("RAND()").limit(count).getMany();
    return songs;
  }

  async getNamesBySongGUID(guid: string) : Promise<SongName[]>{
    return this.nameRepository.createQueryBuilder()
    .where("songGUID= :guid", {guid:guid}).getMany();
  }

  async findByGUID(guid:string) : Promise<Song>{
    return this.songRepository.createQueryBuilder()
      .where("guid= :guid", {guid: guid}).getOne();
  }

  async createNewSong(newSongData : INewSongData): Promise<string>{
    const songGUID =  (await this.songRepository.createQueryBuilder().insert().values({guid: undefined, mainNameGUID: "", verified: false, display: false}).execute())
                        .identifiers[0].guid;

    const nameGUID = (await this.nameRepository.createQueryBuilder().insert().values({guid: undefined, songGUID: songGUID, name: newSongData.title}).execute())
                        .identifiers[0].guid;

    await this.songRepository.createQueryBuilder().update({mainNameGUID: nameGUID}).where({guid: songGUID}).execute();

    const variant : SongVariant = {
      guid: undefined,
      songGUID: songGUID, 
      sheet: newSongData.sheetData,
      sheetText: newSongData.sheetText.replace(/\n/gi,"").replace(/\s/gi,""),
      mainNameGUID: nameGUID
    };

    const variantGUID = (await this.variantRepository.createQueryBuilder().insert().values(variant).execute())
                        .identifiers[0].guid;

    return songGUID;
  }

  async verifySongByGUID(guid:string){
    return this.songRepository.createQueryBuilder().update({verified: true, display: true}).where("guid= :guid", {guid:guid}).execute();
  }
  async unverifySongByGUID(guid:string){
    return this.songRepository.createQueryBuilder().update({verified: false, display: false}).where("guid= :guid", {guid:guid}).execute();
  }
}