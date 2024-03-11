import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SimilarVariantService } from "./similar.variant.service";
import { AllowNonUser } from "../../auth/decorators/allownonuser.decorator";
import { PostCompareVariantsInDto, VariantRelationInDto } from "./song.adding.dto";
import { SongAddingTechService } from "./song.adding.tech.service";

@Controller()
export class SongAddingController{
    constructor(
        private readonly songAddingService: SimilarVariantService,
        private readonly songAddingTechService: SongAddingTechService
    ){}

    @AllowNonUser()
    @Post("song/adding/compare")
    compareVariants(@Body() data: PostCompareVariantsInDto){
        return this.songAddingTechService.getVariantRelation(data.variant1, data.variant2);
    }

    @AllowNonUser()
    @Post("song/adding/find-most-similar")
    findMostSimilarVariant(@Body() data: VariantRelationInDto){
        return this.songAddingService.findMostSimilarVariant(data);
    }
}