import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDomainProbality1708780322996 implements MigrationInterface {
    name = 'AddDomainProbality1708780322996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`probality\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`probality\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`title\``);
    }

}
