import { Module } from "@nestjs/common";
import { SongDeletingService } from "./song.deleting.service";
import { SongDeletingController } from "./song.deleting.controller";
import { DatabaseModule } from "../../database/database.module";
import { PlaylistService } from "../modules/playlists/playlist.service";

@Module({
    imports: [
        DatabaseModule,
        PlaylistService
    ],
    controllers: [
        SongDeletingController
    ],
    providers: [
        SongDeletingService
    ],
    exports: [
        SongDeletingService
    ]
})
export class SongDeletingModule{}