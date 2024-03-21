import { MediaTypes } from "src/database/entities/media.entity"
import { Song } from "src/database/entities/song.entity"
import { SongTitle } from "src/database/entities/songtitle.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"
import { NewSongData, SongDataSource } from "./services/adding/add.dto"
import { CreatorType } from "src/database/entities/creator.entity"
import { SongVariantDTO } from "src/dtos/songvariant.dto"
import { IntersectionType, PartialType } from "@nestjs/swagger"


export class GetSongQueryBase{
    key:string
    page:number
}

export class GetSongQueryConditions{
    verified? : boolean
}
export enum GetSongQueryKeys{
    RANDOM = "random",
    UNVERIFIED = "unverified",
    LOADER_UNVERIFIED = "loaderUnverified"
}
export class GetSongQuery{
    key: GetSongQueryKeys
}

export class SearchQuery{
    searchKey:string
    page:number
}

export class SearchSongData{
    guid: string
    variant: SongVariantDTO
}
export class SearchResult{
    songs: SearchSongData[]
}

export class ListQuery{
    page: number
}
export class ListSongData{
    guid: string
    title: string
}
export class ListResult{
    songs: ListSongData[]
}

export class GetSongResult{
    songs: SongData[]
}

export class PostMergeBody{
    guid1: string
    guid2: string
}
export class PostMergeResult{
    guid: string
}



export class SongDataVariant{
    guid:string
    prefferedTitle: string
    titles: string[]
    sheetData: string
    sheetText: string
    verified:boolean
    createdBy:string
    createdByLoader:boolean
    sources: SongDataSource[]
    creators: SongDataCreator[]
    deleted:boolean
}

export class SongDataMedia{
    type: MediaTypes
    url: string
}

export class SongDataCreator{
    name: string
    type: CreatorType
}

export class SongData{
    guid: string
    mainTitle: string
    creators: SongDataCreator[]
    variants: SongDataVariant[]
    media: SongDataMedia[]
    tags: string[]

}

export class PostRenamePlaylistBody{
    guid: string
    title: string
    
}

export class PostEditVariantBody{
    guid: string
    sheetData: string
    title: string
}

export class PostAddSongDataBody extends PartialType(NewSongData){}

export class PostVerifyVariantParams{
    guid: string
}


export class GetCountResult{
    count: number
}

export class GetSongDataParam{
    guid: string
}

export class GetSongListOfUserResult{
    variants: SongVariantDTO[]
}