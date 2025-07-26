import { Request, Response } from "express";
import { profileService } from "../services/profile.service";
import { getUserIdFromRequest } from "../utils/getUserIdFromRequest";

export const profileController = {
    async get(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const profile = await profileService.get(userId);
            res.json(profile);
        } catch (err) {
            console.error("❌ Error en GET /api/profile:", err);
            res.status(400).json({ error: "Error al obtener perfil" });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const updated = await profileService.update(userId, req.body);
            res.json(updated);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Usuario no encontrado") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al actualizar perfil" });
            }
        }
    },

    async changePassword(req: Request, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            // Validar que se proporcionen ambos campos
            if (!currentPassword || !newPassword) {
                res.status(400).json({ error: "Se requieren currentPassword y newPassword" });
                return;
            }

            const userId = getUserIdFromRequest(req);
            await profileService.changePassword(userId, req.body);
            res.json({ message: "Contraseña actualizada exitosamente" });
        } catch (err) {
            if (err && typeof err === "object" && "message" in err) {
                const message = (err as any).message;
                if (message === "Usuario no encontrado") {
                    res.status(404).json({ error: message });
                } else if (message === "Error al cambiar contraseña en Supabase") {
                    res.status(500).json({ error: "Error interno al cambiar contraseña" });
                } else {
                    res.status(400).json({ error: "Error al cambiar contraseña" });
                }
            } else {
                res.status(400).json({ error: "Error al cambiar contraseña" });
            }
        }
    },
}; 