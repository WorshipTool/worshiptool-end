import { MigrationInterface, QueryRunner } from "typeorm";

export class nullableEmail1699723131975 implements MigrationInterface {
    name = 'nullableEmail1699723131975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
    }

}
