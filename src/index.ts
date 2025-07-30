import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import transactionRoutes from './routes/transaction.routes';
import cors from 'cors';
import budgetRoutes from './routes/budget.routes';
import profileRoutes from './routes/profile.routes';
import goalRoutes from './routes/goal.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();

// Configuración de CORS
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (_req, res) => {
    res.send('🚀 FISO API is running');
});

// Exportar la app para testing
export default app;

// Solo arrancar el servidor si este archivo se ejecuta directamente
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    AppDataSource.initialize()
        .then(() => {
            console.log('📦 Database connected');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        })
        .catch((error) => console.error('❌ Error connecting to database:', error));
}
