import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Creator } from "./creator.entity";
import { SongVariant } from "./songvariant.entity";
import { Song } from "./song.entity";

@Entity()
export class CSVLink{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @ManyToOne(()=>Creator, (creator)=>creator.links)
    creator: Creator;

    @ManyToOne(()=>Song, (song)=>song.links)
    song: Song;
    
    @ManyToOne(()=>SongVariant, (variant)=>variant.links)
    variant: SongVariant;

    @Column()
    type: string;

}