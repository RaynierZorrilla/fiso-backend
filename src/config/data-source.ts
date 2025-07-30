import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import dotenv from 'dotenv';
import { Transaction } from '../entities/Transaction';
import { Budget } from "../entities/Budget";
import { Goal } from "../entities/Goal";
import { Report } from "../entities/Report";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [User, Transaction, Budget, Goal, Report],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
});
