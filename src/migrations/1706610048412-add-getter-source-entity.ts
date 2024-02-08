import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGetterSourceEntity1706610048412 implements MigrationInterface {
    name = 'AddGetterSourceEntity1706610048412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`getter_source\` (\`guid\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`getter_source\``);
    }

}
