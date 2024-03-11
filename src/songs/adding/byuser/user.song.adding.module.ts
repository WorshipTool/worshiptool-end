import { Module } from "@nestjs/common";
import { UserSongAddingService } from "./user.song.adding.service";
import { SongAddingModule } from "../song.adding.module";

@Module({
    imports: [
        SongAddingModule
    ],
    controllers: [],
    providers: [
        UserSongAddingService
    ],
    exports: []
})
export class UserSongAddingModule{}