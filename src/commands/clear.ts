// src/commands/clear.ts
import fs from "fs/promises";
import { db } from "../db";
import { requireAdminKey } from "../lib/admin";
import { ensureStorageDirs, FILES_DIR, PHOTOS_DIR } from "../lib/storage";
import { CommandHandler } from "../types";

export const clear: CommandHandler = async (params) => {
    // Kein requireAuth(): laut Spec braucht `clear` security: [] — nur der
    // Admin-Key ist Pflicht, kein eigenes Token.
    requireAdminKey(params.key);

    // Reihenfolge respektiert die Foreign Keys explizit, auch wenn die
    // meisten davon ohnehin CASCADE sind — bleibt dadurch unabhängig vom
    // aktiven DB-Dialekt (heute SQLite, später eventuell Postgres) korrekt.
    await db.transaction(async (trx) => {
        await trx("chat_invites").delete();
        await trx("chat_members").delete();
        await trx("messages").delete();
        await trx("chats").delete();
        await trx("photos").delete();
        await trx("files").delete();
        await trx("tokens").delete();
        await trx("users").delete();
    });

    // Binärdaten im Volume ebenfalls vollständig entfernen.
    await fs.rm(PHOTOS_DIR, { recursive: true, force: true });
    await fs.rm(FILES_DIR, { recursive: true, force: true });
    ensureStorageDirs();

    return { status: "ok", message: "All chat data cleared", code: 200 };
};
