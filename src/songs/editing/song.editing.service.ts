import { Inject, Injectable } from "@nestjs/common";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { VariantEditDataInDto } from "./song.editing.dto";
import { SongAddingService } from "../adding/song.adding.service";
import { User } from "../../database/entities/user.entity";
import { SONG_TITLE_REPOSITORY, SONG_VARIANTS_REPOSITORY } from "../../database/constants";
import { Repository } from "typeorm";
import { SongTitleService } from "../modules/titles/song.title.service";

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
        const copy = await this.addingService.createCopy(variant, user)

        if(!copy) {
            throw new Error("Failed to create copy of variant: " + variant.guid)
        }

        // Edit copy
        if(data.sheetData) copy.sheetData = data.sheetData;
        if(data.title){
            copy.prefferedTitle = await this.titleService.getOrCreateTitleObject(data.title);
            copy.titles = [copy.prefferedTitle];
        }
        if(data.createdType) copy.createdType = data.createdType;
        copy.createdBy = user;

        // Save copy
        await this.variantRepository.save(copy);
        return copy;
    }
}