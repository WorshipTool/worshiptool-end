import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDomainLevel1707991658440 implements MigrationInterface {
    name = 'AddDomainLevel1707991658440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`level\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`level\``);
    }

}
