import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubUrlErrorCount1707816627734 implements MigrationInterface {
    name = 'AddSubUrlErrorCount1707816627734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`exploredWithErrorCount\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`exploredWithErrorCount\``);
    }

}
