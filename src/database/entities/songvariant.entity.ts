import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SongVariant{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    songGUID: string;

    @Column({length: 5000})
    sheet: string;

    @Column({length: 5000})
    sheetText: string;
    
    @Column()
    mainNameGUID:string;
}