// src/commands/rejectinvite.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { requireNumeric } from "../lib/validate";
import { CommandHandler } from "../types";

export const rejectinvite: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "rejectinvite");
    const chatid = requireNumeric(params, "chatid", "rejectinvite", "Id of the chat");

    const deletedCount = await db("chat_invites").where({ chatid, userid: auth.userid }).delete();

    if (deletedCount === 0) {
        throw Errors.invalidChatId(chatid);
    }

    return { status: "ok", message: "Invite rejected", code: 200 };
};
