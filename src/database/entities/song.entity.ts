import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { SongName } from "./songname.entity";
import { CSVLink } from "./csvlink.entity";

@Entity()
export class Song{
  @PrimaryGeneratedColumn("uuid")
  guid: string;
  
  @OneToOne(()=>SongName)
  @JoinColumn()
  mainName:SongName;

  @OneToMany(()=>SongVariant, (variant)=>variant.song)
  variants: SongVariant[]

  @OneToMany(()=>SongName, (title)=>title.song)
  titles: SongName

  @OneToMany(()=>CSVLink, (link)=>link.song)
  links: CSVLink[]
}