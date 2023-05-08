import { MigrationInterface, QueryRunner } from "typeorm";

export class addPlaylistAndGroup1683552359343 implements MigrationInterface {
    name = 'addPlaylistAndGroup1683552359343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`playlist\` (\`guid\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`ownerGuid\` varchar(36) NULL, PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group\` (\`guid\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`selectionGuid\` varchar(36) NULL, \`adminGuid\` varchar(36) NULL, UNIQUE INDEX \`REL_0c1b692d6a59acddcf959275e6\` (\`selectionGuid\`), PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_9d4d915fd646735f999c191279d\` FOREIGN KEY (\`ownerGuid\`) REFERENCES \`user\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`group\` ADD CONSTRAINT \`FK_0c1b692d6a59acddcf959275e68\` FOREIGN KEY (\`selectionGuid\`) REFERENCES \`playlist\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`group\` ADD CONSTRAINT \`FK_d0cc9a8d664e42e169ae65c1f8c\` FOREIGN KEY (\`adminGuid\`) REFERENCES \`user\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`group\` DROP FOREIGN KEY \`FK_d0cc9a8d664e42e169ae65c1f8c\``);
        await queryRunner.query(`ALTER TABLE \`group\` DROP FOREIGN KEY \`FK_0c1b692d6a59acddcf959275e68\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_9d4d915fd646735f999c191279d\``);
        await queryRunner.query(`DROP INDEX \`REL_0c1b692d6a59acddcf959275e6\` ON \`group\``);
        await queryRunner.query(`DROP TABLE \`group\``);
        await queryRunner.query(`DROP TABLE \`playlist\``);
    }

}
