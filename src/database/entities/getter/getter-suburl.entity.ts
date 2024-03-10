import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GetterDomain } from "./getter-domain.entity";
import { GETTER_URL_MAX_LENGTH } from "../../../getter/tech/utils";


export enum GetterSubUrlExploreStatus {
    Unexplored = 0,
    Exploring = 1,
    Explored = 2,
    ExploredWithError = 3
}

export enum GetterSuburlType{
    Page = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Other = 4,
    DomainShortcut = 5
}

@Entity()
export class GetterSubUrl{
    @PrimaryColumn({length: GETTER_URL_MAX_LENGTH})   
    url: string;

    @ManyToOne(type => GetterDomain, domain => domain.sites)
    domain: GetterDomain;

    @Column({default: GetterSubUrlExploreStatus.Unexplored})
    explored: GetterSubUrlExploreStatus;
    
    @Column({default: 0})
    exploredWithErrorCount: number;

    @Column({default: 0})
    probability: number;

    @Column({default: GetterSuburlType.Page})
    type: GetterSuburlType;

    @Column()
    lastExplored: Date;



    
}