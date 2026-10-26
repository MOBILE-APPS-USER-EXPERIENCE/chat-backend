// src/lib/chats.ts
import { db } from "../db";
import { Errors } from "./errors";

export const MAIN_CHAT_ID = 0;

export interface ChatParticipantDTO {
    hash: string;
    nickname: string;
    fullname: string;
    userid: string;
}

export interface ChatRow {
    chatid: number;
    chatname: string;
    ispublic: boolean | number;
    directchat: boolean | number;
    owner_userid: string | null;
    direct_invite_sent: boolean | number;
}

/**
 * Löst eine userid zum kleinen Profil auf, das in Chat-/Invite-Antworten
 * verwendet wird. Gibt null zurück, wenn der Account nicht mehr existiert
 * (z. B. nach deregister) — Aufrufer filtern das heraus, denn die API-Doku
 * beschreibt diesen Fallback nur explizit für `owner`, dasselbe Problem kann
 * aber genauso bei normalen Mitgliedern/Eingeladenen auftreten.
 */
export async function getChatParticipant(userid: string): Promise<ChatParticipantDTO | null> {
    const user = await db("users").where({ userid }).first();
    if (!user) return null;
    return { hash: user.hash, nickname: user.nickname, fullname: user.fullname, userid: user.userid };
}

async function resolveParticipants(userids: string[]): Promise<ChatParticipantDTO[]> {
    const participants = await Promise.all(userids.map(getChatParticipant));
    return participants.filter((p): p is ChatParticipantDTO => p !== null);
}

/**
 * Baut das vollständige Chat-DTO aus api-docs.yaml für eine Chat-Zeile,
 * aus der Perspektive von `viewerUserid` (mit oder ohne Admin-Rechte).
 */
export async function serializeChat(
    chat: ChatRow,
    viewerUserid: string,
    isAdmin: boolean
): Promise<Record<string, any>> {
    const memberRows = await db("chat_members").where({ chatid: chat.chatid }).select("userid");
    const memberIds = memberRows.map((r) => r.userid);

    const inviteRows = await db("chat_invites").where({ chatid: chat.chatid }).select("userid");
    const invitedIds = inviteRows.map((r) => r.userid);

    const owner = chat.owner_userid ? await getChatParticipant(chat.owner_userid) : null;
    const participants = await resolveParticipants(memberIds);
    const invited = await resolveParticipants(invitedIds);

    const isOwner = chat.owner_userid === viewerUserid;
    const isMember = memberIds.includes(viewerUserid);
    const isInvited = invitedIds.includes(viewerUserid);

    let role: string;
    if (isOwner) role = "owner";
    else if (isMember) role = "member";
    else if (isInvited) role = "invited";
    else if (isAdmin) role = "admin";
    else role = "none";

    return {
        chatid: chat.chatid,
        chatname: chat.chatname,
        visibility: chat.ispublic ? "public" : "private",
        role,
        joined: isOwner || isMember,
        directchat: !!chat.directchat,
        owner: owner ?? [],
        participants,
        invited,
    };
}

/**
 * Der Main-Chat (id 0) ist virtuell — er hat keine Zeile in `chats` — und
 * wird daher exakt wie dokumentiert hart codiert: immer public, immer
 * "joined", owner/participants immer leer, und kein `invited`-Key überhaupt.
 */
export function serializeMainChat(): Record<string, any> {
    return {
        chatid: MAIN_CHAT_ID,
        chatname: "Main Chat",
        visibility: "public",
        role: "member",
        joined: true,
        directchat: false,
        owner: [],
        participants: [],
        // bewusst kein `invited`-Key
    };
}

/**
 * Prüft, ob `userid` in `chatid` posten darf: Main-Chat ist immer offen,
 * sonst muss der Aufrufer Owner oder Mitglied sein. Wirft 458, sonst nichts
 * — der Rückgabewert (die Chat-Zeile oder null für den Main-Chat) wird von
 * postmessage aktuell nicht weiter benötigt, könnte aber später nützlich
 * sein (z. B. um directchat-Status zu prüfen).
 */
export async function requireChatAccess(chatid: number, userid: string): Promise<ChatRow | null> {
    if (chatid === MAIN_CHAT_ID) return null;

    const chat = await db("chats").where({ chatid }).first();
    if (!chat) throw Errors.invalidChatId(chatid);

    const isOwner = chat.owner_userid === userid;
    const isMember = isOwner || !!(await db("chat_members").where({ chatid, userid }).first());

    if (!isOwner && !isMember) throw Errors.invalidChatId(chatid);

    return chat;
}
