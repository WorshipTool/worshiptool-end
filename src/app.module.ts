import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [DatabaseModule, SongsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
