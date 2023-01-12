import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Creator{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    name: string;
}