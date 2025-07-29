import { Router } from "express";
import { goalController } from "../controllers/goal.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", goalController.getAll);
router.post("/", goalController.create);
router.put("/:id", goalController.update);
router.delete("/:id", goalController.remove);
router.get("/summary", goalController.summary);

export default router; 