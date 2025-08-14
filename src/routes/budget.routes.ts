import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", budgetController.getAll);
router.get("/summary", budgetController.summary);
router.post("/", budgetController.create);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.remove);

export default router;
