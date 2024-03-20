import { Module } from "@nestjs/common";
import { SongTitleService } from "./song.title.service";
import { DatabaseModule } from "../../../database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        SongTitleService
    ],
    exports: [
        SongTitleService
    ]
})
export class SongTitleModule{}