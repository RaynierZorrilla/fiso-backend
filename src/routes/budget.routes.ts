import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", budgetController.getAll);
router.post("/", budgetController.create);
router.get("/summary", budgetController.summary);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.remove);

export default router;
