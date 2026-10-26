// src/commands/invite.ts
import { db } from "../db";
import { isValidAdminKey } from "../lib/admin";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { requireNumeric, requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const invite: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "invite");
    const chatid = requireNumeric(params, "chatid", "invite", "Id of the chat");
    const invitedhash = requireParam(params, "invitedhash", "invite", "Public hash of the user to invite");
    const isAdmin = isValidAdminKey(params.key);

    const chat = await db("chats").where({ chatid }).first();
    if (!chat || (chat.owner_userid !== auth.userid && !isAdmin)) {
        throw Errors.invalidChatId(chatid);
    }

    const invitedUser = await db("users").where({ hash: invitedhash }).first();
    if (!invitedUser) {
        throw Errors.invalidUserHash();
    }

    // Direktchats erlauben über ihre gesamte Lebenszeit nur eine einzige
    // Einladung — unabhängig davon, ob sie inzwischen angenommen, abgelehnt
    // oder der Chat wieder verlassen wurde. Daher ein eigenes Flag statt nur
    // die aktuelle chat_invites-Zeile zu prüfen (die wird beim Beitritt
    // gelöscht).
    if (chat.directchat && chat.direct_invite_sent) {
        throw Errors.invalidChatId(chatid);
    }

    const alreadyMember = await db("chat_members")
        .where({ chatid, userid: invitedUser.userid })
        .first();
    if (alreadyMember) {
        return { status: "ok", message: "Invited", code: 200 };
    }

    const alreadyInvited = await db("chat_invites")
        .where({ chatid, userid: invitedUser.userid })
        .first();
    if (!alreadyInvited) {
        await db("chat_invites").insert({ chatid, userid: invitedUser.userid });
    }

    if (chat.directchat && !chat.direct_invite_sent) {
        await db("chats").where({ chatid }).update({ direct_invite_sent: true });
    }

    return { status: "ok", message: "Invited", code: 200 };
};
