import { AppDataSource } from "../config/data-source";
import { Goal } from "../entities/Goal";
import { User } from "../entities/User";
import { Transaction } from "../entities/Transaction";

const goalRepo = AppDataSource.getRepository(Goal);
const userRepo = AppDataSource.getRepository(User);
const transactionRepo = AppDataSource.getRepository(Transaction);

export const goalService = {
    async create(userId: string, data: Partial<Goal>) {
        const user = await userRepo.findOneByOrFail({ id: userId });

        const goal = goalRepo.create({
            ...data,
            user,
        });

        return await goalRepo.save(goal);
    },

    async getAll(userId: string) {
        return await goalRepo.find({
            where: { userId },
            order: { date: "DESC" },
        });
    },

    async getSummary(userId: string) {
        const goals = await goalRepo.find({
            where: { userId },
        });

        const transactions = await transactionRepo.find({
            where: { user: { id: userId } },
        });

        let totalGoalLimit = 0;
        let totalSpent = 0;

        for (const goal of goals) {
            totalGoalLimit += Number(goal.limit);

            const spent = transactions
                .filter(
                    (t) =>
                        t.type === "expense" &&
                        t.category === goal.category &&
                        t.date.toISOString().split('T')[0] === goal.date.toISOString().split('T')[0]
                )
                .reduce((sum, t) => sum + Number(t.amount), 0);

            totalSpent += spent;
        }

        return {
            totalGoalLimit,
            totalSpent,
            remaining: totalGoalLimit - totalSpent,
        };
    },

    async update(userId: string, goalId: string, data: Partial<Goal>) {
        const goal = await goalRepo.findOne({
            where: { id: goalId, userId },
        });

        if (!goal) throw new Error("Meta no encontrada");

        Object.assign(goal, data);
        return await goalRepo.save(goal);
    },

    async delete(userId: string, goalId: string) {
        const goal = await goalRepo.findOne({
            where: { id: goalId, userId },
        });

        if (!goal) throw new Error("Meta no encontrada");

        return await goalRepo.remove(goal);
    },
}; 