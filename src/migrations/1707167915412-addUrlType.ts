import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUrlType1707167915412 implements MigrationInterface {
    name = 'AddUrlType1707167915412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`type\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`type\``);
    }

}
