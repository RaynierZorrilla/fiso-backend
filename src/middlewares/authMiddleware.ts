import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const userRepo = AppDataSource.getRepository(User);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;

        // 🧠 Sincronizar usuario en DB local si no existe
        const userId = decoded.sub;
        const email = decoded.email;
        const name = email?.split("@")[0] || "Usuario Supabase";

        let user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            user = userRepo.create({ id: userId, email, name });
            await userRepo.save(user);
            console.log(`✅ Usuario sincronizado: ${email}`);
        }

        next();
    } catch (error) {
        console.error("❌ Error en authMiddleware:", error);
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};
