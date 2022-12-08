import { CSLink } from "./entities/cslink.entity";
import { Creator } from "./entities/creator.entity";
import { Song } from "./entities/song.entity";
import { SongVariant } from "./entities/songvariant.entity";

export interface ICreatorLinkPair{
    creator: Creator,
    link: CSLink
}

export interface IAllSongData{
    song: Song,
    creators: ICreatorLinkPair[],
    variants: SongVariant[]
}