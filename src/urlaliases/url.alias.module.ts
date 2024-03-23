import { Module } from '@nestjs/common';
import { UrlAliasController } from './url.alias.controller';
import { UrlAliasService } from './url.alias.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UrlAliasController],
  providers: [UrlAliasService],
  exports: [UrlAliasService],
})
export class UrlAliasModule {}
