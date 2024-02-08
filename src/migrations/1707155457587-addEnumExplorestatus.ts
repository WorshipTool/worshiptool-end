import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnumExplorestatus1707155457587 implements MigrationInterface {
    name = 'AddEnumExplorestatus1707155457587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`explored\``);
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`explored\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`explored\``);
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`explored\` tinyint NOT NULL DEFAULT '0'`);
    }

}
