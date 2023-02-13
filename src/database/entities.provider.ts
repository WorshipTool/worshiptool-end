import { DataSource } from "typeorm";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY, MEDIA_REPOSITORY, SONG_NAMES_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SOURCE_REPOSITORY, TAG_REPOSITORY, USER_REPOSITORY } from "./constants";
import { SongVariant } from "./entities/songvariant.entity";
import { Song } from "./entities/song.entity";
import { Creator } from "./entities/creator.entity";
import { CSVLink } from "./entities/csvlink.entity";
import { SongName } from "./entities/songname.entity";
import { User } from "./entities/user.entity";
import { Media } from "./entities/media.entity";
import { Source } from "./entities/source.entity";
import { Tag } from "./entities/tag.entity";

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
        provide: SONG_NAMES_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SongName),
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
];