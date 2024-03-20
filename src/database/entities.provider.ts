import { DataSource } from "typeorm";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY, MEDIA_REPOSITORY, PLAYLIST_REPOSITORY, SONG_TITLE_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SOURCE_REPOSITORY, TAG_REPOSITORY, USER_REPOSITORY, GROUP_REPOSITORY, PLAYLIST_ITEMS_REPOSITORY, GETTER_SOURCES_REPOSITORY, GETTER_DOMAIN_REPOSITORY, GETTER_SEARCH_REPOSITORY, GETTER_SUBURL_REPOSITORY, GETTER_EXPLORE_REPOSITORY } from './constants';
import { SongVariant } from "./entities/songvariant.entity";
import { Song } from "./entities/song.entity";
import { Creator } from "./entities/creator.entity";
import { CSVLink } from "./entities/csvlink.entity";
import { SongTitle } from "./entities/songtitle.entity";
import { User } from "./entities/user.entity";
import { Media } from "./entities/media.entity";
import { Source } from "./entities/source.entity";
import { Tag } from "./entities/tag.entity";
import { Playlist } from './entities/playlist.entity';
import { Group } from './entities/group.entity';
import { PlaylistItem } from "./entities/playlistitem.entity";
import { GetterSource } from "./entities/getter/getter-source.entity";
import { GetterDomain } from "./entities/getter/getter-domain.entity";
import { GetterSearch } from "./entities/getter/getter-search.entity";
import { GetterSubUrl } from "./entities/getter/getter-suburl.entity";
import { GetterExplore } from "./entities/getter/getter-explore.entity";

export const EntitiesProvider = [
    {
        provide: SONG_VARIANTS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SongVariant),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: SONG_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Song),
        inject: ['DATA_SOURCE'],
    },
    
    {
        provide: CREATOR_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Creator),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: CSVLINK_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(CSVLink),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: SONG_TITLE_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SongTitle),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: USER_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: MEDIA_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Media),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: SOURCE_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Source),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: TAG_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Tag),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: PLAYLIST_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Playlist),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GROUP_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Group),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: PLAYLIST_ITEMS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PlaylistItem),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GETTER_SOURCES_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GetterSource),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GETTER_DOMAIN_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GetterDomain),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GETTER_SEARCH_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GetterSearch),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GETTER_SUBURL_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GetterSubUrl),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: GETTER_EXPLORE_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GetterExplore),
        inject: ['DATA_SOURCE'],
    }
];