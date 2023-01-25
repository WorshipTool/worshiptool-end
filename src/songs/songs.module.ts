import { Module } from "@nestjs/common";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";
import { DatabaseModule } from "src/database/database.module";
import { SongService } from "./services/song.service";
import { MessengerModule } from "src/messenger/messenger.module";

@Module({
    imports: [
        DatabaseModule,
        MessengerModule
    ],
    controllers: [SongsController],
    providers: [SongsService]
})
export class SongsModule{}