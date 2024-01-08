import { All, Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { GroupService } from "./group.service";
import { codes, formatted } from "src/utils/formatted";
import { AllowOnlyAdmin } from "src/auth/decorators/allowonlyadmin.decorator";
import { DeleteGroupQuery, GetGroupInfoQuery, GetGroupInfoResult, GetGroupListItem, GetGroupSelectionQuery, GetGroupsCountResult, PostCreateGroupBody, PostCreateGroupResult } from "./group.dto";
import { User } from "src/auth/decorators/user.decorator";
import { User as UserObject } from 'src/database/entities/user.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Group } from "src/database/entities/group.entity";
import { GetVariantsInPlaylistResult } from "src/songs/services/playlists/playlist.dto";

@ApiTags("Group")
@Controller()
export class GroupController{

    constructor(
        private groupService: GroupService
    ){}

    /**
     * The function returns number of all groups.
     * @returns A formatted response containing the number of groups.
     */
    @ApiOperation({summary: "Returns number of all groups."})
    @AllowNonUser()
    @Get("groups/count")
    async getCount() : Promise<GetGroupsCountResult>{
        const data : GetGroupsCountResult = {
            count: await this.groupService.getCount()
        }
        return data;
    }


    /**
     * The function returns a list of all groups.
     * Only admin users can access this endpoint.
     * @returns A formatted response containing the list of groups.
     */
    @ApiOperation({summary: "Returns a list of all groups."})
    @ApiUnauthorizedResponse({
        description: "The user is not an admin."
    })
    @ApiBearerAuth()
    @AllowOnlyAdmin()
    @Get("groups")
    async getGroupsList(){
        const data : GetGroupListItem[] = await this.groupService.getGroupsList();
        return data
    }


    /**
     * The function creates a new group.
     * Only admin users can access this endpoint.
     * @param body - The request body containing the group name.
     * @param user - The user object of the logged in user.
     * @returns A formatted response containing the created group.
     */
    @ApiOperation({summary: "Creates a new group."})
    @ApiUnauthorizedResponse({
        description: "The user is not an admin."
    })
    @ApiConflictResponse({
        description: "The group name is already taken."
    })
    @ApiBearerAuth()
    @AllowOnlyAdmin()
    @Post("group/create")
    async createGroup(@Body() body : PostCreateGroupBody, @User() user: UserObject){
        const result = await this.groupService.createGroup(body, user);
        return result;
    }


    /**
     * The function deletes a group.
     * Only admin users can access this endpoint.
     * @param params - The query parameters containing the group name or the group guid.
     * @returns A formatted response indicating the success of the group deletion.
     */
    @ApiOperation({summary: "Deletes a group."})
    @ApiUnauthorizedResponse({
        description: "The user is not an admin."
    })
    @ApiNotFoundResponse({
        description: "The group was not found."
    })
    @ApiBadRequestResponse({
        description: "Neither guid or name not provided."
    })
    @ApiBearerAuth()
    @AllowOnlyAdmin()
    @Delete("group")
    async deleteGroup(@Query() params: DeleteGroupQuery){
        return await this.groupService.deleteGroup(params);
    }


    /**
     * The function returns information about a group.
     * @param params - The query parameters containing the group name or the group guid.
     * @returns A formatted response containing the group information.
     */
    @ApiOperation({summary: "Returns information about a group."})
    @ApiNotFoundResponse({
        description: "The group was not found."
    })
    @ApiBadRequestResponse({
        description: "Neither guid or name not provided."
    })
    @AllowNonUser()
    @Get("group")
    async getGroupInfo(@Query() params: GetGroupInfoQuery){
        return await this.groupService.getGroupInfo(params);
    }


    /**
     * The function returns the selection of a group.
     * @param params - The query parameters containing the group guid.
     * @returns A formatted response containing the group selection.
     */
    @ApiOperation({summary: "Returns the selection of a group."})
    @ApiNotFoundResponse({
        description: "The group or selection was not found."
    })
    @ApiUnauthorizedResponse({
        description: "The user is not logged in."
    })
    @ApiBearerAuth()
    @Get("group/selection")
    async getGroupSelection(@Query() params: GetGroupSelectionQuery){
        return await this.groupService.getGroupSelection(params.guid);
    }
}