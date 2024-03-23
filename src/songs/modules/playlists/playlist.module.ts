import { Module } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { DatabaseModule } from "../../../database/database.module";
import { SongService } from "../songs/song.service";
import { SongModule } from "../songs/song.module";
import { PlaylistUtilsService } from "./playlistutils.service";

@Module({
    imports:[
        DatabaseModule,
        SongModule
    ],
    controllers:[],
    providers:[
        PlaylistService,
        
    ],
    exports:[
        PlaylistService,
    ]
})
export class PlaylistModule{}