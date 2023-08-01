import { note } from "@pepavlin/sheet-api";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { Playlist } from "./playlist.entity";

@Entity()
export class PlaylistItem{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column({default: "C"})
    toneKey: note

    @Column()
    order: number

    @ManyToOne(()=>SongVariant, (variant)=>variant.playlistItems, {onDelete: "CASCADE"})
    variant: SongVariant

    @ManyToOne(()=>Playlist, (p)=>p.items, {onDelete: "CASCADE"})
    playlist: Playlist
}