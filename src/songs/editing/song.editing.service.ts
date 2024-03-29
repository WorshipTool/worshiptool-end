import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { EditVariantOutDto, VariantEditDataInDto } from "./song.editing.dto";
import { SongAddingService } from "../adding/song.adding.service";
import { ROLES, User } from "../../database/entities/user.entity";
import {
    SONG_TITLE_REPOSITORY,
    SONG_VARIANTS_REPOSITORY
} from "../../database/constants";
import { Repository } from "typeorm";
import { SongTitleService } from "../modules/titles/song.title.service";
import { SongTitle } from "../../database/entities/songtitle.entity";
import { UrlAliasService } from "../../urlaliases/url.alias.service";
import { UrlAliasType } from "../../database/entities/urlalias.entity";
import {
    createVariantAlias,
    shouldCreateNewAlias
} from "../../urlaliases/url.alias.tech";
import { Sheet } from "@pepavlin/sheet-api";
import normalizeSearchText from "../../tech/normalizeSearchText";
import { SongDeletingService } from "../deleting/song.deleting.service";

// TODO: When title is edited, all variant history should be updated..
// maybe change title entity relation to ManyToOne, One title belongs to multiple variant?

@Injectable()
export class SongEditingService {
    constructor(
        private addingService: SongAddingService,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        private titleService: SongTitleService,
        private aliasService: UrlAliasService,
        private deletingService: SongDeletingService
    ) {}

    /**
     * Creates a new copy of variant
     * with different data
     */
    async editVariant(
        variant: SongVariant,
        data: VariantEditDataInDto,
        user: User
    ): Promise<EditVariantOutDto> {
        // Can edit only variant which is owned by user
        if (!variant.createdBy) throw new Error("Variant has no creator.");
        if (
            !(
                variant.createdBy.role == ROLES.Loader &&
                user.role === ROLES.Admin
            ) &&
            variant.createdBy.guid !== user.guid
        )
            throw new UnauthorizedException(
                "Variant cannot be edited by this user."
            );

        // Can edit only unverified variant
        if (variant.verified)
            throw new ConflictException("Variant is verified");

        // Check if title is reachable, implementation error
        if (data.title && !variant.prefferedTitle)
            throw new Error("Variant's title is not reachable.");

        // Create copy of variant, because new sheet data or created type
        const { variant: copy } = await this.addingService.createCopy(
            variant,
            user
        );

        if (!copy) {
            throw new Error(
                "Failed to create copy of variant: " + variant.guid
            );
        }

        // Edit copy
        if (data.sheetData) {
            const sheet = new Sheet(data.sheetData);
            let sheetText = normalizeSearchText(sheet.getText());
            copy.sheetData = data.sheetData;
            copy.searchValue = sheetText;
            copy.toneKey = sheet.getKeyChord()?.data.rootNote.toString();
        }
        if (data.createdType) copy.createdType = data.createdType;
        if (data.title) {
            copy.prefferedTitle = await this.titleService.createTitleObject(
                data.title
            );
        }

        // Save copy
        await this.variantRepository.save(copy);

        await this.switchVariantInAllPlaylist(variant, copy);

        // All aliases should be changed to new variant
        await this.aliasService.changeAllValues(
            variant.guid,
            copy.guid,
            UrlAliasType.Variant
        );
        // Get alias to return
        let alias = await this.aliasService.getAliasFromValue(
            copy.guid,
            UrlAliasType.Variant
        );
        const shouldCreateNew = shouldCreateNewAlias(alias, variant);
        if (shouldCreateNew) {
            alias = createVariantAlias(copy);
            await this.aliasService.addAlias(
                alias,
                copy.guid,
                UrlAliasType.Variant
            );
        }

        //Delete old variant
        this.deletingService.deleteVariant(variant.guid, user);

        return {
            variant: copy,
            alias
        };
    }

    private switchVariantInAllPlaylist(from: SongVariant, to: SongVariant) {
        // TODO: Implement
    }
}
