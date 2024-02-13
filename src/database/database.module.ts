import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { MessengerModule } from "../messenger/messenger.module";
import { UserService } from "../auth/services/user.service";
import { GetterService } from "../getter/getter.service";
import { GetterDomainService } from "../getter/modules/getter-domain/getter-domain.service";
import { AddSongDataService } from "../songs/services/adding/add.service";
import { CreatorService } from "../songs/services/creator.service";
import { MediaService } from "../songs/services/media.service";
import { ParserService } from "../songs/services/parser.service";
import { PlaylistService } from "../songs/services/playlists/playlist.service";
import { PlaylistUtilsService } from "../songs/services/playlists/playlistutils.service";
import { SongService } from "../songs/services/song.service";
import { SourceService } from "../songs/services/source.service";

@Module({
    imports: [DatasourceModule, MessengerModule],
    providers: [
        ...EntitiesProvider,
        SongService,
        CreatorService,
        UserService,
        MediaService,
        SourceService,
        AddSongDataService,
        PlaylistService,
        PlaylistUtilsService,
        GetterService,
        ParserService,
        GetterDomainService
        
    ],
    exports: [
        SongService,
        CreatorService, 
        UserService,
        MediaService,
        SourceService,
        AddSongDataService,
        PlaylistService,
        PlaylistUtilsService,
        GetterService,
        GetterDomainService,
        ...EntitiesProvider
    ],
    controllers: []
})
export class DatabaseModule{}