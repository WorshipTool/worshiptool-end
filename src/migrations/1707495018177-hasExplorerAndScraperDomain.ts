import { MigrationInterface, QueryRunner } from "typeorm";

export class HasExplorerAndScraperDomain1707495018177 implements MigrationInterface {
    name = 'HasExplorerAndScraperDomain1707495018177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`hasScraper\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`hasExplorer\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`getter_explore\` ADD CONSTRAINT \`FK_7a7f7fd4cd68e3ac7a8fa51234b\` FOREIGN KEY (\`domainGuid\`) REFERENCES \`getter_domain\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_explore\` DROP FOREIGN KEY \`FK_7a7f7fd4cd68e3ac7a8fa51234b\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`hasExplorer\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`hasScraper\``);
    }

}
