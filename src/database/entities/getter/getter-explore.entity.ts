import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GetterDomain } from "./getter-domain.entity";

@Entity()
export class GetterExplore{
    @PrimaryGeneratedColumn('uuid')
    guid: number;  

    @ManyToOne(type => GetterDomain, domain => domain.exploration)
    domain: GetterDomain;

    @Column()
    date: Date;

    @Column()
    count: number;
    
}