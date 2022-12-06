import { Controller, Get } from '@nestjs/common';
import { SongTitlesService } from './database/songtitles/songtitles.service';

@Controller()
export class SongTitlesController {
  constructor(private readonly songService: SongTitlesService) {}

  

  @Get("get")
  async getSongs(): Promise<any>{
    return await this.songService.findAll();
  }
}
