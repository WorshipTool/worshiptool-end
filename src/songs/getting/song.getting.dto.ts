import { SongData } from "../songs.dto";

export class GetSongDataOutDto extends SongData {}

export class GetSongDataInDto{
    guid: string
}