import { MigrationInterface, QueryRunner } from "typeorm";

export class googlelogin1699721703041 implements MigrationInterface {
    name = 'googlelogin1699721703041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`loginType\` \`loginType\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`loginType\` \`loginType\` int NOT NULL`);
    }

}
