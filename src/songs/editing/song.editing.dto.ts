import { CreatedType } from "../../database/entities/songvariant.entity"

export type VariantEditDataInDto = {
    sheetData?: string,
    title?: string,
    createdType?: CreatedType
}