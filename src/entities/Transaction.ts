import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn
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

    @Column()
    userId!: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "userId" })
    user!: User;
}
