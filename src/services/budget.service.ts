import { AppDataSource } from "../config/data-source";
import { Budget } from "../entities/Budget";
import { User } from "../entities/User";
import { Transaction } from "../entities/Transaction";

const budgetRepo = AppDataSource.getRepository(Budget);
const userRepo = AppDataSource.getRepository(User);
const transactionRepo = AppDataSource.getRepository(Transaction);

export const budgetService = {
    async create(userId: string, data: Partial<Budget>) {
        const user = await userRepo.findOneByOrFail({ id: userId });

        const budget = budgetRepo.create({
            ...data,
            user,
        });

        return await budgetRepo.save(budget);
    },

    async getAll(userId: string) {
        return await budgetRepo.find({
            where: { userId },
            order: { month: "DESC" },
        });
    },

    async getSummary(userId: string) {
        const budgets = await budgetRepo.find({
            where: { userId },
        });

        const transactions = await transactionRepo.find({
            where: { user: { id: userId } },
        });

        let totalBudgeted = 0;
        let totalSpent = 0;

        for (const budget of budgets) {
            totalBudgeted += Number(budget.limit);

            const spent = transactions
                .filter(
                    (t) =>
                        t.type === "expense" &&
                        t.category === budget.category &&
                        t.date.toISOString().startsWith(budget.month)
                )
                .reduce((sum, t) => sum + Number(t.amount), 0);

            totalSpent += spent;
        }

        return {
            totalBudgeted,
            totalSpent,
            available: totalBudgeted - totalSpent,
        };
    },

    async update(userId: string, budgetId: string, data: Partial<Budget>) {
        const budget = await budgetRepo.findOne({
            where: { id: budgetId, userId },
        });

        if (!budget) throw new Error("Presupuesto no encontrado");

        Object.assign(budget, data);
        return await budgetRepo.save(budget);
    },

    async delete(userId: string, budgetId: string) {
        const budget = await budgetRepo.findOne({
            where: { id: budgetId, userId },
        });

        if (!budget) throw new Error("Presupuesto no encontrado");

        return await budgetRepo.remove(budget);
    },
};
