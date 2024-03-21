import { Module } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";

@Module({
    imports:[],
    controllers:[],
    providers:[
        PlaylistService
    ],
    exports:[
        PlaylistService
    ]
})
export class PlaylistModule{}