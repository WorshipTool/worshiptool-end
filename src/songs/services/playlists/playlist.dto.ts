import { PlaylistItem } from "src/database/entities/playlistitem.entity"
import { PlaylistItemDTO, ReorderPlaylistItemDTO } from "src/dtos/playlistitem.dto"
import { SongVariantDTO } from "src/dtos/songvariant.dto"

export class PlaylistData{
    guid:string
    title:string
}

export class GetPlaylistsResult{
    playlists: PlaylistData[]
}


export class PostCreatePlaylistResult{
    guid: string
}

export class PostCreatePlaylistBody{
    title: string
}

export class PostDeletePlaylistBody{
    guid: string
}
export class DeletePlaylistQuery{
    guid :string
}
export type PostDeletePlaylistResult = boolean;

export class GetSongsInPlaylistParams{
    guid: string
}
export class GetVariantsInPlaylistResult{
    title: string
    items: PlaylistItemDTO[]
}

export class PostAddVariantToPlaylistBody{
    variant: string
    playlist: string
}
export class DeleteRemoveVariantFromPlaylistQuery{
    variant: string
    playlist: string
}


export class GetIsVariantInPlaylistQuery{
    variant: string
    playlist: string
}

export class GetSearchInPlaylistQuery{
    searchKey: string
    page?: number
    guid: string
}

export class GetSearchInPlaylistResult{
    guid: string
    items: PlaylistItemDTO[]
}

export class PostReorderPlaylistBody{
    guid: string
    items: ReorderPlaylistItemDTO[]
}

export class PostTransposePlaylistItemBody{
    guid: string
    key:  string
}   