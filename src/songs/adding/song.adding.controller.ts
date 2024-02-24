import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SongAddingService } from "./song.adding.service";
import { AllowNonUser } from "../../auth/decorators/allownonuser.decorator";
import { PostCompareVariantsInDto } from "./song.adding.dto";

@Controller()
export class SongAddingController{
    constructor(
        private readonly songAddingService: SongAddingService
    ){}

    @AllowNonUser()
    @Post("song/adding/compare")
    compareVariants(@Body() data: PostCompareVariantsInDto){
        return this.songAddingService.getVariantRelation(data.variant1, data.variant2);
    }
}