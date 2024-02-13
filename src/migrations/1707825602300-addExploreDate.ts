import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExploreDate1707825602300 implements MigrationInterface {
    name = 'AddExploreDate1707825602300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`lastExplored\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`lastExplored\``);
    }

}
