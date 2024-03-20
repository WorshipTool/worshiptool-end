import { Module } from "@nestjs/common";
import { SongEditingController } from "./song.editing.controller";
import { SongEditingService } from "./song.editing.service";
import { SongAddingModule } from "../adding/song.adding.module";
import { DatabaseModule } from "../../database/database.module";
import { SongTitleModule } from "../modules/titles/song.title.module";

@Module({
    imports: [
        DatabaseModule,
        SongAddingModule,
        SongTitleModule
    ],
    controllers: [
        SongEditingController
    ],
    providers: [
        SongEditingService
    ],
    exports: [
        SongEditingService
    ]
})
export class SongEditingModule{}