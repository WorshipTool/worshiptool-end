import { MigrationInterface, QueryRunner } from "typeorm";

export class Relationbetweenurlanddomain1707071564689 implements MigrationInterface {
    name = 'Relationbetweenurlanddomain1707071564689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD \`domainGuid\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` ADD CONSTRAINT \`FK_de4a95c324507865488f3d76f05\` FOREIGN KEY (\`domainGuid\`) REFERENCES \`getter_domain\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP FOREIGN KEY \`FK_de4a95c324507865488f3d76f05\``);
        await queryRunner.query(`ALTER TABLE \`getter_sub_url\` DROP COLUMN \`domainGuid\``);
    }

}
