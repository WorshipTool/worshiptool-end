import { MigrationInterface, QueryRunner } from "typeorm";

export class playlistitemEntityCreate1690867575003 implements MigrationInterface {
    name = 'playlistitemEntityCreate1690867575003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`playlist_item\` (\`guid\` varchar(36) NOT NULL, \`toneKey\` varchar(255) NOT NULL DEFAULT 'C', \`order\` int NOT NULL, \`variantGuid\` varchar(36) NULL, \`playlistGuid\` varchar(36) NULL, UNIQUE INDEX \`REL_da01ac86fe7b868a2c768b6632\` (\`variantGuid\`), PRIMARY KEY (\`guid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_da01ac86fe7b868a2c768b66323\` FOREIGN KEY (\`variantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_1716a621c0037f642dafa384e4b\` FOREIGN KEY (\`playlistGuid\`) REFERENCES \`playlist\`(\`guid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_1716a621c0037f642dafa384e4b\``);
        await queryRunner.query(`ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_da01ac86fe7b868a2c768b66323\``);
        await queryRunner.query(`DROP INDEX \`REL_da01ac86fe7b868a2c768b6632\` ON \`playlist_item\``);
        await queryRunner.query(`DROP TABLE \`playlist_item\``);
    }

}
