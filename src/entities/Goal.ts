import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity()
export class Goal {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar")
    category!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    limit!: number;

    @Column({ type: "date" })
    date!: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column()
    userId!: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "userId" })
    user!: User;
} 