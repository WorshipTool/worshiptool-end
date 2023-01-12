import { Module } from "@nestjs/common";
import { datasourceProvider } from "./datasource.provider";

@Module({
    providers: [...datasourceProvider],
    exports: [...datasourceProvider]
})
export class DatasourceModule{}