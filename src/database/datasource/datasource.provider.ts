import { DataSource } from "typeorm";
import { Song } from "../entities/song.entity";
import { SongName } from "../entities/songname.entity";
import { SongVariant } from "../entities/songvariant.entity";
import { Creator } from "../entities/creator.entity";
import { CSVLink } from "../entities/csvlink.entity";
import { User } from "../entities/user.entity";

export const datasourceProvider = [
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
                entities: [
                    Song,
                    SongName,
                    SongVariant,
                    Creator,
                    CSVLink,
                    User
                ],
            });

            return dataSource.initialize();
        }
  }
]