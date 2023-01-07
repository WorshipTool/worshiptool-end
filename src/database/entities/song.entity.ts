import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Song{
  @PrimaryGeneratedColumn("uuid")
  guid: string;
  
  @Column()
  mainNameGUID:string;

  @Column()
  verified: boolean;

  @Column()
  display: boolean;
}