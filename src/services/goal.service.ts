import { AppDataSource } from "../config/data-source";
import { Goal } from "../entities/Goal";
import { User } from "../entities/User";

const goalRepo = AppDataSource.getRepository(Goal);
const userRepo = AppDataSource.getRepository(User);

export const goalService = {
    async create(userId: string, data: Partial<Goal>) {
        const user = await userRepo.findOneByOrFail({ id: userId });

        const goal = goalRepo.create({
            ...data,
            montoActual: data.montoActual || 0,
            user,
        });

        return await goalRepo.save(goal);
    },

    async getAll(userId: string) {
        return await goalRepo.find({
            where: { userId },
            order: { fechaObjetivo: "ASC" },
        });
    },

    async getSummary(userId: string) {
        const goals = await goalRepo.find({
            where: { userId },
        });

        let totalObjetivo = 0;
        let totalAhorrado = 0;
        let metasActivas = 0;

        for (const goal of goals) {
            totalObjetivo += Number(goal.montoObjetivo);
            totalAhorrado += Number(goal.montoActual);
            
            // Una meta está activa si no ha alcanzado su objetivo
            if (Number(goal.montoActual) < Number(goal.montoObjetivo)) {
                metasActivas++;
            }
        }

        return {
            metasActivas,
            totalAhorrado,
            metaObjetivo: totalObjetivo
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