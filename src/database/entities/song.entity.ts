import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { SongName } from "./songname.entity";
import { CSVLink } from "./csvlink.entity";
import { Media } from "./media.entity";
import { Tag } from "./tag.entity";

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

  @OneToMany(()=>Media, (media)=>media.song, { cascade: true })
  media: Media[]

  @ManyToMany(()=>Tag, (s)=>s.songs, { cascade: true })
  @JoinTable()
  tags: Tag[]
}