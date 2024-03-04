import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { MessengerModule } from './messenger/messenger.module';
import { GroupModule } from './group/group.module';
import { GetterModule } from './getter/getter.module';
import { WebhookModule } from './webhook/webhook.module';
import { ConfigModule } from '@nestjs/config';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    MonitorModule,
    DatabaseModule, 
    SongsModule, 
    GroupModule,
    AuthModule,
    MessengerModule,
    GetterModule,
    WebhookModule,
    ConfigModule.forRoot(), // Loads .env file
  ],
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
