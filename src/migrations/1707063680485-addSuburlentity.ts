import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuburlentity1707063680485 implements MigrationInterface {
    name = 'AddSuburlentity1707063680485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`getter_sub_url\` (\`url\` varchar(255) NOT NULL, \`explored\` tinyint NOT NULL DEFAULT 0, \`probability\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`url\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`getter_sub_url\``);
    }

}
