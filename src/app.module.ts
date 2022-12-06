import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongTitlesModule } from './database/songtitles/songtitles.module';
import { SongTitlesController } from './song.controller';

@Module({
  imports: [SongTitlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
