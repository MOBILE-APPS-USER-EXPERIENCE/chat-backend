// src/lib/crypto.ts
import crypto from "crypto";

const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Erzeugt eine zufällige alphanumerische ID (Default 8 Zeichen, wie Token/Hash im Original). */
export function generateId(length = 8): string {
    const bytes = crypto.randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
        result += ID_CHARS[bytes[i] % ID_CHARS.length];
    }
    return result;
}

/**
 * Generiert eine ID und prüft sie gegen eine Existenz-Funktion (z. B. DB-Lookup),
 * um Kollisionen bei Token/Hash/PhotoId/FileId auszuschließen.
 */
export async function generateUniqueId(
    exists: (candidate: string) => Promise<boolean>,
    length = 8,
    maxAttempts = 5
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const candidate = generateId(length);
        if (!(await exists(candidate))) return candidate;
    }
    throw new Error("Konnte keine eindeutige ID generieren");
}

/** Passwort-Hashing via scrypt (Node-Bordmittel, keine zusätzliche native Abhängigkeit). */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, "hex");
    const candidate = crypto.scryptSync(password, salt, 64);
    if (hashBuffer.length !== candidate.length) return false;
    return crypto.timingSafeEqual(hashBuffer, candidate);
}
