import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;

const userRepo = AppDataSource.getRepository(User);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const { data: userInfo, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !userInfo?.user) {
            res.status(401).json({ error: "Token inválido o expirado" });
            return;
        }

        const userId = userInfo.user.id;
        const email = userInfo.user.email;
        const name = userInfo.user.user_metadata?.name || email?.split("@")[0];

        // Añadir al request para uso posterior
        req.user = { id: userId, email: email || "" };

        // Sincronizar con base de datos local si no existe
        let user = await userRepo.findOneBy({ id: userId });

        if (!user) {
            user = userRepo.create({ id: userId, email, name });
            await userRepo.save(user);
            console.log(`✅ Usuario sincronizado: ${email}`);
        }

        next();
    } catch (err) {
        console.error("❌ Error en authMiddleware:", err);
        res.status(500).json({ error: "Error interno en autenticación" });
    }
};
