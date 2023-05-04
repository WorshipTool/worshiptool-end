import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { Song } from "./song.entity";

@Entity()
export class SongTitle{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    title: string;

    @Column()
    searchValue: string;

    @ManyToOne(()=>SongVariant, (variant)=>variant.titles, {nullable:true})
    variant: SongVariant;


}