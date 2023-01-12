import { Module } from "@nestjs/common";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";
import { DatabaseModule } from "src/database/database.module";
import { SongService } from "./services/song.service";

@Module({
    imports: [DatabaseModule],
    controllers: [SongsController],
    providers: [SongsService]
})
export class SongsModule{}