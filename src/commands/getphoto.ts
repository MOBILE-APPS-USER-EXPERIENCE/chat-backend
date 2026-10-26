// src/commands/getphoto.ts
import { Response } from "express";
import fs from "fs/promises";
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { photoPath } from "../lib/storage";
import { requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const getphoto: CommandHandler = async (params, res: Response) => {
    await requireAuth(params, "getphoto");
    const photoid = requireParam(params, "photoid", "getphoto", "Id of the photo to download");

    const row = await db("photos").where({ photoid }).first();
    if (!row) {
        throw Errors.invalidPhotoId();
    }

    let buffer: Buffer;
    try {
        buffer = await fs.readFile(photoPath(photoid));
    } catch {
        // DB-Zeile existiert, Datei fehlt auf der Platte (sollte nie passieren)
        // -> trotzdem einen dokumentierten Fehlercode statt 500 liefern.
        throw Errors.invalidPhotoId();
    }

    res.type("png").send(buffer);
    return undefined; // Dispatcher: Response wurde bereits selbst geschrieben
};
