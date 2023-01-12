import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, 
    SongsModule, 
    AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
