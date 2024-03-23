import { Inject, Injectable } from "@nestjs/common";
import { SONG_VARIANTS_REPOSITORY } from "../../../database/constants";
import { FindOptionsRelations, Repository } from "typeorm";
import { SongVariant } from "../../../database/entities/songvariant.entity";
import { ROLES, User } from "../../../database/entities/user.entity";
import { CreatorsService } from "../creators/creators.service";
import { SongTitleService } from "../titles/song.title.service";
import { SongVariantDataOutDto } from "./song.variant.dto";
import { UrlAliasService } from "../../../urlaliases/url.alias.service";
import { UrlAliasType } from "../../../database/entities/urlalias.entity";

@Injectable()
export class SongVariantService {
    constructor(
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        private creatorsService: CreatorsService,
        private titlesService: SongTitleService,
        private aliasService: UrlAliasService
    ) {}

    getVariantByGuid(
        guid: string,
        user?: User,
        relations?: FindOptionsRelations<SongVariant>
    ) {
        relations = relations || {
            prefferedTitle: true
        };
        return this.variantRepository.findOne({
            where: { guid },
            relations
        });
    }

    getVariantsBySongGuid(
        songGuid: string,
        user?: User,
        relations?: FindOptionsRelations<SongVariant>
    ) {
        return this.variantRepository.find({
            where: { song: { guid: songGuid } },
            relations
        });
    }

    async mapSongVariantToVariantData(
        variant: SongVariant
    ): Promise<SongVariantDataOutDto> {
        if (variant == null) throw new Error("Variant is null");
        if (!variant.prefferedTitle)
            throw new Error("PrefferedTitle relation is not set");
        if (!variant.titles) throw new Error("Titles relation is not set");
        if (!variant.createdBy)
            throw new Error("CreatedBy relation is not set");

        const titles = variant.titles;
        const preferredTitle = variant.prefferedTitle;

        const creators = await this.creatorsService.findByVariantGuid(
            variant.guid
        );

        const alias = await this.aliasService.getAliasFromValue(
            variant.guid,
            UrlAliasType.Variant
        );

        return {
            guid: variant.guid,
            prefferedTitle: preferredTitle?.title,
            titles: titles?.map((t) => t.title),
            sheetData: variant.sheetData,
            sheetText: variant.searchValue,
            verified: variant.verified,
            createdBy: variant.createdBy.guid,
            createdByLoader: variant.createdBy.role == ROLES.Loader,
            sources: variant.sources,
            creators,
            deleted: variant.deleted,
            createdType: variant.createdType,
            alias
        };
    }
}
