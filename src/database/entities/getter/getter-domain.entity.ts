import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GetterSubUrl } from "./getter-suburl.entity";

export enum GetterDomainStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

@Entity()
export class GetterDomain{
    @PrimaryGeneratedColumn()
    guid: number;  

    @Column()   
    domain: string;

    @Column({default: GetterDomainStatus.Pending})
    status: GetterDomainStatus

    @OneToMany(type => GetterSubUrl, site => site.domain)
    sites: GetterSubUrl[]

}