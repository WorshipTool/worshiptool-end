import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDomainDescription1708771676927 implements MigrationInterface {
    name = 'AddDomainDescription1708771676927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`description\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`description\``);
    }

}
