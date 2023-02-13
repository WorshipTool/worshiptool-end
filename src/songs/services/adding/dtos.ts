import { CreatorType } from "src/database/entities/creator.entity"
import { MediaTypes } from "src/database/entities/media.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"
import { SourceTypes } from "src/database/entities/source.entity"

export interface SongDataMedia{
    type: MediaTypes,
    url: string
}

export interface SongDataSource{
    type: SourceTypes,
    value: string
}

export interface NewSongDataCreator{
    type: CreatorType,
    name: string
}

export interface NewSongData{
    songGuid: string,
    title: string,
    sheetData: string,
    source: SongDataSource,
    media: SongDataMedia[],
    tags: string[],
    creators: NewSongDataCreator[]
}

export interface NewSongDataProcessResult{
    message: string,
    guid: string
}



export function NewSongDataToVariant(data:{sheetData:string}) : Partial<SongVariant>{
    return {
        sheetData: data.sheetData
    }
}