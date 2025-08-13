import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToTransaction1754971503069 implements MigrationInterface {
    name = 'AddUserIdToTransaction1754971503069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // La columna userId ya existe, solo agregamos el foreign key constraint
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_transaction_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign key constraint
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_user"`);
    }
}
