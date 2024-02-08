import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class GetterSource{
    @PrimaryGeneratedColumn()
    guid: number;  

    @Column()   
    url: string;

    
}