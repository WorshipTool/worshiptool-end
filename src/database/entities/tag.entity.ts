import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "./song.entity";


@Entity()
export class Tag{
  @PrimaryGeneratedColumn("uuid")
  guid: string;  

  @ManyToMany(()=>Song, (s)=>s.tags, { cascade: true })
  songs: Song[]

  @Column()
  value:string;


}