import { MediaTypes } from "src/database/entities/media.entity"
import { Song } from "src/database/entities/song.entity"
import { SongTitle } from "src/database/entities/songtitle.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"
import { SongDataSource } from "./services/adding/dtos"
import { CreatorType } from "src/database/entities/creator.entity"
import { SongVariantDTO } from "src/dtos/SongVariantDTO"


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

export type SearchQuery = {
    searchKey:string,
    page:number
}

export interface SearchSongData{
    guid: string,
    variant: SongVariantDTO
}
export interface SearchResult{
    songs: SearchSongData[]
}

export interface ListQuery{
    page: number
}
export interface ListSongData{
    guid: string,
    title: string
}
export interface ListResult{
    songs: ListSongData[]
}

export interface GetSongResult{
    songs: SongData[]
}

export interface PostMergeBody{
    guid1: string,
    guid2: string
}
export interface PostMergeResult{
    guid: string
}



export interface SongDataVariant{
    guid:string,
    prefferedTitle: string,
    titles: string[],
    sheetData: string,
    sheetText: string,
    verified:boolean,
    createdBy:string,
    createdByLoader:boolean,
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
    creators: SongDataCreator[],
    variants: SongDataVariant[],
    media: SongDataMedia[],
    tags: string[],

}

