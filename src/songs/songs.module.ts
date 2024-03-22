import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MessengerModule } from "../messenger/messenger.module";
import { ParserService } from "./services/parser/parser.service";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";
import { SongAddingModule } from "./adding/song.adding.module";
import { SongEditingModule } from "./editing/song.editing.module";
import { SongDeletingModule } from "./deleting/song.deleting.module";
import { SongGettingModule } from "./getting/song.getting.module";

@Module({
    imports: [
        DatabaseModule,
        MessengerModule,
        SongAddingModule,
        SongEditingModule,
        SongDeletingModule,
        SongGettingModule
    ],
    controllers: [SongsController],
    providers: [SongsService, ParserService]
})
export class SongsModule{}