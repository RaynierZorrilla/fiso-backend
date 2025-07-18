import { profileController } from "../controllers/profile.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Rutas protegidas con authMiddleware
router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);

export default router;
