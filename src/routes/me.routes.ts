import { Router, Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {
    res.json({
        message: "Token verificado correctamente",
        user: req.user,
    });
});

export default router;
