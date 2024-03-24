import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MessengerModule } from "../messenger/messenger.module";
import { ParserService } from "./services/parser/parser.service";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";
import { SongAddingModule } from "./adding/song.adding.module";
import { SongEditingModule } from "./editing/song.editing.module";
import { SongDeletingModule } from "./deleting/song.deleting.module";
import { SongGettingModule } from "./getting/song.getting.module";
import { SongModule } from "./modules/songs/song.module";
import { CreatorsModule } from "./modules/creators/creators.module";
import { MediaModule } from "./modules/media/media.module";
import { PlaylistModule } from "./modules/playlists/playlist.module";
import { PlaylistUtilsService } from "./modules/playlists/playlistutils.service";
import { AddSongDataService } from "./services/adding/add.service";
import { UrlAliasModule } from "../urlaliases/url.alias.module";
import { SongVariantModule } from "./modules/variants/song.variant.module";

@Module({
    imports: [
        DatabaseModule,
        MessengerModule,
        SongAddingModule,
        SongEditingModule,
        SongDeletingModule,
        SongGettingModule,
        CreatorsModule,
        MediaModule,
        PlaylistModule,
        SongModule,
        UrlAliasModule,
        SongVariantModule
    ],
    controllers: [SongsController],
    providers: [
        SongsService,
        ParserService,
        PlaylistUtilsService,
        AddSongDataService
    ]
})
export class SongsModule {}
