import { Module } from '@nestjs/common';
import { DatasourceModule } from './database/datasource/datasource.module';

@Module({
  imports: [DatasourceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
