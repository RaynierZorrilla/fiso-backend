import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        app.use('/api/users', userRoutes);
        console.log('📦 Database connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => console.error('❌ Error connecting to database:', error));
