import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SongName{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    songGUID: string

    @Column()
    name: string

}