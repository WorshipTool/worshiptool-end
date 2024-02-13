import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GetterSubUrl } from "./getter-suburl.entity";
import { GetterExplore } from "./getter-explore.entity";
import { GetterSource } from "./getter-source.entity";

export enum GetterDomainStatus {
    Approved = 0,
    Pending = 1,
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

    @OneToMany(type => GetterExplore, explore => explore.domain)
    exploration: GetterExplore[]

    @Column({default: false})
    hasScraper: boolean

    @Column({default: false})
    hasExplorer: boolean

    @OneToMany(type => GetterSource, site => site.domain)
    sources: GetterSource[]


}