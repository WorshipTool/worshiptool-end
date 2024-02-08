import { DataSource } from "typeorm";
import { Song } from "../entities/song.entity";
import { SongTitle } from "../entities/songtitle.entity";
import { SongVariant } from "../entities/songvariant.entity";
import { Creator } from "../entities/creator.entity";
import { CSVLink } from "../entities/csvlink.entity";
import { User } from "../entities/user.entity";
import { Media } from "../entities/media.entity";
import { Source } from "../entities/source.entity";
import { Tag } from "../entities/tag.entity";
import { Playlist } from '../entities/playlist.entity';
import { Group } from '../entities/group.entity';
import { PlaylistItem } from "../entities/playlistitem.entity";
import { GetterSource } from "../entities/getter/getter-source.entity";
import { GetterDomain } from "../entities/getter/getter-domain.entity";
import { GetterSearch } from "../entities/getter/getter-search.entity";
import { GetterSubUrl } from "../entities/getter/getter-suburl.entity";

export const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'semice36',
    database: process.env.DATABASE_DATABASE || 'worshiptool',
    charset: 'utf8mb4',
    synchronize: false, //set to false because of migrations
    entities: [
        Song,
        SongTitle,
        SongVariant,
        Creator,
        CSVLink,
        User,
        Media,
        Source,
        Tag,
        Playlist,
        Group,
        PlaylistItem,
        GetterSource,
        GetterDomain,
        GetterSearch,
        GetterSubUrl
    ],
    migrations: ["dist/migrations/**/*{.js,.ts}"],
    migrationsRun: true
});

export const datasourceProvider = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            return dataSource.initialize();
        }
  }
]