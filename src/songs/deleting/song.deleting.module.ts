import { Module } from "@nestjs/common";
import { SongDeletingService } from "./song.deleting.service";
import { SongDeletingController } from "./song.deleting.controller";
import { DatabaseModule } from "../../database/database.module";
import { PlaylistModule } from "../modules/playlists/playlist.module";
import { PlaylistUtilsService } from "../modules/playlists/playlistutils.service";
import { UrlAliasModule } from "../../urlaliases/url.alias.module";

@Module({
    imports: [DatabaseModule, PlaylistModule, UrlAliasModule],
    controllers: [SongDeletingController],
    providers: [SongDeletingService, PlaylistUtilsService],
    exports: [SongDeletingService]
})
export class SongDeletingModule {}
