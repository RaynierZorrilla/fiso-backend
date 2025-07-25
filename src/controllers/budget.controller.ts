import { Request, Response } from "express";
import { budgetService } from "../services/budget.service";
import { getUserIdFromRequest } from "../utils/getUserIdFromRequest";

export const budgetController = {
    async create(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const budget = await budgetService.create(userId, req.body);
            res.status(201).json(budget);
        } catch (err) {
            res.status(400).json({ error: "Error al crear presupuesto" });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const budgets = await budgetService.getAll(userId);
            res.json(budgets);
        } catch (err) {
            console.error("❌ Error en GET /api/budgets:", err);
            res.status(400).json({ error: "Error al obtener presupuestos" });
        }
    },

    async summary(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const data = await budgetService.getSummary(userId);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Error al obtener el resumen de presupuesto" });
        }
    },


    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            const updated = await budgetService.update(userId, id, req.body);
            res.json(updated);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Presupuesto no encontrado") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al actualizar presupuesto" });
            }
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            await budgetService.delete(userId, id);
            res.json({ message: "Presupuesto eliminado" });
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Presupuesto no encontrado") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al eliminar presupuesto" });
            }
        }
    },
};