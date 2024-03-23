import { Module } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { DatabaseModule } from "../database/database.module";
import { PlaylistModule } from "../songs/modules/playlists/playlist.module";

@Module({
    imports: [
        DatabaseModule,
        PlaylistModule
    ],
    controllers: [GroupController],
    providers: [GroupService]
})
export class GroupModule{}