import { AppDataSource } from "../config/data-source";
import { Budget } from "../entities/Budget";
import { User } from "../entities/User";

const budgetRepo = AppDataSource.getRepository(Budget);
const userRepo = AppDataSource.getRepository(User);

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
            where: { user: { id: userId } },
            order: { month: "DESC" },
        });
    },

    async update(userId: string, budgetId: string, data: Partial<Budget>) {
        const budget = await budgetRepo.findOne({
            where: { id: budgetId, user: { id: userId } },
        });

        if (!budget) throw new Error("Presupuesto no encontrado");

        Object.assign(budget, data);
        return await budgetRepo.save(budget);
    },

    async delete(userId: string, budgetId: string) {
        const budget = await budgetRepo.findOne({
            where: { id: budgetId, user: { id: userId } },
        });

        if (!budget) throw new Error("Presupuesto no encontrado");

        return await budgetRepo.remove(budget);
    },
};
