import { MigrationInterface, QueryRunner } from "typeorm";

export class init1609757045524 implements MigrationInterface {
    name = 'init1609757045524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "genre" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying, CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "game_reception_enum" AS ENUM('positive', 'mixed', 'negative')`);
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying, "reception" "game_reception_enum", "developer_studio_id" uuid, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "developer_studio" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying, CONSTRAINT "PK_becfb927b545ee9970c5b4597f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_genre" ("genre_id" uuid NOT NULL, "game_id" uuid NOT NULL, CONSTRAINT "PK_cb7a037273a320371d5d46e0087" PRIMARY KEY ("genre_id", "game_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2614c7455fe03de781aa59ed6" ON "game_genre" ("genre_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5390c8f9507cfca301cbd33013" ON "game_genre" ("game_id") `);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_45f63f61c9f012d6c2ac6461f02" FOREIGN KEY ("developer_studio_id") REFERENCES "developer_studio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_genre" ADD CONSTRAINT "FK_e2614c7455fe03de781aa59ed68" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_genre" ADD CONSTRAINT "FK_5390c8f9507cfca301cbd330138" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_genre" DROP CONSTRAINT "FK_5390c8f9507cfca301cbd330138"`);
        await queryRunner.query(`ALTER TABLE "game_genre" DROP CONSTRAINT "FK_e2614c7455fe03de781aa59ed68"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_45f63f61c9f012d6c2ac6461f02"`);
        await queryRunner.query(`DROP INDEX "IDX_5390c8f9507cfca301cbd33013"`);
        await queryRunner.query(`DROP INDEX "IDX_e2614c7455fe03de781aa59ed6"`);
        await queryRunner.query(`DROP TABLE "game_genre"`);
        await queryRunner.query(`DROP TABLE "developer_studio"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TYPE "game_reception_enum"`);
        await queryRunner.query(`DROP TABLE "genre"`);
    }

}
