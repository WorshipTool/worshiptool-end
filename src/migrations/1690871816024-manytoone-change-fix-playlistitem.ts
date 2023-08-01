import { MigrationInterface, QueryRunner } from "typeorm";

export class manytooneChangeFixPlaylistitem1690871816024 implements MigrationInterface {
    name = 'manytooneChangeFixPlaylistitem1690871816024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_da01ac86fe7b868a2c768b66323\``);
        await queryRunner.query(`DROP INDEX \`REL_da01ac86fe7b868a2c768b6632\` ON \`playlist_item\``);
        await queryRunner.query(`ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_da01ac86fe7b868a2c768b66323\` FOREIGN KEY (\`variantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_da01ac86fe7b868a2c768b66323\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_da01ac86fe7b868a2c768b6632\` ON \`playlist_item\` (\`variantGuid\`)`);
        await queryRunner.query(`ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_da01ac86fe7b868a2c768b66323\` FOREIGN KEY (\`variantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
