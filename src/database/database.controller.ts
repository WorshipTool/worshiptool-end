import { Controller, Get, Param } from '@nestjs/common';
import { Song } from './entities/song.entity';
import { IAllSongData } from './interfaces';
import { CreatorService } from './services/creator.service';
import { SongService } from './services/song.service';
import { SongVariantService } from './services/songvariant.service';

@Controller("songs")
export class DatabaseController {
  constructor(
    private readonly songService: SongService,
    private readonly authorService: CreatorService,
    private readonly variantsService: SongVariantService) {}

  @Get()
  getTest() : any{
    return this.songService.findOne();
  }

  @Get(":guid")
  async getWholeSong(@Param() params): Promise<IAllSongData>{
    const song = await this.songService.findByGUID(params.guid);
    const pairs = await this.authorService.findBySong(song.guid);
    const variants = await this.variantsService.findAllBySong(song.guid);

    return {song: song, creators: pairs, variants: variants};
  }
}
