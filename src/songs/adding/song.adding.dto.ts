import { SongVariant } from "../../database/entities/songvariant.entity";

export class PostCompareVariantsInDto {
    variant1: VariantRelationInDto;
    variant2: VariantRelationInDto;
}

export class VariantRelationInDto{
    title: string
    sheetData: string
}


export class SameUrlVariantRelationInDto{
    title: string
    sheetData: string
    url:string
}

export class PostCreateCopyInDto{
    variantGuid: string
}

export class PostCreateCopyOutDto{
    variant: SongVariant
    alias: string
}