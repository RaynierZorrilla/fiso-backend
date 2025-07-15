import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", budgetController.getAll);
router.post("/", budgetController.create);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.remove);
router.get("/summary", budgetController.summary);

export default router;
