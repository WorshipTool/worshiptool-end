import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "./song.entity";

export enum MediaTypes{
    "Youtube"
}

@Entity()
export class Media{
  @PrimaryGeneratedColumn("uuid")
  guid: string;  

  @ManyToOne(()=>Song, (variant)=>variant.media)
  song: Song

  @Column()
  type: MediaTypes

  @Column()
  url: string


}