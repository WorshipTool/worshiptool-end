import { MigrationInterface, QueryRunner } from "typeorm";

export class structureFix1683191165373 implements MigrationInterface {
    name = 'structureFix1683191165373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        return;
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP FOREIGN KEY \`FK_6a51c211f78e1a9c16408308de9\``);
        await queryRunner.query(`DROP INDEX \`FK_24ce6357a1d13a95e6906157d98\` ON \`csv_link\``);
        await queryRunner.query(`DROP INDEX \`FK_003e7fdd3840878daab5dbdd8d1\` ON \`song_variant\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP COLUMN \`songGuid\``);
        await queryRunner.query(`ALTER TABLE \`csv_link\` DROP COLUMN \`songGuid\``);
        await queryRunner.query(`ALTER TABLE \`csv_link\` DROP COLUMN \`songOrVariant\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`display\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`mainTitleGuid\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD \`variantGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`toneKey\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`type\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`prefferedTitleGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD UNIQUE INDEX \`IDX_05e38b820f762eafcd6523e86b\` (\`prefferedTitleGuid\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_05e38b820f762eafcd6523e86b\` ON \`song_variant\` (\`prefferedTitleGuid\`)`);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD CONSTRAINT \`FK_42050ab0d4cb38445f67f639c82\` FOREIGN KEY (\`variantGuid\`) REFERENCES \`song_variant\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD CONSTRAINT \`FK_05e38b820f762eafcd6523e86bc\` FOREIGN KEY (\`prefferedTitleGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`song\` ADD CONSTRAINT \`FK_f583fe5fd40f734f11ddb385b5b\` FOREIGN KEY (\`mainNameGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        return;
        await queryRunner.query(`ALTER TABLE \`song\` DROP FOREIGN KEY \`FK_f583fe5fd40f734f11ddb385b5b\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP FOREIGN KEY \`FK_05e38b820f762eafcd6523e86bc\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP FOREIGN KEY \`FK_42050ab0d4cb38445f67f639c82\``);
        await queryRunner.query(`DROP INDEX \`REL_05e38b820f762eafcd6523e86b\` ON \`song_variant\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP INDEX \`IDX_05e38b820f762eafcd6523e86b\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`prefferedTitleGuid\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` DROP COLUMN \`toneKey\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP COLUMN \`variantGuid\``);
        await queryRunner.query(`ALTER TABLE \`song_title\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`mainTitleGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_variant\` ADD \`display\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`csv_link\` ADD \`songOrVariant\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`csv_link\` ADD \`songGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD \`songGuid\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_003e7fdd3840878daab5dbdd8d1\` ON \`song_variant\` (\`mainTitleGuid\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_24ce6357a1d13a95e6906157d98\` ON \`csv_link\` (\`songGuid\`)`);
        await queryRunner.query(`ALTER TABLE \`song_title\` ADD CONSTRAINT \`FK_6a51c211f78e1a9c16408308de9\` FOREIGN KEY (\`songGuid\`) REFERENCES \`song\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
