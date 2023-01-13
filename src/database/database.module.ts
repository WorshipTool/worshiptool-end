import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { SongService } from "src/songs/services/song.service";
import { UserService } from "src/auth/services/user.service";
import { CreatorService } from "src/songs/services/creator.service";

@Module({
    imports: [DatasourceModule],
    providers: [
        ...EntitiesProvider,
        SongService,
        CreatorService,
        UserService
        
    ],
    exports: [
        SongService,
        CreatorService, 
        UserService
    ],
    controllers: []
})
export class DatabaseModule{}