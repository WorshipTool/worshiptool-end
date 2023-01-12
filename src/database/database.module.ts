import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { SongService } from "src/songs/services/song.service";

@Module({
    imports: [DatasourceModule],
    providers: [
        ...EntitiesProvider,
        SongService
    ],
    exports: [SongService],
    controllers: []
})
export class DatabaseModule{}