import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { Song } from "./song.entity";

@Entity()
export class SongName{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @ManyToOne(()=>Song, (song)=>song.titles)
    song: Song

    @Column()
    name: string

    @OneToMany(()=>SongVariant, (variant)=>variant.mainTitle)
    variants: SongVariant[]


}