import { Song } from "src/database/entities/song.entity"
import { SongName } from "src/database/entities/songname.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"


interface GetSongQueryBase{
    key:string,
    page:number
}

export interface GetSongQueryConditions{
    verified? : boolean
}
interface SearchSongQuery extends GetSongQueryBase{
    key: "search",
    searchKey:string
}
interface RandomSongQuery extends GetSongQueryBase{
    key: "random"
}
interface AllSongQuery extends GetSongQueryBase{
    key: "all"
}
interface UnverifiedSongQuery extends GetSongQueryBase{
    key: "unverified"
}interface LoaderUnverifiedSongQuery extends GetSongQueryBase{
    key: "loaderUnverified"
}
export type GetSongQuery = SearchSongQuery|
                            RandomSongQuery|
                            AllSongQuery|
                            UnverifiedSongQuery|
                            LoaderUnverifiedSongQuery;



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
    sheetData: string
}

export interface NewSongDataProcessResult{
    message: string,
    guid: string
}


export function NewSongDataToVariant(data:NewSongData) : Partial<SongVariant>{
    return {
        sheet: data.sheetData
    }
}