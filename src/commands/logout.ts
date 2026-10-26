// src/commands/logout.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { CommandHandler } from "../types";

export const logout: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "logout");

    await db("tokens").where({ token: auth.token }).delete();

    return { status: "ok", message: "Logged out", code: 200 };
};
