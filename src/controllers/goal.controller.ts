import { Request, Response } from "express";
import { goalService } from "../services/goal.service";
import { getUserIdFromRequest } from "../utils/getUserIdFromRequest";

export const goalController = {
    async create(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const goal = await goalService.create(userId, req.body);
            res.status(201).json(goal);
        } catch (err) {
            res.status(400).json({ error: "Error al crear meta" });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const goals = await goalService.getAll(userId);
            res.json(goals);
        } catch (err) {
            console.error("❌ Error en GET /api/goals:", err);
            res.status(400).json({ error: "Error al obtener metas" });
        }
    },

    async summary(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const data = await goalService.getSummary(userId);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Error al obtener el resumen de metas" });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            const updated = await goalService.update(userId, id, req.body);
            res.json(updated);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Meta no encontrada") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al actualizar meta" });
            }
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            await goalService.delete(userId, id);
            res.json({ message: "Meta eliminada" });
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Meta no encontrada") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al eliminar meta" });
            }
        }
    },
}; 