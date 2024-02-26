import { Module } from "@nestjs/common";
import { SongAddingService } from "./song.adding.service";
import { SongAddingController } from "./song.adding.controller";
import { SongAddingTechService } from "./song.adding.tech.service";

@Module({
    imports: [],
    controllers: [
        SongAddingController
    ],
    providers: [
        SongAddingService,
        SongAddingTechService
    ],
    exports: [
        SongAddingService
    ]
})
export class SongAddingModule {}