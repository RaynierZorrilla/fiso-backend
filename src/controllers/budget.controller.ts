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
            res.status(400).json({ error: "Error al obtener presupuestos" });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            const updated = await budgetService.update(userId, id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(400).json({ error: "Error al actualizar presupuesto" });
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            await budgetService.delete(userId, id);
            res.json({ message: "Presupuesto eliminado" });
        } catch (err) {
            res.status(400).json({ error: "Error al eliminar presupuesto" });
        }
    },
};