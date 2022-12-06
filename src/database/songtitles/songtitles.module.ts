import { Module } from '@nestjs/common';
import { SongTitlesController } from 'src/song.controller';
import { DatabaseModule } from '../../database/database.module';
import { SongTitlesProviders } from './songtitles.provider';
import { SongTitlesService } from './songtitles.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...SongTitlesProviders,
    SongTitlesService,
  ],
  controllers:[SongTitlesController]
})
export class SongTitlesModule {}