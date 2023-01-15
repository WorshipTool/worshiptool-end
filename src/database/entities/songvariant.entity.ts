import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { SongName } from "./songname.entity";
import { Song } from "./song.entity";
import { CSVLink } from "./csvlink.entity";

@Entity()
export class SongVariant{
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @ManyToOne(()=>Song, (song)=>song.variants)
    song: Song;

    @Column({length: 5000})
    sheet: string;

    @Column({length: 5000})
    sheetText: string;
    
    @ManyToOne(() => SongName, (title) => title.variants)
    mainTitle:SongName;

    @Column()
    verified: boolean;

    @Column()
    display: boolean;

    @ManyToOne(() => User, (user) => user.variants)
    createdBy: User

    @ManyToOne(()=>CSVLink, (link)=>link.variant)
    links: CSVLink[]
}