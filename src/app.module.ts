import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntitiesModule } from './database/entities.module';

@Module({
  imports: [EntitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
