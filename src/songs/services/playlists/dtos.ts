
export interface PlaylistData{
    guid:string,
    title:string
}

export interface GetPlaylistsResult{
    playlists: PlaylistData[]
}


export interface PostCreatePlaylistResult{
    guid: string
}

export interface PostCreatePlaylistBody{
    title: string
}

export interface PostDeletePlaylistBody{
    guid: string
}
export type PostDeletePlaylistResult = boolean;

export interface GetSongsInPlaylistParams{
    guid: string
}
export interface GetSongsInPlaylistResult{
    guids: string[],
    title: string
}

export interface PostAddVariantToPlaylistBody{
    variant: string,
    playlist: string
}
export interface DeleteRemoveVariantFromPlaylistBody{
    variant: string,
    playlist: string
}
export interface GetIsVariantInPlaylistQuery{
    variant: string,
    playlist: string
}