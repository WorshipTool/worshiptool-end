import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GetterSearch{
    @PrimaryGeneratedColumn()
    guid: number;  

    @Column()   
    query: string;

    @Column()
    lastSearch: Date;

    @Column({default: 0})
    lastPage: number;

    @Column({default: false})
    processedAll: boolean;

}