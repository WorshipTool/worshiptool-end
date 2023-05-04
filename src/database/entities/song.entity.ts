import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { SongTitle } from "./songtitle.entity";
import { CSVLink } from "./csvlink.entity";
import { Media } from "./media.entity";
import { Tag } from "./tag.entity";

@Entity()
export class Song{
  @PrimaryGeneratedColumn("uuid")
  guid: string;
  
  @OneToOne(()=>SongTitle)
  @JoinColumn()
  mainTitle:SongTitle;

  @OneToMany(()=>SongVariant, (variant)=>variant.song)
  variants: SongVariant[]

  @OneToMany(()=>Media, (media)=>media.song, { cascade: true })
  media: Media[]

  @ManyToMany(()=>Tag, (s)=>s.songs, { cascade: true })
  @JoinTable()
  tags: Tag[]
}