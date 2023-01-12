import { Song } from "src/database/entities/song.entity"
import { SongName } from "src/database/entities/songname.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"

export interface GetSongQuery{
    key:string,
    body:string,
    count:number
}
export interface GetSongResult{
    guids: string[]
}

export interface SongData{
    song: Song,
    names: SongName[],
    creators: any,
    variants: SongVariant[]
}

export interface NewSongData{

}

export interface NewSongDataProcessResult{
    message: string
}