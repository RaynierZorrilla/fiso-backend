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
export class Report {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar")
    nombre!: string;

    @Column("varchar")
    tipo!: string; // 'periodo', 'year', 'mes', 'todos'

    @Column("varchar", { nullable: true })
    periodo?: string; // '2024-11', '2024', etc.

    @Column("jsonb")
    datos!: object; // Almacenar los datos del reporte como JSON

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