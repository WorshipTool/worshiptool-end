import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm';
import { SongVariant } from './songvariant.entity';
import { User } from './user.entity';

@Entity()
export class Playlist{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    title: string;

    @ManyToMany(()=>SongVariant, (v)=>v.playlists)
    songs: SongVariant[]

    @ManyToOne(()=>User, (u)=>u.playlists)
    owner: User;


}