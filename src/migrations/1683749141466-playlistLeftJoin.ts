import { MigrationInterface, QueryRunner } from "typeorm";

export class playlistLeftJoin1683749141466 implements MigrationInterface {
    name = 'playlistLeftJoin1683749141466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`song_variant_playlists_playlist\` (\`songVariantGuid\` varchar(36) NOT NULL, \`playlistGuid\` varchar(36) NOT NULL, INDEX \`IDX_1263fdebd5a8219d0e65b9f138\` (\`songVariantGuid\`), INDEX \`IDX_db6c6c9bb3f30aca1619a79b44\` (\`playlistGuid\`), PRIMARY KEY (\`songVariantGuid\`, \`playlistGuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`song_variant_playlists_playlist\` ADD CONSTRAINT \`FK_1263fdebd5a8219d0e65b9f138d\` FOREIGN KEY (\`songVariantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`song_variant_playlists_playlist\` ADD CONSTRAINT \`FK_db6c6c9bb3f30aca1619a79b44b\` FOREIGN KEY (\`playlistGuid\`) REFERENCES \`playlist\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant_playlists_playlist\` DROP FOREIGN KEY \`FK_db6c6c9bb3f30aca1619a79b44b\``);
        await queryRunner.query(`ALTER TABLE \`song_variant_playlists_playlist\` DROP FOREIGN KEY \`FK_1263fdebd5a8219d0e65b9f138d\``);
        await queryRunner.query(`DROP INDEX \`IDX_db6c6c9bb3f30aca1619a79b44\` ON \`song_variant_playlists_playlist\``);
        await queryRunner.query(`DROP INDEX \`IDX_1263fdebd5a8219d0e65b9f138\` ON \`song_variant_playlists_playlist\``);
        await queryRunner.query(`DROP TABLE \`song_variant_playlists_playlist\``);
    }

}
