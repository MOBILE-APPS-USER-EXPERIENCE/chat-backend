// src/commands/getchats.ts
import { db } from "../db";
import { isValidAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { ChatRow, serializeChat, serializeMainChat } from "../lib/chats";
import { CommandHandler } from "../types";

export const getchats: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "getchats");
    const isAdmin = isValidAdminKey(params.key);

    let chatRows: ChatRow[];

    if (isAdmin) {
        chatRows = await db("chats").select("*");
    } else {
        const memberChatIds = await db("chat_members").where({ userid: auth.userid }).pluck("chatid");
        const invitedChatIds = await db("chat_invites").where({ userid: auth.userid }).pluck("chatid");

        chatRows = await db("chats")
            .where({ owner_userid: auth.userid })
            .orWhere({ ispublic: true })
            .orWhereIn("chatid", memberChatIds.length ? memberChatIds : [-1])
            .orWhereIn("chatid", invitedChatIds.length ? invitedChatIds : [-1])
            .select("*");
    }

    const serialized = await Promise.all(
        chatRows.map((chat) => serializeChat(chat, auth.userid, isAdmin))
    );

    return {
        status: "ok",
        message: "Chats",
        code: 200,
        chats: [serializeMainChat(), ...serialized],
    };
};
