import { CSVLink } from "./entities/csvlink.entity";
import { Creator } from "./entities/creator.entity";
import { Song } from "./entities/song.entity";
import { SongVariant } from "./entities/songvariant.entity";
import { SongName } from "./entities/songname.entity";

export interface ICreatorLinkPair{
    creator: Creator,
    link: CSVLink
}

export interface IAllSongData{
    song: Song[],
    names: SongName[],
    creators: ICreatorLinkPair[],
    variants: SongVariant[]
}

export interface ISongDataArray{
    songs: IAllSongData[]
}

export interface INewSongData{
    title: string,
    sheetData: string,
    sheetText: string
}

export interface ISongGetQuery{
    key: string,
    body: string,
    count: number
}

export interface ISongGetResult{
    guids: string[]
}

export interface ILoginQuery{
    email:string,
    password:string
}

export interface IUser{
    name: string,
    isAdmin: boolean,
}

export interface ILoginResult{
    success: boolean,
    user: IUser | null,
    token: string
}