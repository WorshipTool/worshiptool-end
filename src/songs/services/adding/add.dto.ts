import { CreatorType } from "src/database/entities/creator.entity"
import { MediaTypes } from "src/database/entities/media.entity"
import { SongVariant } from "src/database/entities/songvariant.entity"
import { SourceTypes } from "src/database/entities/source.entity"

export class SongDataMedia{
    type: MediaTypes
    url: string
}

export class SongDataSource{
    type: SourceTypes
    value: string
}

export class NewSongDataCreator{
    type: CreatorType
    name: string
}

export class NewSongData{
    songGuid: string
    title: string
    sheetData: string
    source: SongDataSource
    media: SongDataMedia[]
    tags: string[]
    creators: NewSongDataCreator[]
}

export class NewSongDataProcessResult{
    message: string
    guid: string
    alias: string
}



export function NewSongDataToVariant(data:{sheetData:string}) : Partial<SongVariant>{
    return {
        sheetData: data.sheetData
    }
}