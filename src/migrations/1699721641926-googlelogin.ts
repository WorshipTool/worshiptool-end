import { MigrationInterface, QueryRunner } from "typeorm";

export class googlelogin1699721641926 implements MigrationInterface {
    name = 'googlelogin1699721641926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`loginType\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`googleId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`googleId\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`loginType\``);
    }

}
