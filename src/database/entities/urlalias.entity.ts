import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlaylistItem } from "./playlistitem.entity";

export enum UrlAliasType {
    Variant
}

@Entity()
export class UrlAlias {
    @PrimaryGeneratedColumn("uuid")
    guid: string;

    @Column()
    alias: string;

    @Column()
    value: string;

    @Column()
    type: UrlAliasType;

    @OneToMany(() => PlaylistItem, (item) => item.alias, { cascade: true })
    playlistItems: PlaylistItem[];
}
