import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export type TransactionType = "income" | "expense";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: ["income", "expense"] })
    type!: TransactionType;

    @Column("decimal", {
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    amount!: number;

    @Column()
    category!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: "timestamp" })
    date!: Date;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @ManyToOne(() => User, { nullable: false })
    user!: User;
}
