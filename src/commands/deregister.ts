// src/commands/deregister.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { CommandHandler } from "../types";

export const deregister: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "deregister");

    // Nur den User-Datensatz entfernen. Tokens werden über FK CASCADE
    // mitgelöscht (alle Sessions werden sofort ungültig). Nachrichten und
    // Chat-Mitgliedschaften bleiben bestehen, da messages.userid und
    // chat_members.userid bewusst ohne FK-Constraint auf users sind
    // (siehe korrigierte Migrationen oben).
    await db("users").where({ userid: auth.userid }).delete();

    return { status: "ok", message: "Deregistered", code: 200 };
};
