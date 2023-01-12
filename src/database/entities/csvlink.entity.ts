import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CSVLink{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    creatorGUID: string;

    @Column()
    songGUID: string;
    
    @Column()
    variantGUID: string;

    @Column()
    type: string;

}