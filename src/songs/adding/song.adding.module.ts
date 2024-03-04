import { Module } from "@nestjs/common";
import { SimilarVariantService } from "./similar.variant.service";
import { SongAddingController } from "./song.adding.controller";
import { SongAddingTechService } from "./song.adding.tech.service";
import { ProgramSongAddingModule } from "./byprogram/program.song.adding.module";
import { UserSongAddingModule } from "./byuser/user.song.adding.module";
import { DatabaseModule } from "../../database/database.module";
import { SongAddingService } from "./song.adding.service";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [
        SongAddingController
    ],
    providers: [
        SongAddingService,
        SimilarVariantService,
        SongAddingTechService
    ],
    exports: [
        SongAddingService,
        SimilarVariantService,
    ]
})
export class SongAddingModule {}