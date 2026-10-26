// src/lib/admin.ts
import { verifyPassword } from "./crypto";
import { Errors } from "./errors";

/**
 * Das Format von ADMIN_KEY_HASH ist `<salt>:<hash>`, erzeugt mit derselben
 * scrypt-basierten hashPassword()-Funktion wie Nutzerpasswörter (crypto.ts) —
 * es gibt keinen semantischen Unterschied zwischen "ein Passwort hashen" und
 * "ein Admin-Secret hashen", daher bewusst dieselbe Primitive statt eines
 * zweiten Hashing-Schemas.
 *
 * Hash für die .env erzeugen:
 *   npm run hash-secret -- "dein-admin-schluessel"
 */
export function isValidAdminKey(key: unknown): boolean {
    if (typeof key !== "string" || key.length === 0) return false;
    const storedHash = process.env.ADMIN_KEY_HASH;
    if (!storedHash) return false; // kein Admin-Key konfiguriert -> Admin-Funktionen aus
    return verifyPassword(key, storedHash);
}

/** Für resetuser/deleteuser/clear, wo der Admin-Key Pflicht ist. */
export function requireAdminKey(key: unknown): void {
    if (!isValidAdminKey(key)) {
        throw Errors.noAdmin();
    }
}
