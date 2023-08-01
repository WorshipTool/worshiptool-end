import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { SongVariant } from './songvariant.entity';
import { User } from './user.entity';
import { PlaylistItem } from './playlistitem.entity';

@Entity()
export class Playlist{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    title: string;

    @OneToMany(()=>PlaylistItem, (v)=>v.playlist, { cascade: true })
    items: PlaylistItem[]

    @ManyToOne(()=>User, (u)=>u.playlists,{ cascade: true })
    owner: User;

    @Column({default: false})
    isSelection: boolean;


}