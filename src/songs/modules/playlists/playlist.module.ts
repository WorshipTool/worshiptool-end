import { Module } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { DatabaseModule } from "../../../database/database.module";

@Module({
    imports:[
        DatabaseModule
    ],
    controllers:[],
    providers:[
        PlaylistService
    ],
    exports:[
        PlaylistService
    ]
})
export class PlaylistModule{}