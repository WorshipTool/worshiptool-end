import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { toNamespacedPath } from 'path';
import { Song } from './entities/song.entity';
import { IAllSongData, ISongGetQuery, INewSongData, ISongDataArray, ISongGetResult } from './interfaces';
import { CreatorService } from './services/creator.service';
import { SongService } from './services/song.service';
import { SongVariantService } from './services/songvariant.service';
import { MessengerService} from 'src/messenger.service';
import { Identity } from 'src/auth/identity.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestResult, codes, makeResult, makeSuccessResult, messages } from 'src/utils/queryResultConverter';

@Controller("songs")
export class DatabaseController {
  constructor(
    private readonly songService: SongService,
    private readonly creatorService: CreatorService,
    private readonly variantsService: SongVariantService,
     private readonly messenger: MessengerService
    ) {}

  @Get(":guid")
  async getWholeSong(@Param() params): Promise<RequestResult<IAllSongData|{}>>{
    const song = await this.songService.findByGUID(params.guid);

    if(song==null)return makeResult(codes[404], messages[404], {});

    const names =await this.songService.getNamesBySongGUID(song.guid);

    const variants = await this.variantsService.findAllBySong(song.guid);
    const vGuids = variants.map((variant)=>{
      return variant.guid;
    })

    const pairs = await this.creatorService.findBySVGUIDS(song.guid, vGuids);

    return makeSuccessResult({
      song: song, 
      names: names,
      creators: pairs, 
      variants: variants});
  }
  
  @Get()
  async getSongs(@Query() params: ISongGetQuery):Promise<ISongGetResult>{
    switch(params.key){
      case "search":
        const searched = await this.songService.search(params.body);
        return makeSuccessResult({
          guids: searched.map((s)=>s.guid)
        });
      case "all":
        const all = await this.songService.search("");
        return makeSuccessResult({
          guids: all.map((s)=>s.guid)
        });
      case "random":
        const random = await this.songService.random(params.count);
        return makeSuccessResult({
          guids: random.map((s)=>s.guid)
        });
      default:
        return makeSuccessResult({guids: []})
    }
    
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  async addNewSong(@Body() newSongData: INewSongData){
    // console.log("Length",newSongData.sheetData.length);
    const guid = await this.songService.createNewSong(newSongData);
    this.messenger.sendNewSongForVerification(newSongData, guid);
    return makeSuccessResult({songGUID: guid});
  }

  @Post("ansav")
  async addNewSongAndVerify(@Body() newSongData: INewSongData){
    console.log("Length",newSongData.sheetData.length);
    const guid = await this.songService.createNewSong(newSongData);
    this.verifySong({guid});
    
    return makeSuccessResult({songGUID: guid});
  }

  @Get("verify/:guid")
  async verifySong(@Param() params){
    const names = await this.songService.getNamesBySongGUID(params.guid);

    this.songService.verifySongByGUID(params.guid);

    
    this.messenger.sendMessage(`Píseň *${names[0].name.toUpperCase()}* byl ověřena.`);
    return makeSuccessResult("verified");
  }
  @Get("unverify/:guid")
  async unverifySong(@Param() params){
    const names = await this.songService.getNamesBySongGUID(params.guid);

    this.songService.unverifySongByGUID(params.guid);

    this.messenger.sendMessage(`Ověření písně *${names[0].name.toUpperCase()}* bylo zrušeno.`);
    return makeSuccessResult("unverified");
  }

  
}
