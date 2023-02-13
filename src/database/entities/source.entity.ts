import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";

export enum SourceTypes{
    "Url"
}

@Entity()
export class Source{
  @PrimaryGeneratedColumn("uuid")
  guid: string;  

  @Column()
  type: SourceTypes

  @Column()
  value: string

  @ManyToOne(()=>SongVariant, (variant)=>variant.sources)
  variant: SongVariant;

}