import { MigrationInterface, QueryRunner } from "typeorm";
import { PlaylistItem } from "../database/entities/playlistitem.entity";

export class AliasItemPlaylistAdd1711213033642 implements MigrationInterface {
    name = "AliasItemPlaylistAdd1711213033642";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all items in the playlist_item table
        const items: any[] = await queryRunner.manager.find("playlist_item");
        // Truncate the table
        await queryRunner.query(`TRUNCATE TABLE playlist_item`);
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_da01ac86fe7b868a2c768b66323\``
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` CHANGE \`variantGuid\` \`aliasGuid\` varchar(36) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_4c0051186fe4b5348d146821bac\` FOREIGN KEY (\`aliasGuid\`) REFERENCES \`url_alias\`(\`guid\`) ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        // Re-insert all items
        for (const item of items) {
            // Get aliasGuid from variantGuid
            const alias: any = await queryRunner.manager.findOne("url_alias", {
                where: {
                    value: item.variantGuid
                }
            });
            const data = {
                ...item,
                aliasGuid: alias.guid
            };
            await queryRunner.manager.save(PlaylistItem, data);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` DROP FOREIGN KEY \`FK_4c0051186fe4b5348d146821bac\``
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` CHANGE \`aliasGuid\` \`variantGuid\` varchar(36) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist_item\` ADD CONSTRAINT \`FK_da01ac86fe7b868a2c768b66323\` FOREIGN KEY (\`variantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }
}
