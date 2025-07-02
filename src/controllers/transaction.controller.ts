import { Request, Response } from "express";
import { transactionService } from "../services/transaction.service";

export const transactionController = {
    // POST /api/transactions
    async create(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.sub;

        try {
            const transaction = await transactionService.createTransaction(userId, req.body);
            res.status(201).json(transaction);
        } catch (err) {
            console.error("❌ Error en createTransaction:", err);
            res.status(500).json({ error: "Error al crear la transacción" });
        }
    },
    // GET /api/transactions
    async getAll(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.sub;

        try {
            const transactions = await transactionService.getAllTransactions(userId);
            res.json(transactions);
        } catch (err) {
            console.error("❌ Error al obtener transacciones:", err);
            res.status(500).json({ error: "Error al obtener transacciones" });
        }
    },
    // GET /api/transactions/:id
    async getById(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.sub;
        const transactionId = req.params.id;

        try {
            const transaction = await transactionService.getTransactionById(userId, transactionId);
            res.json(transaction);
        } catch (err) {
            res.status(404).json({ error: "Transacción no encontrada o acceso denegado" });
        }
    },

    // PUT /api/transactions/:id
    async update(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.sub;
        const transactionId = req.params.id;
        const data = req.body;

        try {
            const updated = await transactionService.updateTransaction(userId, transactionId, data);
            res.json(updated);
        } catch (err) {
            res.status(404).json({ error: "No se pudo actualizar la transacción" });
        }
    },

    // DELETE /api/transactions/:id
    async remove(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.sub;
        const transactionId = req.params.id;

        try {
            await transactionService.deleteTransaction(userId, transactionId);
            res.status(204).send();
        } catch (err) {
            res.status(404).json({ error: "No se pudo eliminar la transacción" });
        }
    },

};
