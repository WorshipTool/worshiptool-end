import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { SongTitle } from "./songtitle.entity";
import { Song } from "./song.entity";
import { CSVLink } from "./csvlink.entity";
import { Source } from "./source.entity";
import { note } from "@pepavlin/sheet-api";
import { Playlist } from './playlist.entity';
import { PlaylistItem } from "./playlistitem.entity";

export enum VariantType{
    "Original",
    "Translation"
}

@Entity()
export class SongVariant{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column({length: 5000, nullable:true})
    sheetData: string;

    @Column({length: 5000, nullable:true})
    searchValue: string;
    
    @Column()
    verified: boolean;

    @Column({nullable:true})
    toneKey: note

    @Column({nullable:true})
    type: VariantType
    
    @OneToOne(()=>SongTitle)
    @JoinColumn()
    prefferedTitle:SongTitle;

    @OneToMany(()=>SongTitle, (title)=>title.variant)
    titles: SongTitle[]
    
    @ManyToOne(()=>Song, (song)=>song.variants)
    song: Song;

    @ManyToOne(() => User, (user) => user.variants)
    createdBy: User

    @ManyToOne(()=>CSVLink, (link)=>link.variant)
    links: CSVLink[]

    @OneToMany(()=>Source, (source)=>source.variant)
    sources: Source[]

    @OneToMany(()=>PlaylistItem, (item)=>item.variant, { cascade: true })
    playlistItems: PlaylistItem[]


}