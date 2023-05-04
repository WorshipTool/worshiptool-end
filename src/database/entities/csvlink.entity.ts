import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Creator, CreatorType } from "./creator.entity";
import { SongVariant } from "./songvariant.entity";
import { Song } from "./song.entity";

@Entity()
export class CSVLink{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @ManyToOne(()=>Creator, (creator)=>creator.links)
    creator: Creator;

    @Column()
    type: CreatorType;

    @ManyToOne(()=>SongVariant, (variant)=>variant.links)
    variant: SongVariant;

}
