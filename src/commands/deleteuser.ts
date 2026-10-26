// src/commands/deleteuser.ts
import { db } from "../db";
import { requireAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const deleteuser: CommandHandler = async (params) => {
    await requireAuth(params, "deleteuser");
    requireAdminKey(params.key);

    const userhash = requireParam(params, "userhash", "deleteuser", "Public hash of the user to delete");

    const user = await db("users").where({ hash: userhash }).first();
    if (!user) {
        throw Errors.invalidUserHash();
    }

    await db.transaction(async (trx) => {
        // Im Unterschied zu deregister: entfernt zusätzlich alle
        // Chat-Mitgliedschaften/Einladungen und alle vom User geschriebenen
        // Nachrichten (messages.userid hat bewusst keine FK, siehe Migration
        // 20260101000008 — muss daher explizit bereinigt werden).
        await trx("chat_members").where({ userid: user.userid }).delete();
        await trx("chat_invites").where({ userid: user.userid }).delete();
        await trx("messages").where({ userid: user.userid }).delete();
        // tokens werden über FK ON DELETE CASCADE automatisch mitgelöscht.
        await trx("users").where({ userid: user.userid }).delete();
    });

    // "User reset" statt "User deleted": entspricht exakt dem Beispiel in
    // api-docs.yaml für /deleteuser (wirkt wie ein Copy-Paste-Versehen im
    // Original, wird hier aber für 1:1-Kompatibilität bewusst übernommen).
    return { status: "ok", message: "User reset", code: 200 };
};
