import { MigrationInterface, QueryRunner } from "typeorm";

export class Domain1706868767686 implements MigrationInterface {
    name = 'Domain1706868767686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`url\` \`domain\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`domain\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`domain\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`status\` \`status\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`domain\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`domain\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`domain\` \`url\` varchar(255) NOT NULL`);
    }

}
