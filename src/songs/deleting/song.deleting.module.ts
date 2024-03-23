import { Module } from "@nestjs/common";
import { SongDeletingService } from "./song.deleting.service";
import { SongDeletingController } from "./song.deleting.controller";
import { DatabaseModule } from "../../database/database.module";
import { PlaylistModule } from "../modules/playlists/playlist.module";
import { PlaylistUtilsService } from "../modules/playlists/playlistutils.service";
import { UrlAliasModule } from "../../urlaliases/url.alias.module";
import { SongVariantModule } from "../modules/variants/song.variant.module";

@Module({
    imports: [
        DatabaseModule,
        PlaylistModule,
        UrlAliasModule,
        SongVariantModule
    ],
    controllers: [SongDeletingController],
    providers: [SongDeletingService, PlaylistUtilsService],
    exports: [SongDeletingService]
})
export class SongDeletingModule {}
