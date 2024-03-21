import { Body, Controller, NotFoundException, Post } from "@nestjs/common";
import { PostEditVariantInDto } from "./song.editing.dto";
import { SongEditingService } from "./song.editing.service";
import { User } from "../../database/entities/user.entity";
import { SongVariantService } from "../modules/variants/song.variant.service";
import { apiToVariantEditInDto } from "./song.editing.map";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Song Editing")
@Controller("song/variant")
export class SongEditingController{
    constructor(
        private editingService: SongEditingService,
        private variantService: SongVariantService
    ){}

    @Post("edit")
    @ApiBearerAuth()
    async editVariant(@Body() api : PostEditVariantInDto, user: User){
        const variant = await this.variantService.getVariantByGuid(api.guid);
        if(!variant) throw new NotFoundException("Variant not found");

        const data = apiToVariantEditInDto(api);

        await this.editingService.editVariant(variant, data, user);
    }
}