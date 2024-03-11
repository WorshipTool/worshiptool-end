import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourcesRelationTODomain1707853219092 implements MigrationInterface {
    name = 'AddSourcesRelationTODomain1707853219092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` ADD \`domainGuid\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_source\` ADD CONSTRAINT \`FK_b49803e4b6d85fb0250fdcf4c35\` FOREIGN KEY (\`domainGuid\`) REFERENCES \`getter_domain\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_source\` DROP FOREIGN KEY \`FK_b49803e4b6d85fb0250fdcf4c35\``);
        await queryRunner.query(`ALTER TABLE \`getter_source\` DROP COLUMN \`domainGuid\``);
    }

}
