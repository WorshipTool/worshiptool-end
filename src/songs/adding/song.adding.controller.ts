import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SongAddingService } from "./song.adding.service";
import { AllowNonUser } from "../../auth/decorators/allownonuser.decorator";
import { PostCompareVariantsInDto } from "./song.adding.dto";
import { SongAddingTechService } from "./song.adding.tech.service";

@Controller()
export class SongAddingController{
    constructor(
        private readonly songAddingTechService: SongAddingTechService
    ){}

    @AllowNonUser()
    @Post("song/adding/compare")
    compareVariants(@Body() data: PostCompareVariantsInDto){
        return this.songAddingTechService.getVariantRelation(data.variant1, data.variant2);
    }
}