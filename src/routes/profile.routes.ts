import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", profileController.get);
router.put("/", profileController.update);
router.put("/password", profileController.changePassword);

export default router; 