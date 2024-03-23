import {
    CreatedType,
    SongVariant
} from "../../database/entities/songvariant.entity";

export type VariantEditDataInDto = {
    sheetData?: string;
    title?: string;
    createdType?: CreatedType;
};

export class PostEditVariantInDto {
    guid: string;
    sheetData?: string;
    title?: string;
}

export class EditVariantOutDto {
    variant: SongVariant;
    alias: string;
}
