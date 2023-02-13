import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CSVLink } from "./csvlink.entity";

export enum CreatorType{
    "Author"
}

@Entity()
export class Creator{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    name: string;

    @OneToMany(()=>CSVLink, (link)=>link.creator)
    links: CSVLink[]
}