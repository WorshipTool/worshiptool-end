import { DataSource } from 'typeorm';
import { CSLink } from './entities/cslink.entity';
import { Creator } from './entities/creator.entity';
import { Song } from './entities/song.entity';
import { SongVariant } from './entities/songvariant.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'lookaround',
        password: '31663lookaround',
        database: 'worshiptool',
        synchronize: true,
        entities: [Creator,Song, SongVariant, CSLink],
      });

      return dataSource.initialize();
    },
  },
];