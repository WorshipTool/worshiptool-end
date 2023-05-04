import { MigrationInterface, QueryRunner } from "typeorm";

export class mainTitle1683192705977 implements MigrationInterface {
    name = 'mainTitle1683192705977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`song\` DROP FOREIGN KEY \`FK_f583fe5fd40f734f11ddb385b5b\``);
        // await queryRunner.query(`DROP INDEX \`IDX_05e38b820f762eafcd6523e86b\` ON \`song_variant\``);
        // await queryRunner.query(`DROP INDEX \`REL_f583fe5fd40f734f11ddb385b5\` ON \`song\``);
        await queryRunner.query(`ALTER TABLE \`song\` CHANGE \`mainNameGuid\` \`mainTitleGuid\` varchar(36) NULL`);
        // await queryRunner.query(`ALTER TABLE \`song_variant\` DROP FOREIGN KEY \`FK_05e38b820f762eafcd6523e86bc\``);
        // await queryRunner.query(`ALTER TABLE \`song\` ADD UNIQUE INDEX \`IDX_7e17e2ebd832570d6e80eb2f73\` (\`mainTitleGuid\`)`);
        // await queryRunner.query(`CREATE UNIQUE INDEX \`REL_7e17e2ebd832570d6e80eb2f73\` ON \`song\` (\`mainTitleGuid\`)`);
        // await queryRunner.query(`ALTER TABLE \`song_variant\` ADD CONSTRAINT \`FK_05e38b820f762eafcd6523e86bc\` FOREIGN KEY (\`prefferedTitleGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE \`song\` ADD CONSTRAINT \`FK_7e17e2ebd832570d6e80eb2f73d\` FOREIGN KEY (\`mainTitleGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`song\` DROP FOREIGN KEY \`FK_7e17e2ebd832570d6e80eb2f73d\``);
        // await queryRunner.query(`ALTER TABLE \`song_variant\` DROP FOREIGN KEY \`FK_05e38b820f762eafcd6523e86bc\``);
        // await queryRunner.query(`DROP INDEX \`REL_7e17e2ebd832570d6e80eb2f73\` ON \`song\``);
        // await queryRunner.query(`ALTER TABLE \`song\` DROP INDEX \`IDX_7e17e2ebd832570d6e80eb2f73\``);
        // await queryRunner.query(`ALTER TABLE \`song_variant\` ADD CONSTRAINT \`FK_05e38b820f762eafcd6523e86bc\` FOREIGN KEY (\`prefferedTitleGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`song\` CHANGE \`mainTitleGuid\` \`mainNameGuid\` varchar(36) NULL`);
        // await queryRunner.query(`CREATE UNIQUE INDEX \`REL_f583fe5fd40f734f11ddb385b5\` ON \`song\` (\`mainNameGuid\`)`);
        // await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_05e38b820f762eafcd6523e86b\` ON \`song_variant\` (\`prefferedTitleGuid\`)`);
        // await queryRunner.query(`ALTER TABLE \`song\` ADD CONSTRAINT \`FK_f583fe5fd40f734f11ddb385b5b\` FOREIGN KEY (\`mainNameGuid\`) REFERENCES \`song_title\`(\`guid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
