import { MigrationInterface, QueryRunner } from "typeorm";

export class deletedinvariant1702568712000 implements MigrationInterface {
    name = 'deletedinvariant1702568712000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`deleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`deleted\``);
    }

}
