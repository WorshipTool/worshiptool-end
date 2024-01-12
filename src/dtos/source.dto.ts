import { Source, SourceTypes } from "src/database/entities/source.entity";

export class SourceDTO{
    type: SourceTypes
    value: string
}

export const mapSourceToDTO = (source: Source) : SourceDTO=> ({
    type: source.type,
    value: source.value
})