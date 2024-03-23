import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChildreParentToSongVariant1711010034605 implements MigrationInterface {
    name = 'AddChildreParentToSongVariant1711010034605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`childrenGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD CONSTRAINT \`FK_ba85fb7dac50b58a092a887bf37\` FOREIGN KEY (\`childrenGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP FOREIGN KEY \`FK_ba85fb7dac50b58a092a887bf37\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`childrenGuid\``);
    }

}
