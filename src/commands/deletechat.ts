// src/commands/deletechat.ts
import { db } from "../db";
import { isValidAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { requireNumeric } from "../lib/validate";
import { CommandHandler } from "../types";

export const deletechat: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "deletechat");
    const chatid = requireNumeric(params, "chatid", "deletechat", "Id of the chat to delete");
    const isAdmin = isValidAdminKey(params.key);

    const chat = await db("chats").where({ chatid }).first();
    if (!chat || (chat.owner_userid !== auth.userid && !isAdmin)) {
        throw Errors.notChatOwner();
    }

    // chat_members und chat_invites hängen per FK CASCADE an chats und werden
    // automatisch mitgelöscht. messages.chatid hat bewusst KEINE FK (siehe
    // Migration 20260101000008) und muss daher explizit geleert werden.
    // TODO: verwaiste Fotos/Dateien dieser Nachrichten werden hier (noch)
    // nicht aufgeräumt — für API-Kompatibilität nicht relevant, aber ein
    // Kandidat für einen späteren Cleanup-Job.
    await db("messages").where({ chatid }).delete();
    await db("chats").where({ chatid }).delete();

    return { status: "ok", message: "Chat deleted", chatid, code: 200 };
};
