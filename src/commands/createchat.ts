// src/commands/createchat.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { extractReturningValue } from "../lib/db-helpers";
import { Errors } from "../lib/errors";
import { parseBoolean, requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const createchat: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "createchat");
    const chatname = requireParam(params, "chatname", "createchat", "Name of the chat");

    if (chatname.trim().length < 2) {
        throw Errors.chatnameTooShort();
    }

    const ispublic = parseBoolean(params.ispublic);
    const directchat = parseBoolean(params.directchat);

    const inserted = await db("chats")
        .insert({ chatname, ispublic, directchat, owner_userid: auth.userid })
        .returning("chatid");

    const chatid = extractReturningValue<number>(inserted, "chatid");

    await db("chat_members").insert({ chatid, userid: auth.userid });

    return { status: "ok", message: "Chat created", chatid, code: 200 };
};
