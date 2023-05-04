import { MigrationInterface, QueryRunner } from "typeorm";
import { SongVariant } from '../database/entities/songvariant.entity';
import normalizeSearchText from "src/utils/normalizeSearchText";

export class sheetTextChangeName1680277935101 implements MigrationInterface {
    name = 'sheetTextChangeName1680277935101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        ///await queryRunner.query(`ALTER TABLE \`song_variant\` CHANGE \`sheetText\` \`searchValue\` varchar(5000) NULL`);

        //const variants = await queryRunner.manager.find(SongVariant);

        // update the new column for all products
        // await Promise.all(variants.map(async (variant) => {
        //     const normalizedSearchText = normalizeSearchText(variant.searchValue);
        //     await queryRunner.query(`
        //         UPDATE song_variant
        //         SET searchValue = "${normalizedSearchText}"
        //         WHERE guid = "${variant.guid}"
        //     `);
        // }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //await queryRunner.query(`ALTER TABLE \`song_variant\` CHANGE \`searchValue\` \`sheetText\` varchar(5000) NULL`);
    }

}
