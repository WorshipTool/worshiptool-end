import { Song } from "src/database/entities/song.entity"
import { SongName } from "src/database/entities/songname.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"


interface GetSongQueryBase{
    key:string,
    conditions:any,
    page:number
}
interface SearchSongQuery extends GetSongQueryBase{
    key: "search",
    searchKey:string
}
interface RandomSongQuery extends GetSongQueryBase{
    key: "random"
}
export type GetSongQuery = SearchSongQuery|RandomSongQuery;



export interface GetSongResult{
    guids: string[]
}
export interface SongDataVariant{
    guid:string,
    prefferedTitle: string,
    sheetData: string,
    sheetText: string,
    verified:boolean,
    createdBy:string
}

export interface SongDataCreator{
    name: string,
    type: string
}
export interface SongData{
    guid: string,
    mainTitle: string,
    alternativeTitles: string[],
    creators: SongDataCreator[],
    variants: SongDataVariant[]
}

export interface NewSongData{
    title: string,
    sheetData: string,
    sheetText: string
}

export interface NewSongDataProcessResult{
    message: string,
    guid: string
}