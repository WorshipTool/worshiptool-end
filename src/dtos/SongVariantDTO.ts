import { CreatorDTO } from "./CreatorDTO"
import { SourceDTO } from "./SourceDTO"

export interface SongVariantDTO{
    guid:string,
    songGuid:string,
    prefferedTitle: string,
    titles: string[],
    sheetData: string,
    sheetText: string,
    verified:boolean,
    createdByGuid:string,
    createdByLoader:boolean,
    sources: SourceDTO[],
    creators: CreatorDTO[]
}

