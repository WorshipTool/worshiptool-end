import { Inject, Injectable } from "@nestjs/common";
import { SONG_VARIANTS_REPOSITORY } from "../../../database/constants";
import { Repository } from "typeorm";
import { SongVariant } from "../../../database/entities/songvariant.entity";

@Injectable()
export class SongVariantService{
    constructor(
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>
    ){}

    getVariantByGuid(guid:string){
        return this.variantRepository.findOne({where:{guid}});
    }
}