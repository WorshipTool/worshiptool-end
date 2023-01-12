import { DataSource } from 'typeorm';
import { CSVLink } from './entities/csvlink.entity';
import { Creator } from './entities/creator.entity';
import { Song } from './entities/song.entity';
import { SongVariant } from './entities/songvariant.entity';
import { SongName } from './entities/songname.entity';
import { User } from './entities/user.entity';

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
        entities: [Creator,Song, SongName, SongVariant, CSVLink,
                   User],
      });

      return dataSource.initialize();
    },
  },
];