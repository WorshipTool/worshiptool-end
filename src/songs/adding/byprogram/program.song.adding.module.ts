import { Module } from "@nestjs/common";
import { ProgramSongAddingService } from "./program.song.adding.service";

@Module({
    imports: [],
    controllers: [],
    providers: [
        ProgramSongAddingService
    ],
    exports: [
        ProgramSongAddingService
    ]
})
export class ProgramSongAddingModule{}