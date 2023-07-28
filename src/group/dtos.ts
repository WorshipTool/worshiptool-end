export interface PostCreateGroupBody{
    name: string
}

export interface DeleteGroupQuery{
    guid?: string,
    name?: string
}

export interface PostCreateGroupResult{
    guid:string;
    name: string;
    selection: string;
}

export interface GetGroupSelectionQuery{
    guid: string
}

export interface GetGroupInfoQuery{
    guid?: string
    name?: string
}