import { AppDataSource } from "../config/data-source";
import { Budget } from "../entities/Budget";
import { User } from "../entities/User";
import { Transaction } from "../entities/Transaction";
import { monthRange, currentMonthYYYYMM } from "../utils/monthRange";

const budgetRepo = AppDataSource.getRepository(Budget);
const userRepo = AppDataSource.getRepository(User);
const transactionRepo = AppDataSource.getRepository(Transaction);

export const budgetService = {
    async create(userId: string, data: Partial<Budget>) {
        const user = await userRepo.findOneByOrFail({ id: userId });
        const budget = budgetRepo.create({ ...data, user });
        const saved = await budgetRepo.save(budget);

        if (!data.category) throw new Error("Categoría requerida");
        if (!data.month || !/^\d{4}-\d{2}$/.test(data.month)) throw new Error("Mes inválido (YYYY-MM)");
        if (data.limit == null || Number(data.limit) < 0) throw new Error("Límite inválido");

        const { from, to } = monthRange(saved.month);
        const raw = await transactionRepo
            .createQueryBuilder("t")
            .select("COALESCE(SUM(t.amount), 0)", "spent")
            .where("t.userId = :userId", { userId })
            .andWhere("t.type = :type", { type: "expense" })
            .andWhere("t.category = :category", { category: saved.category })
            .andWhere("t.date >= :from AND t.date < :to", { from, to })
            .getRawOne<{ spent: string }>();

        return { ...saved, limit: Number(saved.limit), spent: Number(raw?.spent ?? 0) };
    },

    async getAllWithSpent(userId: string, month?: string) {
        const m = month || currentMonthYYYYMM();
        const { from, to } = monthRange(m);

        // 1) Presupuestos del mes
        const budgets = await budgetRepo.find({
            where: { userId, month: m },
            order: { month: "DESC" },
        });

        if (budgets.length === 0) return [];

        // 2) Gastos agrupados por categoría para ese mes
        const raw = await transactionRepo
            .createQueryBuilder("t")
            .select("t.category", "category")
            .addSelect("COALESCE(SUM(t.amount), 0)", "spent")
            .where("t.userId = :userId", { userId })
            .andWhere("t.type = :type", { type: "expense" })
            .andWhere("t.date >= :from AND t.date < :to", { from, to })
            .groupBy("t.category")
            .getRawMany<{ category: string; spent: string }>();

        const spentByCategory = new Map<string, number>(
            raw.map(r => [r.category, Number(r.spent) || 0])
        );

        // 3) Combinar
        return budgets.map(b => ({
            ...b,
            limit: Number(b.limit), // decimal -> número
            spent: spentByCategory.get(b.category) ?? 0,
        }));
    },

    async getAll(userId: string) {
        return await budgetRepo.find({
            where: { userId },
            order: { month: "DESC" },
        });
    },

    async getSummary(userId: string, month?: string) {
        const m = month || currentMonthYYYYMM();
        const { from, to } = monthRange(m);

        const budgets = await budgetRepo.find({ where: { userId, month: m } });

        // SUM(limit) de los budgets del mes
        const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.limit), 0);

        // SUM(expense) de categorías presupuestadas (solo lo que tiene budget)
        if (budgets.length === 0) {
            return { totalBudgeted: 0, totalSpent: 0, available: 0 };
        }

        const categories = budgets.map(b => b.category);

        const raw = await transactionRepo
            .createQueryBuilder("t")
            .select("COALESCE(SUM(t.amount), 0)", "sum")
            .where("t.userId = :userId", { userId })
            .andWhere("t.type = :type", { type: "expense" })
            .andWhere("t.category IN (:...categories)", { categories })
            .andWhere("t.date >= :from AND t.date < :to", { from, to })
            .getRawOne<{ sum: string }>();

        const totalSpent = Number(raw?.sum ?? 0);

        return {
            totalBudgeted,
            totalSpent,
            available: totalBudgeted - totalSpent,
        };
    },

    async update(userId: string, budgetId: string, data: Partial<Budget>) {
        const budget = await budgetRepo.findOne({ where: { id: budgetId, userId } });
        if (!budget) throw new Error("Presupuesto no encontrado");

        Object.assign(budget, data);
        const saved = await budgetRepo.save(budget);

        if (!data.category) throw new Error("Categoría requerida");
        if (!data.month || !/^\d{4}-\d{2}$/.test(data.month)) throw new Error("Mes inválido (YYYY-MM)");
        if (data.limit == null || Number(data.limit) < 0) throw new Error("Límite inválido");

        const { from, to } = monthRange(saved.month);
        const raw = await transactionRepo
            .createQueryBuilder("t")
            .select("COALESCE(SUM(t.amount), 0)", "spent")
            .where("t.userId = :userId", { userId })
            .andWhere("t.type = :type", { type: "expense" })
            .andWhere("t.category = :category", { category: saved.category })
            .andWhere("t.date >= :from AND t.date < :to", { from, to })
            .getRawOne<{ spent: string }>();

        return { ...saved, limit: Number(saved.limit), spent: Number(raw?.spent ?? 0) };
    },

    async delete(userId: string, budgetId: string) {
        const budget = await budgetRepo.findOne({
            where: { id: budgetId, userId },
        });

        if (!budget) throw new Error("Presupuesto no encontrado");

        return await budgetRepo.remove(budget);
    },
};
