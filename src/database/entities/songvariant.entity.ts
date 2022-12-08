import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SongVariant{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    songGUID: string;

    @Column({length: 1000})
    sheet: string;
}