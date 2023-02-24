import { DataSource } from "typeorm";
import { Song } from "../entities/song.entity";
import { SongName } from "../entities/songname.entity";
import { SongVariant } from "../entities/songvariant.entity";
import { Creator } from "../entities/creator.entity";
import { CSVLink } from "../entities/csvlink.entity";
import { User } from "../entities/user.entity";
import { Media } from "../entities/media.entity";
import { Source } from "../entities/source.entity";
import { Tag } from "../entities/tag.entity";

export const datasourceProvider = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
        const dataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
                username: process.env.DATABASE_USERNAME || 'lookaround',
                password: process.env.DATABASE_PASSWORD || '31663lookaround',
                database: process.env.DATABASE_DATABASE || 'worshiptool',
                synchronize: true,
                entities: [
                    Song,
                    SongName,
                    SongVariant,
                    Creator,
                    CSVLink,
                    User,
                    Media,
                    Source,
                    Tag
                ],
            });

            return dataSource.initialize();
        }
  }
]