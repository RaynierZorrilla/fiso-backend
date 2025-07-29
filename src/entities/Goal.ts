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
    titulo!: string;

    @Column("text")
    descripcion!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    montoObjetivo!: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    montoActual!: number;

    @Column({ type: "date" })
    fechaObjetivo!: Date;

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