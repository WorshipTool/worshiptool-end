import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { SongService } from "src/songs/services/song.service";
import { UserService } from "src/auth/services/user.service";
import { CreatorService } from "src/songs/services/creator.service";
import { MediaService } from "src/songs/services/media.service";
import { SourceService } from "src/songs/services/source.service";
import { AddSongDataService } from "src/songs/services/adding/add.service";
import { PlaylistService } from '../songs/services/playlists/playlist.service';
import { GroupService } from "src/group/group.service";
import { MessengerModule } from "src/messenger/messenger.module";
import { PlaylistUtilsService } from "src/songs/services/playlists/playlistutils.service";
import { GetterService } from "src/getter/getter.service";
import { ParserService } from "src/songs/services/parser.service";
import { MessengerService } from "src/messenger/messenger.service";
import { GetterDomainService } from "src/getter/services/getter-domain.service";

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