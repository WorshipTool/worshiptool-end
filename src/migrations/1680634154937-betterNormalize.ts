import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import normalizeSearchText from "src/utils/normalizeSearchText";
import { MigrationInterface, QueryRunner } from "typeorm"

export class betterNormalize1680634154937 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const variants = await queryRunner.manager.find(SongVariant);

        // update the new column for all products
        await Promise.all(variants.map(async (variant) => {
            const normalizedSearchText = normalizeSearchText(variant.searchValue);
            await queryRunner.query(`
                UPDATE song_variant
                SET searchValue = "${normalizedSearchText}"
                WHERE guid = "${variant.guid}"
            `);
        }));

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
    }

}
