import { DataSource } from 'typeorm';
import { CSLINK_REPOSITORY, CREATOR_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY, SONG_NAMES_REPOSITORY } from './constants';
import { CSVLink } from './entities/csvlink.entity';
import { Creator } from './entities/creator.entity';
import { Song } from './entities/song.entity';
import { SongVariant } from './entities/songvariant.entity';
import { SongName } from './entities/songname.entity';

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
        provide: CSLINK_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(CSVLink),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: SONG_NAMES_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SongName),
        inject: ['DATA_SOURCE'],
    },
];