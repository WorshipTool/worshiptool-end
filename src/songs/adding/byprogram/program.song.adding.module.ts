import { Module } from "@nestjs/common";
import { ProgramSongAddingService } from "./program.song.adding.service";
import { SongAddingModule } from "../song.adding.module";
import { AuthModule } from "../../../auth/auth.module";
import { SongEditingModule } from "../../editing/song.editing.module";

@Module({
    imports: [
        SongAddingModule,
        SongEditingModule,
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