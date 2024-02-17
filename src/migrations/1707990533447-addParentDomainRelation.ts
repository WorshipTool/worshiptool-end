import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentDomainRelation1707990533447 implements MigrationInterface {
    name = 'AddParentDomainRelation1707990533447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD \`parentGuid\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` ADD CONSTRAINT \`FK_187431b0c2382f9cda7c00b3b49\` FOREIGN KEY (\`parentGuid\`) REFERENCES \`getter_domain\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP FOREIGN KEY \`FK_187431b0c2382f9cda7c00b3b49\``);
        await queryRunner.query(`ALTER TABLE \`getter_domain\` DROP COLUMN \`parentGuid\``);
    }

}
