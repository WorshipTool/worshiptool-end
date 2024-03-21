import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { VariantEditDataInDto } from "./song.editing.dto";
import { SongAddingService } from "../adding/song.adding.service";
import { User } from "../../database/entities/user.entity";
import { SONG_TITLE_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "../../database/constants";
import { Repository } from "typeorm";
import { SongTitleService } from "../modules/titles/song.title.service";
import { SongTitle } from "../../database/entities/songtitle.entity";

// TODO: When title is edited, all variant history should be updated.. 
// maybe change title entity relation to ManyToOne, One title belongs to multiple variant?

@Injectable()
export class SongEditingService{
    constructor(
        private addingService: SongAddingService,
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        private titleService: SongTitleService
    ){}

    /**
     * Creates a new copy of variant
     * with different data
     */
    async editVariant(variant: SongVariant, data: VariantEditDataInDto, user: User){
        // Can edit only variant which is owned by user
        if(!variant.createdBy) 
            throw new Error("Variant has no creator.")
        if(variant.createdBy.guid !== user.guid)
            throw new UnauthorizedException("Variant cannot be edited by this user.")

        // Can edit only unverified variant
        if(variant.verified)
            throw new ConflictException("Variant is verified");
        
        // Check if title is reachable, implementation error
        if(data.title &&!variant.prefferedTitle) 
            throw new Error("Variant's title is not reachable.")
        
        
        // Create copy of variant, because new sheet data or created type
        const copy = await this.addingService.createCopy(variant, user)

        if(!copy) {
            throw new Error("Failed to create copy of variant: " + variant.guid)
        }

        // Edit copy
        if(data.sheetData) copy.sheetData = data.sheetData;
        if(data.createdType) copy.createdType = data.createdType;

        // Save copy
        await this.variantRepository.save(copy);
        return copy;
    }
}