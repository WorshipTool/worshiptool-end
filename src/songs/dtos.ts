import { MediaTypes } from "src/database/entities/media.entity"
import { Song } from "src/database/entities/song.entity"
import { SongName } from "src/database/entities/songname.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"
import { SongDataSource } from "./services/adding/dtos"
import { CreatorType } from "src/database/entities/creator.entity"


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
    createdBy:string,
    sources: SongDataSource[],
    creators: SongDataCreator[]
}

export interface SongDataMedia{
    type: MediaTypes,
    url: string
}

export interface SongDataCreator{
    name: string,
    type: CreatorType
}


export interface SongData{
    guid: string,
    mainTitle: string,
    alternativeTitles: string[],
    creators: SongDataCreator[],
    variants: SongDataVariant[],
    media: SongDataMedia[],
    tags: string[]

}

