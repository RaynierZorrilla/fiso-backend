import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportTable1753842224503 implements MigrationInterface {
    name = 'AddReportTable1753842224503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "tipo" character varying NOT NULL, "periodo" character varying, "datos" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_e347c56b008c2057c9887e230aa"`);
        await queryRunner.query(`DROP TABLE "report"`);
    }

}
