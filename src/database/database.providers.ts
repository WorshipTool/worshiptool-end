import { DataSource } from 'typeorm';
import { SongTitle } from './songtitles/songtitle.entity';

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
        entities: [SongTitle],
      });

      return dataSource.initialize();
    },
  },
];