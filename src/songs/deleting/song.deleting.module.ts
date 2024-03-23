import { Module } from "@nestjs/common";
import { SongDeletingService } from "./song.deleting.service";
import { SongDeletingController } from "./song.deleting.controller";
import { DatabaseModule } from "../../database/database.module";
import { PlaylistService } from "../modules/playlists/playlist.service";
import { PlaylistModule } from "../modules/playlists/playlist.module";
import { PlaylistUtilsService } from "../modules/playlists/playlistutils.service";

@Module({
    imports: [
        DatabaseModule,
        PlaylistModule
    ],
    controllers: [
        SongDeletingController
    ],
    providers: [
        SongDeletingService,
        PlaylistUtilsService
    ],
    exports: [
        SongDeletingService
    ]
})
export class SongDeletingModule{}