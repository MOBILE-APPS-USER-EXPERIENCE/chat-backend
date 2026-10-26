// src/commands/getmessages.ts
import { db } from "../db";
import { isValidAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { formatApiTimestamp } from "../lib/time";
import { optionalNumeric } from "../lib/validate";
import { CommandHandler } from "../types";

export const getmessages: CommandHandler = async (params) => {
    await requireAuth(params, "getmessages");

    const fromid = optionalNumeric(params, "fromid", 0);
    const chatid = optionalNumeric(params, "chatid", 0);
    const isAdmin = isValidAdminKey(params.key);

    const rows = await db("messages")
        .where({ chatid })
        .andWhere("id", ">", fromid)
        .orderBy("id", "asc")
        .select("*");

    const messages = rows.map((row) => {
        const dto: Record<string, any> = {
            id: row.id,
            userid: row.userid,
            time: formatApiTimestamp(row.time),
            chatid: row.chatid,
            important: !!row.important,
            photoid: row.photoid ?? null,
            fileid: row.fileid ?? null,
            usernick: row.usernick,
            userhash: row.userhash,
            userfullname: row.userfullname,
        };

        // text/position sind laut Beispiel komplett abwesend, wenn nicht
        // gesetzt (im Unterschied zu photoid/fileid, die explizit null sind).
        if (row.text !== null && row.text !== undefined) dto.text = row.text;
        if (row.position !== null && row.position !== undefined) dto.position = row.position;

        // Dupliziert userid, ist aber laut Schema exakt so spezifiziert:
        // "username" existiert nur mit gültigem Admin-Key.
        if (isAdmin) dto.username = row.userid;

        return dto;
    });

    return {
        status: "ok",
        message: `${messages.length} Messages retrieved since ${fromid}`,
        code: 200,
        messages,
    };
};
