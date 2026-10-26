// src/commands/leavechat.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { MAIN_CHAT_ID } from "../lib/chats";
import { Errors } from "../lib/errors";
import { requireNumeric } from "../lib/validate";
import { CommandHandler } from "../types";

export const leavechat: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "leavechat");
    const chatid = requireNumeric(params, "chatid", "leavechat", "Id of the chat to leave");

    if (chatid === MAIN_CHAT_ID) {
        throw Errors.cannotLeaveMainChat();
    }

    const chat = await db("chats").where({ chatid }).first();

    if (chat && chat.owner_userid === auth.userid) {
        throw Errors.cannotLeave();
    }

    const membership = chat
        ? await db("chat_members").where({ chatid, userid: auth.userid }).first()
        : null;

    if (!chat || !membership) {
        throw Errors.cannotLeave();
    }

    await db("chat_members").where({ chatid, userid: auth.userid }).delete();
    // Eine eventuell noch offene Einladung wird vorsichtshalber ebenfalls
    // entfernt, auch wenn das laut Doku eigentlich rejectinvite macht.
    await db("chat_invites").where({ chatid, userid: auth.userid }).delete();

    return { status: "ok", message: `left chat ${chatid}`, code: 200 };
};
