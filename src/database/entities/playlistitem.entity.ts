import { note } from "@pepavlin/sheet-api";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { SongVariant } from "./songvariant.entity";
import { Playlist } from "./playlist.entity";
import { UrlAlias } from "./urlalias.entity";

@Entity()
export class PlaylistItem {
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column({ default: "C" })
    toneKey: note;

    @Column()
    order: number;

    @ManyToOne(() => UrlAlias, (alias) => alias.playlistItems, {
        onDelete: "CASCADE"
    })
    alias: UrlAlias;

    @ManyToOne(() => Playlist, (p) => p.items, { onDelete: "CASCADE" })
    playlist: Playlist;
}
