import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDomainEntity1706866971989 implements MigrationInterface {
    name = 'AddDomainEntity1706866971989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`getter_domain\` (\`guid\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, \`status\` int NOT NULL, PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`getter_domain\``);
    }

}
