import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProcessedToSource1708892787884 implements MigrationInterface {
    name = 'AddProcessedToSource1708892787884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` CHANGE \`added\` \`processed\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`getter_source\` DROP COLUMN \`processed\``);
        await queryRunner.query(`ALTER TABLE \`getter_source\` ADD \`processed\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` DROP COLUMN \`processed\``);
        await queryRunner.query(`ALTER TABLE \`getter_source\` ADD \`processed\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`getter_source\` CHANGE \`processed\` \`added\` tinyint NOT NULL DEFAULT '0'`);
    }

}
