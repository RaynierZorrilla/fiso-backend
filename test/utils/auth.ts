import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getTestToken(): Promise<{ token: string, email: string, password: string }> {
    const testEmail = "raycontenido2003@gmail.com";
    const testPassword = "Aadmin1234.";

    // Solo intenta hacer sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (!signInError && signInData.session?.access_token) {
        return { token: signInData.session.access_token, email: testEmail, password: testPassword };
    }

    throw new Error(
        `No se pudo obtener un token de prueba. Error: signIn: ${signInError?.message}`
    );
}

export async function cleanupTestUser(email: string): Promise<void> {
    try {
        // Limpiar el usuario de prueba si es necesario
        // Esto dependerá de tu configuración de Supabase
        console.log(`Test user cleanup for: ${email}`);
    } catch (error) {
        console.error("Error cleaning up test user:", error);
    }
} 