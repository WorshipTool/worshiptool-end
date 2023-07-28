import { MigrationInterface, QueryRunner } from "typeorm";

export class isselectionAddToPlaylist1690374976576 implements MigrationInterface {
    name = 'isselectionAddToPlaylist1690374976576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`isSelection\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`isSelection\``);
    }

}
