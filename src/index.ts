import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import transactionRoutes from './routes/transaction.routes';
import meRoutes from './routes/me.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/me', meRoutes);

app.get('/', (_req, res) => {
    res.send('🚀 FISO API is running');
});

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log('📦 Database connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => console.error('❌ Error connecting to database:', error));
