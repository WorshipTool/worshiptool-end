import { Source, SourceTypes } from "src/database/entities/source.entity";

export interface SourceDTO{
    type: SourceTypes,
    value: string
}

export const mapSourceToDTO = (source: Source) : SourceDTO=> ({
    type: source.type,
    value: source.value
})