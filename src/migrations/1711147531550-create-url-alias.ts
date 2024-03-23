import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUrlAlias1711147531550 implements MigrationInterface {
    name = 'CreateUrlAlias1711147531550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`url_alias\` (\`guid\` varchar(36) NOT NULL, \`alias\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`type\` int NOT NULL, PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`url_alias\``);
    }

}
