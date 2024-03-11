import { Module } from "@nestjs/common";
import { ProgramSongAddingService } from "./program.song.adding.service";
import { SongAddingModule } from "../song.adding.module";
import { AuthModule } from "../../../auth/auth.module";

@Module({
    imports: [
        SongAddingModule,
        AuthModule
    ],
    controllers: [],
    providers: [
        ProgramSongAddingService
    ],
    exports: [
        ProgramSongAddingService
    ]
})
export class ProgramSongAddingModule{}