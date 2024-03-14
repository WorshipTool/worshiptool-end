import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedTypeToSongVariant1710439041859 implements MigrationInterface {
    name = 'AddCreatedTypeToSongVariant1710439041859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`createdType\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`createdType\``);
    }

}
