import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddedParamToGetterSource1708892449598 implements MigrationInterface {
    name = 'AddAddedParamToGetterSource1708892449598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` ADD \`added\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` DROP COLUMN \`added\``);
    }

}
