import { SongVariantDTO } from "./SongVariantDTO";

export interface PlaylistItemDTO {
    guid: string;
    toneKey: string;
    order: number;
    variant: SongVariantDTO;
}

export interface ReorderPlaylistItemDTO{
    guid: string;
    order: number;
}