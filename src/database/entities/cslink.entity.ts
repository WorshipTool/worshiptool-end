import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CSLink{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    creatorGUID: string;

    @Column()
    songGUID: string;

    @Column()
    type: string;

}