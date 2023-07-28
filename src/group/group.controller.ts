import { All, Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { GroupService } from "./group.service";
import { formatted } from "src/utils/formatted";
import { AllowOnlyAdmin } from "src/auth/decorators/allowonlyadmin.decorator";
import { DeleteGroupQuery, GetGroupInfoQuery, GetGroupSelectionQuery, PostCreateGroupBody } from "./dtos";
import { User } from "src/auth/decorators/user.decorator";
import { User as UserObject } from 'src/database/entities/user.entity';

@Controller()
export class GroupController{

    constructor(
        private groupService: GroupService
    ){}

    @AllowNonUser()
    @Get("groups/count")
    async getCount(){
        return formatted({count: await this.groupService.getCount()});
    }

    @AllowOnlyAdmin()
    @Get("groups")
    async getGroupsList(){
        return formatted(await this.groupService.getGroupsList());
    }

    @AllowOnlyAdmin()
    @Post("group/create")
    async createGroup(@Body() body : PostCreateGroupBody, @User() user: UserObject){
        const result = await this.groupService.createGroup(body, user);
        return result;
    }

    @AllowOnlyAdmin()
    @Delete("group")
    async deleteGroup(@Query() params: DeleteGroupQuery){
        return await this.groupService.deleteGroup(params);
    }

    @AllowNonUser()
    @Get("group")
    async getGroupInfo(@Query() params: GetGroupInfoQuery){
        return await this.groupService.getGroupInfo(params);
    }

    @Get("group/selection")
    async getGroupSelection(@Query() params: GetGroupSelectionQuery){
        return await this.groupService.getGroupSelection(params.guid);
    }
}