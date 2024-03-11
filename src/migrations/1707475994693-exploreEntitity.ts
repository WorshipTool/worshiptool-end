import { MigrationInterface, QueryRunner } from "typeorm";

export class ExploreEntitity1707475994693 implements MigrationInterface {
    name = 'ExploreEntitity1707475994693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`getter_explore\` (\`guid\` varchar(36) NOT NULL, \`date\` date NOT NULL, \`count\` int NOT NULL, \`domainGuid\` int NULL, PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`getter_explore\` ADD CONSTRAINT \`FK_7a7f7fd4cd68e3ac7a8fa51234b\` FOREIGN KEY (\`domainGuid\`) REFERENCES \`getter_domain\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`getter_explore\` DROP FOREIGN KEY \`FK_7a7f7fd4cd68e3ac7a8fa51234b\``);
        await queryRunner.query(`DROP TABLE \`getter_explore\``);
    }

}
