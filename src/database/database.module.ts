import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { SongService } from "src/songs/services/song.service";
import { UserService } from "src/auth/services/user.service";

@Module({
    imports: [DatasourceModule],
    providers: [
        ...EntitiesProvider,
        SongService,
        UserService
    ],
    exports: [
        SongService, 
        UserService
    ],
    controllers: []
})
export class DatabaseModule{}