// src/commands/getinvites.ts
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { getChatParticipant } from "../lib/chats";
import { CommandHandler } from "../types";

export const getinvites: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "getinvites");

    const inviteRows = await db("chat_invites")
        .join("chats", "chats.chatid", "chat_invites.chatid")
        .where("chat_invites.userid", auth.userid)
        .select("chats.chatid", "chats.chatname", "chats.directchat", "chats.owner_userid");

    const invites = await Promise.all(
        inviteRows.map(async (row) => ({
            chatid: row.chatid,
            chatname: row.chatname,
            directchat: !!row.directchat,
            owner: row.owner_userid ? await getChatParticipant(row.owner_userid) : [],
        }))
    );

    return { status: "ok", message: "Invites", code: 200, invites };
};
