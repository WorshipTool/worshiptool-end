import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { toNamespacedPath } from 'path';
import { Song } from './entities/song.entity';
import { IAllSongData, ISongGetQuery, INewSongData, ISongDataArray, ISongGetResult } from './interfaces';
import { CreatorService } from './services/creator.service';
import { SongService } from './services/song.service';
import { SongVariantService } from './services/songvariant.service';
import { MessengerService} from 'src/messenger.service';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller("songs")
export class DatabaseController {
  constructor(
    private readonly songService: SongService,
    private readonly creatorService: CreatorService,
    private readonly variantsService: SongVariantService,
     private readonly messenger: MessengerService
    ) {}

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
  
  @Get()
  async getSongs(@Query() params: ISongGetQuery):Promise<ISongGetResult>{
    switch(params.key){
      case "search":
        const searched = await this.songService.search(params.body);
        return {
          guids: searched.map((s)=>s.guid)
        };
      case "all":
        const all = await this.songService.search("");
        return {
          guids: all.map((s)=>s.guid)
        };
      case "random":
        const random = await this.songService.random(params.count);
        return {
          guids: random.map((s)=>s.guid)
        };
      default:
        return {guids: []}
    }
    
  }
  
  // @UseGuards(JwtAuthGuard)
  @Post()
  async addNewSong(@Body() newSongData: INewSongData){
    const guid = await this.songService.createNewSong(newSongData);
    this.messenger.sendNewSongForVerification(newSongData, guid);
    return {songGUID: guid};
  }

  @Get("verify/:guid")
  async verifySong(@Param() params){
    const names = await this.songService.getNamesBySongGUID(params.guid);

    this.songService.verifySongByGUID(params.guid);

    
    this.messenger.sendMessage(`Píseň *${names[0].name.toUpperCase()}* byl ověřena.`);
    return "verified";
  }
  @Get("unverify/:guid")
  async unverifySong(@Param() params){
    const names = await this.songService.getNamesBySongGUID(params.guid);

    this.songService.unverifySongByGUID(params.guid);

    this.messenger.sendMessage(`Ověření písně *${names[0].name.toUpperCase()}* bylo zrušeno.`);
    return "unverified";
  }

  
}
