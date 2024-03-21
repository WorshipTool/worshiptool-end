import { Controller, Param, Post, UnauthorizedException } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DeleteDeleteVariantInDto, PostDeleteVariantInDto } from "./song.deleting.dto";
import { ROLES, User as UserObject } from "../../database/entities/user.entity";
import { User } from "../../auth/decorators/user.decorator";
import { SongDeletingService } from "./song.deleting.service";

@ApiTags("Song Deleting")
@Controller("song/variant")
export class SongDeletingController{
    constructor(
        private deletingService: SongDeletingService
    ){}

    
    @ApiBearerAuth()
    @Post("delete/:guid")
    async delete(@Param() {guid}: DeleteDeleteVariantInDto, @User() user : UserObject){
        return await this.deletingService.deleteVariant(guid, user);
    }

    @ApiBearerAuth()
    @Post("restore/:guid")
    async restore(@Param() {guid}: PostDeleteVariantInDto, @User() user : UserObject){
        if((user.role!=ROLES.Admin))
            throw new UnauthorizedException("Only admins can restore variants.");

        const result = await this.deletingService.restoreVariant(guid);
        return result;
    }
}