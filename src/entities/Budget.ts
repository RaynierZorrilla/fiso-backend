import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Budget {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar")
    category!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    limit!: number;

    @Column({ type: "varchar" }) // e.g. "2025-01"
    month!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => User, { nullable: false })
    user!: User;
}