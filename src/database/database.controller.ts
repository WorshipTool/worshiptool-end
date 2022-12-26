import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { toNamespacedPath } from 'path';
import { Song } from './entities/song.entity';
import { IAllSongData, INewSongData, ISongDataArray } from './interfaces';
import { CreatorService } from './services/creator.service';
import { SongService } from './services/song.service';
import { SongVariantService } from './services/songvariant.service';

@Controller("songs")
export class DatabaseController {
  constructor(
    private readonly songService: SongService,
    private readonly creatorService: CreatorService,
    private readonly variantsService: SongVariantService) {}

  @Get("search/:key")
  async getTest(@Param() params) : Promise<ISongDataArray|{}>{

    const songs = await this.songService.search(params.key);
    const dataArr = [];

    for(let i=0; i<songs.length; i++){
      const song = songs[i];
      const songData = await this.getWholeSong({guid: song.guid});
      dataArr.push(songData);
    }    
    console.log(dataArr, "data");

    return {songs: dataArr};
  }

  @Get(":guid")
  async getWholeSong(@Param() params): Promise<IAllSongData|{}>{
    const song = await this.songService.findByGUID(params.guid);

    if(song==null)return {};

    const names =await this.songService.getNamesBySongGUID(song.guid);

    const variants = await this.variantsService.findAllBySong(song.guid);
    const vGuids = variants.map((variant)=>{
      return variant.guid;
    })

    const pairs = await this.creatorService.findBySVGUIDS(song.guid, vGuids);

    return {
      song: song, 
      names: names,
      creators: pairs, 
      variants: variants};
  }

  @Post()
  async addNewSong(@Body() newSongData: INewSongData){
    console.log(newSongData);
    const guid = await this.songService.createNewSong(newSongData);
    return {songGUID: guid};
  }
}
