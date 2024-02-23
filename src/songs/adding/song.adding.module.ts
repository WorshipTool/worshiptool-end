import { Module } from "@nestjs/common";
import { SongAddingService } from "./song.adding.service";
import { SongAddingController } from "./song.adding.controller";

@Module({
    imports: [],
    controllers: [
        SongAddingController
    ],
    providers: [
        SongAddingService
    ],
    exports: [
        SongAddingService
    ]
})
export class SongAddingModule {}