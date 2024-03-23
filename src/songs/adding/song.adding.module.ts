import { Module } from "@nestjs/common";
import { SimilarVariantService } from "./similar.variant.service";
import { SongAddingController } from "./song.adding.controller";
import { SongAddingTechService } from "./song.adding.tech.service";
import { ProgramSongAddingModule } from "./byprogram/program.song.adding.module";
import { UserSongAddingModule } from "./byuser/user.song.adding.module";
import { DatabaseModule } from "../../database/database.module";
import { SongAddingService } from "./song.adding.service";
import { SongTitleModule } from "../modules/titles/song.title.module";
import { SongVariantModule } from "../modules/variants/song.variant.module";
import { UrlAliasModule } from "../../urlaliases/url.alias.module";
import { AddSongDataService } from "../services/adding/add.service";
import { SongModule } from "../modules/songs/song.module";

@Module({
    imports: [
        DatabaseModule,
        SongTitleModule,
        SongVariantModule,
        UrlAliasModule,
        SongModule
    ],
    controllers: [
        SongAddingController
    ],
    providers: [
        SongAddingService,
        SimilarVariantService,
        SongAddingTechService,
        AddSongDataService
    ],
    exports: [
        SongAddingService,
        SimilarVariantService,
    ]
})
export class SongAddingModule {}