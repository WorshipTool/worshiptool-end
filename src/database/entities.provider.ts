import { DataSource } from 'typeorm';
import { CSLINK_REPOSITORY, CREATOR_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from './constants';
import { CSLink } from './entities/cslink.entity';
import { Creator } from './entities/creator.entity';
import { Song } from './entities/song.entity';
import { SongVariant } from './entities/songvariant.entity';

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
        useFactory: (dataSource: DataSource) => dataSource.getRepository(CSLink),
        inject: ['DATA_SOURCE'],
    },
];