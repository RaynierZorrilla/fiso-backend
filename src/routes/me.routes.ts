import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const router = Router();
const userRepo = AppDataSource.getRepository(User);

router.get("/", authMiddleware, async (req, res) => {
    const userId = (req as any).user.sub;

    try {
        const user = await userRepo.findOneByOrFail({ id: userId });
        res.json(user);
    } catch (err) {
        console.error("❌ Error en /api/me:", err);
        res.status(404).json({ error: "Usuario no encontrado" });
    }
});

export default router;
