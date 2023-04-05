import { SongName } from "src/database/entities/songname.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { convertSheetToSections } from "@pepavlin/sheet-api";
import normalizeSearchText from "src/utils/normalizeSearchText";
import { MigrationInterface, QueryRunner } from "typeorm"

export class normalizeFix1680634934257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const variants = await queryRunner.manager.find(SongVariant);

        // update the new column for all products
        await Promise.all(variants.map(async (variant) => {
            let sheetText = "";
                if(variant.sheetData){
                    const sections = convertSheetToSections(variant.sheetData);
                    for(let i=0; i<sections.length; i++){
                        const t=sections[i].text;
                        if( t){
                            sheetText+=t;
                        }
                    }
                }

            const normalizedSearchText = normalizeSearchText(sheetText);
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
