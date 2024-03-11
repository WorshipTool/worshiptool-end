import { Module } from "@nestjs/common";
import { SourceProcessController } from "./source-process.controller";
import { SourceProcessService } from "./source-process.service";
import { SourceExtractModule } from "./source-extract/source-extract.module";
import { DatabaseModule } from "../../../database/database.module";
import { ProgramSongAddingModule } from "../../../songs/adding/byprogram/program.song.adding.module";

@Module({
    imports: [
        SourceExtractModule,
        DatabaseModule,
        ProgramSongAddingModule
    ],
    controllers: [
        SourceProcessController
    ],
    providers: [
        SourceProcessService
    ],
})
export class SourceProcessModule {}