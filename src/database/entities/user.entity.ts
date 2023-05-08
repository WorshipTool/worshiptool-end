import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { Playlist } from './playlist.entity';
import { Group } from './group.entity';

export enum ROLES{
    "User",
    "Trustee",
    "Loader",
    "Admin"
}

@Entity()
export class User{
    @PrimaryGeneratedColumn("uuid")
    guid: string;
    
    @Column()
    firstName:string;  

    @Column()
    lastName:string; 

    @Column()
    email:string; 

    @Column()
    password:string; 

    @Column()
    role:ROLES; 

    @OneToMany(()=>SongVariant, (variant)=>variant.createdBy)
    variants: SongVariant[]

    @OneToMany(()=>Playlist, (p)=>p.owner)
    playlists: Playlist[]

    @OneToMany(()=>Group, (g)=>g.admin)
    groups: Group[]
}