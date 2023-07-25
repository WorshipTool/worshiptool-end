import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { MessengerModule } from './messenger/messenger.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    DatabaseModule, 
    SongsModule, 
    GroupModule,
    AuthModule,
    MessengerModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: ref => new JwtAuthGuard(ref),
      inject: [Reflector],
    }
  ],
})
export class AppModule {}
