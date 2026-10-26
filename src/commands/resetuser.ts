// src/commands/resetuser.ts
import { db } from "../db";
import { requireAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const resetuser: CommandHandler = async (params) => {
    // Erfordert sowohl ein gültiges eigenes Token (456 bei Ungültigkeit) ALS
    // AUCH einen gültigen Admin-Key (459) — beides ist laut Response-Liste
    // der Spec möglich und wird daher auch beides geprüft.
    await requireAuth(params, "resetuser");
    requireAdminKey(params.key);

    const userhash = requireParam(params, "userhash", "resetuser", "Public hash of the user to reset");

    const user = await db("users").where({ hash: userhash }).first();
    if (!user) {
        throw Errors.invalidUserHash();
    }

    await db.transaction(async (trx) => {
        await trx("users").where({ userid: user.userid }).update({ password_hash: null });
        await trx("tokens").where({ userid: user.userid }).delete();
    });

    return { status: "ok", message: "User reset", code: 200 };
};
