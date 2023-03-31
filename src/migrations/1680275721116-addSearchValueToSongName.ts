import { MigrationInterface, QueryRunner } from "typeorm";
import { SongName } from '../database/entities/songname.entity';
import normalizeSearchText from "src/utils/normalizeSearchText";

export class addSearchValueToSongName1680275721116 implements MigrationInterface {
    name = 'addSearchValueToSongName1680275721116'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // await queryRunner.query(`
        //     ALTER TABLE "product"
        //     ADD "normalizedSearchText" character varying NOT NULL DEFAULT ''
        // `);

        await queryRunner.query(`ALTER TABLE \`song_name\` ADD \`searchValue\` varchar(255) NOT NULL`);

        // get all products
        const songName = await queryRunner.manager.find(SongName);

        // update the new column for all products
        await Promise.all(songName.map(async (en) => {
            const normalizedSearchText = normalizeSearchText(en.name);
            await queryRunner.query(`
                UPDATE song_name
                SET searchValue = "${normalizedSearchText}"
                WHERE guid = "${en.guid}"
            `);
        }));
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_name\` DROP COLUMN \`searchValue\``);
    }

}
