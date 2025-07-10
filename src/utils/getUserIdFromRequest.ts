import { Request } from "express";

interface JwtUser {
    sub: string;
    email?: string;
}

export function getUserIdFromRequest(req: Request): string {
    const user = req.user as JwtUser | undefined;

    if (!user || typeof user.sub !== "string") {
        throw new Error("Usuario no autenticado o token inválido");
    }

    return user.sub;
}
