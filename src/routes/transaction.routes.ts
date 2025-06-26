import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { transactionController } from "../controllers/transaction.controller";

const router = Router();
router.use(authMiddleware);

// POST /api/transactions
router.post("/", transactionController.create);

// GET /api/transactions
router.get("/", transactionController.getAll);

// GET /api/transactions/:id
router.get("/:id", transactionController.getById);

// PUT /api/transactions/:id
router.put("/:id", transactionController.update);

// DELETE /api/transactions/:id
router.delete("/:id", transactionController.remove);

export default router;
