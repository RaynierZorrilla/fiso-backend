import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Protegidas con authMiddleware
router.post("/", authMiddleware, transactionController.create);
router.get("/", authMiddleware, transactionController.getAll);
router.get("/:id", authMiddleware, transactionController.getById);
router.put("/:id", authMiddleware, transactionController.update);
router.delete("/:id", authMiddleware, transactionController.remove);

export default router;
