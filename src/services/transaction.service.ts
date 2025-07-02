import { AppDataSource } from "../config/data-source";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";

const transactionRepo = AppDataSource.getRepository(Transaction);
const userRepo = AppDataSource.getRepository(User);

export const transactionService = {
    // Crea una nueva transacción
    async createTransaction(userId: string, data: any) {
        const { type, amount, category, description, date } = data;

        const user = await userRepo.findOneByOrFail({ id: userId });

        const transaction = transactionRepo.create({
            type,
            amount,
            category,
            description,
            date: new Date(date),
            user,
        });

        return await transactionRepo.save(transaction);
    },
    // Obtiene todas las transacciones del usuario
    async getAllTransactions(userId: string) {
        return await transactionRepo.find({
            where: { user: { id: userId } },
            order: { date: "DESC" },
        });
    },
    // Obtiene una transacción por ID
    async getTransactionById(userId: string, transactionId: string) {
        const transaction = await transactionRepo.findOne({
            where: {
                id: transactionId,
                user: { id: userId }
            },
        });

        if (!transaction) {
            throw new Error("Transacción no encontrada o acceso no autorizado");
        }

        return transaction;
    },

    // Actualiza una transacción por ID
    async updateTransaction(userId: string, transactionId: string, data: Partial<Transaction>) {
        const transaction = await transactionRepo.findOne({
            where: {
                id: transactionId,
                user: { id: userId }
            },
        });

        if (!transaction) {
            throw new Error("Transacción no encontrada o acceso denegado");
        }

        Object.assign(transaction, data);

        return await transactionRepo.save(transaction);
    },

    // Elimina una transacción por ID
    async deleteTransaction(userId: string, transactionId: string) {
        const transaction = await transactionRepo.findOne({
            where: {
                id: transactionId,
                user: { id: userId },
            },
        });

        if (!transaction) {
            throw new Error("Transacción no encontrada o acceso denegado");
        }

        await transactionRepo.remove(transaction);
    }
};
