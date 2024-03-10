import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { datasourceProvider } from "./datasource.provider";

@Module({
    providers: [...datasourceProvider],
    exports: [...datasourceProvider]
})
export class DatasourceModule{}