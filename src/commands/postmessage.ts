// src/commands/postmessage.ts
import fs from "fs/promises";
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { MAIN_CHAT_ID, requireChatAccess } from "../lib/chats";
import { generateUniqueId } from "../lib/crypto";
import { detectFileType } from "../lib/filetype";
import { decodeBase64Payload, filePath, photoPath } from "../lib/storage";
import { optionalNumeric, parseBoolean, sanitizeText } from "../lib/validate";
import { CommandHandler } from "../types";

export const postmessage: CommandHandler = async (params) => {
    const auth = await requireAuth(params, "postmessage");

    const chatid = optionalNumeric(params, "chatid", MAIN_CHAT_ID);
    await requireChatAccess(chatid, auth.userid);

    // "Non-string values are treated as empty" (api-docs.yaml)
    const text =
        typeof params.text === "string" && params.text.trim() !== ""
            ? sanitizeText(params.text)
            : null;

    const position =
        typeof params.position === "string" && params.position.trim() !== "" ? params.position : null;

    const important = parseBoolean(params.important);

    let photoid: string | null = null;
    if (typeof params.photo === "string" && params.photo.trim() !== "") {
        const buffer = decodeBase64Payload(params.photo);
        photoid = await generateUniqueId(
            async (candidate) => !!(await db("photos").where({ photoid: candidate }).first())
        );
        await db("photos").insert({ photoid });
        await fs.writeFile(photoPath(photoid), buffer);
    }

    let fileid: string | null = null;
    if (typeof params.file === "string" && params.file.trim() !== "") {
        const buffer = decodeBase64Payload(params.file);
        const { mimetype } = detectFileType(buffer);
        fileid = await generateUniqueId(
            async (candidate) => !!(await db("files").where({ fileid: candidate }).first())
        );
        await db("files").insert({ fileid, mimetype });
        await fs.writeFile(filePath(fileid), buffer);
    }

    await db("messages").insert({
        chatid,
        userid: auth.userid,
        usernick: auth.nickname,
        userhash: auth.hash,
        userfullname: auth.fullname,
        text,
        photoid,
        fileid,
        position,
        important,
    });

    return { status: "ok", message: "Message saved", code: 200 };
};
