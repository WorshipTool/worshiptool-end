import { Group } from "src/database/entities/group.entity";

export class PostCreateGroupBody{
    name: string
}

export class DeleteGroupQuery{
    guid?: string
    name?: string
}

export class PostCreateGroupResult{
    guid:string;
    name: string;
    selection: string;
}

export class GetGroupSelectionQuery{
    guid: string
}

export class GetGroupInfoQuery{
    guid?: string
    name?: string
}

export class GetGroupsCountResult{
    count: number
}

export class GetGroupListItem{
    guid: string
    name: string
}

export class GetGroupInfoResult{
    guid: string
    name: string
    selection: string
}