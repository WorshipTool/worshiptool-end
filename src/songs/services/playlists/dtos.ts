import { PlaylistItem } from "src/database/entities/playlistitem.entity"
import { ReorderPlaylistItemDTO } from "src/dtos/PlaylistItemDTO"
import { SongVariantDTO } from "src/dtos/SongVariantDTO"

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
export interface DeletePlaylistQuery{
    guid :string
}
export type PostDeletePlaylistResult = boolean;

export interface GetSongsInPlaylistParams{
    guid: string
}
export interface GetVariantsInPlaylistResult{
    items: PlaylistItem[],
    title: string
}

export interface PostAddVariantToPlaylistBody{
    variant: string,
    playlist: string
}
export interface DeleteRemoveVariantFromPlaylistQuery{
    variant: string,
    playlist: string
}


export interface GetIsVariantInPlaylistQuery{
    variant: string,
    playlist: string
}

export interface GetSearchInPlaylistQuery{
    searchKey: string,
    page?: number,
    guid: string
}

export interface GetSearchInPlaylistResult{
    guid: string,
    items: PlaylistItem[]
}

export interface PostReorderPlaylistBody{
    guid: string,
    items: ReorderPlaylistItemDTO[]
}

export interface PostTransposePlaylistItemBody{
    guid: string,
    key:  string,
}   