import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";

const SUPABASE_JWKS_URL = "https://lbgvqqcynjmcipcjsene.supabase.co/auth/v1/keys";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
    }

    const token = authHeader.split(" ")[1];
    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    const kid = decodedHeader?.header?.kid;

    if (!kid) {
        res.status(401).json({ error: "Token inválido" });
        return;
    }

    globalThis.fetch(SUPABASE_JWKS_URL)
        .then((res) => res.json() as Promise<{ keys: any[] }>)
        .then(({ keys }) => {
            const jwk = keys.find((key) => key.kid === kid);
            if (!jwk) throw new Error("Clave no encontrada");

            const publicKey = jwkToPem(jwk);
            const verified = jwt.verify(token, publicKey);
            req.user = verified;

            next();
        })
        .catch((err) => {
            console.error("❌ Error en authMiddleware:", err);
            res.status(401).json({ error: "Token inválido o expirado" });
        });
};
