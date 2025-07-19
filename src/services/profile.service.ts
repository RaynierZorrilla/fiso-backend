import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { createClient } from "@supabase/supabase-js";
import { EntityNotFoundError } from "typeorm";

const userRepo = AppDataSource.getRepository(User);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const profileService = {
    async getProfile(userId: string) {
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new EntityNotFoundError(User, `Usuario con ID ${userId} no encontrado`);
        }
        return user;
    },

    async updateProfile(userId: string, data: Partial<User>) {
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new EntityNotFoundError(User, `Usuario con ID ${userId} no encontrado`);
        }

        Object.assign(user, data);
        const updated = await userRepo.save(user);

        // 🔄 Sincronizar nombre con Supabase
        if (data.name) {
            try {
                await supabase.auth.admin.updateUserById(userId, {
                    user_metadata: { name: data.name },
                });
            } catch (error) {
                console.error("Error sincronizando con Supabase:", error);
                // No fallamos la operación si Supabase falla
            }
        }

        return updated;
    }
};
