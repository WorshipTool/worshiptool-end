import { CreatedType } from "../database/entities/songvariant.entity";
import { CreatorDTO } from "./creator.dto";
import { SourceDTO } from "./source.dto";

export class SongVariantDto {
    guid: string;
    songGuid: string;
    prefferedTitle: string;
    titles: string[];
    sheetData: string;
    sheetText: string;
    verified: boolean;
    createdByGuid: string;
    createdByLoader: boolean;
    sources: SourceDTO[];
    creators: CreatorDTO[];
    deleted: boolean;
    createdType: CreatedType;
    alias: string;
}
