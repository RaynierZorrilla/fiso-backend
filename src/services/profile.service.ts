import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { createClient } from "@supabase/supabase-js";

const userRepo = AppDataSource.getRepository(User);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const profileService = {
    async getProfile(userId: string) {
        return await userRepo.findOneByOrFail({ id: userId });
    },

    async updateProfile(userId: string, data: Partial<User>) {
        const user = await userRepo.findOneByOrFail({ id: userId });

        Object.assign(user, data);
        const updated = await userRepo.save(user);

        // 🔄 Sincronizar nombre con Supabase
        if (data.name) {
            await supabase.auth.admin.updateUserById(userId, {
                user_metadata: { name: data.name },
            });
        }

        return updated;
    }
};
