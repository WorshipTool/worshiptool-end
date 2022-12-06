import { DataSource } from 'typeorm';
import { SongTitle } from './songtitle.entity';

export const SongTitlesProviders = [
  {
    provide: 'SONGS_REPO',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SongTitle),
    inject: ['DATA_SOURCE'],
  },
];