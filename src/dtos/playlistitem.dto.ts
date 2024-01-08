import { SongVariantDTO } from "./songvariant.dto";

export class PlaylistItemDTO {
    guid: string;
    toneKey: string;
    order: number;
    variant: SongVariantDTO;
}

export class ReorderPlaylistItemDTO{
    guid: string;
    order: number;
}