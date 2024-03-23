import { SongVariantDto } from "./songvariant.dto";

export class PlaylistItemDTO {
    guid: string;
    toneKey: string;
    order: number;
    variant: SongVariantDto;
}

export class ReorderPlaylistItemDTO {
    guid: string;
    order: number;
}
