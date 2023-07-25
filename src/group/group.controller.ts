import { Controller, Get } from "@nestjs/common";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { GroupService } from "./group.service";
import { formatted } from "src/utils/formatted";
import { AllowAdmin } from "src/auth/decorators/allowadmin.decorator";

@Controller('groups')
export class GroupController{

    constructor(
        private groupService: GroupService
    ){}

    @AllowNonUser()
    @Get("count")
    async getCount(){
        return formatted({count: await this.groupService.getCount()});
    }

    // @AllowNonUser()
    @AllowAdmin()
    @Get()
    async getGroupsNames(){
        return formatted(await this.groupService.getGroupsNames());
    }
}