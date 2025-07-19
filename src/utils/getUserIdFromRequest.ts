import { Request } from "express";

interface UserInfo {
    id: string;
    email: string;
}

export function getUserIdFromRequest(req: Request): string {
    const user = req.user as UserInfo | undefined;

    if (!user || typeof user.id !== "string") {
        throw new Error("Usuario no autenticado o token inválido");
    }

    return user.id;
}
