import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MessengerModule } from "../messenger/messenger.module";
import { ParserService } from "./services/parser.service";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";

@Module({
    imports: [
        DatabaseModule,
        MessengerModule
    ],
    controllers: [SongsController],
    providers: [SongsService, ParserService]
})
export class SongsModule{}