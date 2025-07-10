import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddBudgetTable1752123330504 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "budget",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "category",
                    type: "varchar",
                },
                {
                    name: "limit",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                },
                {
                    name: "month",
                    type: "varchar",
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "userId",
                    type: "uuid",
                },
            ],
            foreignKeys: [
                {
                    columnNames: ["userId"],
                    referencedTableName: "user",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("budget");
    }
}