import { Request, Response } from "express";
import { profileService } from "../services/profile.service";

export const profileController = {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const profile = await profileService.getProfile(userId);
            res.json(profile);
        } catch (error) {
            res.status(404).json({ error: "Perfil no encontrado" });
        }
    },

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const updated = await profileService.updateProfile(userId, req.body);
            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: "No se pudo actualizar el perfil" });
        }
    }
};
