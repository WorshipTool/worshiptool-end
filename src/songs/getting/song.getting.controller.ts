import { Controller, Get, Query } from "@nestjs/common";
import { SongGettingService } from "./song.getting.service";
import { GetSongDataInDto, GetSongDataOutDto } from "./song.getting.dto";
import { User } from "../../auth/decorators/user.decorator";
import { User as UserObject } from "../../database/entities/user.entity";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../../auth/decorators/allownonuser.decorator";

@ApiTags("Song Getting")
@Controller("song")
export class SongGettingController{
    constructor(
        private gettingService: SongGettingService
    ){}

    @AllowNonUser()
    @Get("ofvariant/:guid")
    getSongDataByVariantGuid(@Query() {guid}: GetSongDataInDto, @User() user: UserObject) : Promise<GetSongDataOutDto>{
        return this.gettingService.getSongDataByVariantGuid(guid, user);
    }
}