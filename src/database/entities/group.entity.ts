import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Playlist } from './playlist.entity';
import { User } from "./user.entity";

@Entity()
export class Group{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    name: string;

    @OneToOne(()=>Playlist)
    @JoinColumn()
    selection: Playlist

    @ManyToOne(()=>User, (u)=>u.groups)
    admin: User;
}