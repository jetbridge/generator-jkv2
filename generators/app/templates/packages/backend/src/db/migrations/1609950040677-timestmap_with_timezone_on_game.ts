import {MigrationInterface, QueryRunner} from "typeorm";

export class timestmapWithTimezoneOnGame1609950040677 implements MigrationInterface {
    name = 'timestmapWithTimezoneOnGame1609950040677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" ADD "release_date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "release_date"`);
    }

}
