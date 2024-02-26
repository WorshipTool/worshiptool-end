import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GETTER_URL_MAX_LENGTH } from "../../../getter/tech/utils";
import { GetterDomain } from "./getter-domain.entity";


@Entity()
export class GetterSource{
    @PrimaryGeneratedColumn()
    guid: number;  

    @Column({length: GETTER_URL_MAX_LENGTH})   
    url: string;

    @ManyToOne(type => GetterDomain, domain => domain.sources)
    domain: GetterDomain;

    @Column({nullable: true, default: null})
    processed: Date

    
}