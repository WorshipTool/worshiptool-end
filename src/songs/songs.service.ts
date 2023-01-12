import { Inject, Injectable } from "@nestjs/common";
import { SongService } from "./services/song.service";
import { GetSongQuery, GetSongResult, NewSongData, NewSongDataProcessResult, SongData } from "./dtos";

@Injectable()
export class SongsService{
    constructor(
        private songService: SongService
    ){}


    processGetQuery(query: GetSongQuery): GetSongResult{
        return {
            guids:[]
        }
    }

    gatherSongData(guid: string): SongData{
        return {
            song:null,
            names:[],
            creators: null,
            variants: []
        };
    }

    processNewSongData(data: NewSongData):NewSongDataProcessResult{
        return {
            message: "Maybe your data object is empty, but that is ok."
        }
    }
}