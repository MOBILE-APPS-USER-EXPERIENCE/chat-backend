// src/commands/joinchat.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { MAIN_CHAT_ID } from "../lib/chats";
import { Errors } from "../lib/errors";
import { requireNumeric } from "../lib/validate";
import { CommandHandler } from "../types";

export const joinchat: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "joinchat");
    const chatid = requireNumeric(params, "chatid", "joinchat", "Id of the chat to join");

    if (chatid === MAIN_CHAT_ID) {
        // Der Main-Chat ist virtuell und immer "joined" — nichts zu tun.
        return { status: "ok", message: "Joined", code: 200 };
    }

    const chat = await db("chats").where({ chatid }).first();
    if (!chat) {
        throw Errors.invalidChatId(chatid);
    }

    const isOwnerOrMember =
        chat.owner_userid === auth.userid ||
        !!(await db("chat_members").where({ chatid, userid: auth.userid }).first());

    if (isOwnerOrMember) {
        // Erneuter Join durch Owner/Member ist laut Doku wirkungslos, kein Fehler.
        return { status: "ok", message: "Joined", code: 200 };
    }

    const invite = await db("chat_invites").where({ chatid, userid: auth.userid }).first();

    if (!chat.ispublic && !invite) {
        throw Errors.invalidChatId(chatid);
    }

    await db.transaction(async (trx) => {
        await trx("chat_members").insert({ chatid, userid: auth.userid });
        if (invite) {
            await trx("chat_invites").where({ chatid, userid: auth.userid }).delete();
        }
    });

    return { status: "ok", message: "Joined", code: 200 };
};
