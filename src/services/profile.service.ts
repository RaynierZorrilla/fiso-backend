import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { createClient } from "@supabase/supabase-js";

const userRepo = AppDataSource.getRepository(User);
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export const profileService = {
    async get(userId: string) {
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        
        // Retornar solo los datos del perfil (sin password)
        const { password, ...profile } = user;
        return profile;
    },

    async update(userId: string, data: Partial<User>) {
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Solo permitir actualizar name y email
        if (data.name) {
            user.name = data.name;
        }
        if (data.email) {
            // Verificar que el email no esté en uso por otro usuario
            const existingUser = await userRepo.findOneBy({ email: data.email });
            if (existingUser && existingUser.id !== userId) {
                throw new Error("El email ya está en uso");
            }
            user.email = data.email;
        }

        await userRepo.save(user);
        
        // Retornar solo los datos del perfil (sin password)
        const { password, ...profile } = user;
        return profile;
    },

    async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Usar Supabase para cambiar la contraseña
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: data.newPassword }
        );

        if (error) {
            console.error("❌ Error changing password in Supabase:", error);
            throw new Error("Error al cambiar contraseña en Supabase");
        }
    },
}; 