import { SongDataSource } from "../../services/adding/add.dto"
import { SongDataCreator } from "../../songs.dto"

export class SongVariantDataOutDto{
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