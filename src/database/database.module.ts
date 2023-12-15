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

@Module({
    imports: [DatasourceModule],
    providers: [
        ...EntitiesProvider,
        SongService,
        CreatorService,
        UserService,
        MediaService,
        SourceService,
        AddSongDataService,
        PlaylistService,
        PlaylistUtilsService
        
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
        ...EntitiesProvider
    ],
    controllers: []
})
export class DatabaseModule{}