import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { SongName } from "./songname.entity";
import { Song } from "./song.entity";
import { CSVLink } from "./csvlink.entity";
import { Source } from "./source.entity";

@Entity()
export class SongVariant{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @ManyToOne(()=>Song, (song)=>song.variants)
    song: Song;

    @Column({length: 5000, nullable:true})
    sheetData: string;

    @Column({length: 5000, nullable:true})
    sheetText: string;
    
    @ManyToOne(() => SongName, (title) => title.variants, {nullable:true})
    mainTitle:SongName;

    @Column()
    verified: boolean;

    @Column()
    display: boolean;

    @ManyToOne(() => User, (user) => user.variants)
    createdBy: User

    @ManyToOne(()=>CSVLink, (link)=>link.variant)
    links: CSVLink[]

    @OneToMany(()=>Source, (source)=>source.variant)
    sources: Source[]
}