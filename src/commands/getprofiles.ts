// src/commands/getprofiles.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { CommandHandler } from "../types";

export const getprofiles: CommandHandler = async (params) => {
    await requireAuth(params, "getprofiles");

    // Der optionale Admin-`key`-Parameter wird nur der Schema-Konformität
    // wegen akzeptiert (siehe api-docs.yaml) — anders als bei getmessages/
    // getchats hat das Profile-Schema kein admin-exklusives Feld, userid ist
    // bereits im normalen Response enthalten.

    const rows = await db("users")
        .whereNotNull("hash")
        .whereNotNull("nickname")
        .select("userid", "nickname", "fullname", "hash");

    const profiles = rows.map((row) => ({
        userid: row.userid,
        fullname: row.fullname,
        nickname: row.nickname,
        hash: row.hash,
    }));

    return { status: "ok", message: `${profiles.length} Profiles`, code: 200, profiles };
};
