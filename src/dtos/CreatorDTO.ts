import { Creator, CreatorType } from "src/database/entities/creator.entity";

export interface CreatorDTO{
    name: string,
    type: CreatorType
}
