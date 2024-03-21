import { Body, Controller, Get, NotFoundException, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SimilarVariantService } from "./similar.variant.service";
import { AllowNonUser } from "../../auth/decorators/allownonuser.decorator";
import { PostCompareVariantsInDto, PostCreateCopyInDto, VariantRelationInDto } from "./song.adding.dto";
import { SongAddingTechService } from "./song.adding.tech.service";
import { User } from "../../auth/decorators/user.decorator";
import { User as UserObject } from 'src/database/entities/user.entity';
import { SongAddingService } from "./song.adding.service";
import { SongVariantService } from "../modules/variants/song.variant.service";

@ApiTags("Song Adding")
@Controller()
export class SongAddingController{
    constructor(
        private readonly similarService: SimilarVariantService,
        private readonly songAddingTechService: SongAddingTechService,
        private readonly addingService: SongAddingService,
        private variantsService: SongVariantService
    ){}

    // @AllowNonUser()
    // @Post("song/adding/compare")
    // compareVariants(@Body() data: PostCompareVariantsInDto){
    //     return this.songAddingTechService.getVariantRelation(data.variant1, data.variant2);
    // }

    // @AllowNonUser()
    // @Post("song/adding/find-most-similar")
    // findMostSimilarVariant(@Body() data: VariantRelationInDto){
    //     return this.similarService.findMostSimilarVariant(data);
    // }

    @AllowNonUser()
    @ApiBearerAuth()
    @Post("create/copy")
    async createCopy(@Body() data: PostCreateCopyInDto, @User() user: UserObject){
        console.log("Creating copy of variant: ", data.variantGuid, " by user: ", user?.guid)
        const variant = await this.variantsService.getVariantByGuid(data.variantGuid);
        if(!variant) throw new NotFoundException("Variant not found.");

        const copy = await this.addingService.createCopy(variant, user);
        return copy;
    }
}