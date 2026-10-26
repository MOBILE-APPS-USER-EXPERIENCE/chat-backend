// src/commands/getfile.ts
import { Response } from "express";
import fs from "fs/promises";
import { db } from "../db";
import { requireAuth } from "../lib/auth";
import { Errors } from "../lib/errors";
import { filePath } from "../lib/storage";
import { requireParam } from "../lib/validate";
import { CommandHandler } from "../types";

export const getfile: CommandHandler = async (params, res: Response) => {
    await requireAuth(params, "getfile");
    const fileid = requireParam(params, "fileid", "getfile", "Id of the file to download");

    const row = await db("files").where({ fileid }).first();
    if (!row) {
        throw Errors.invalidFileId();
    }

    let buffer: Buffer;
    try {
        buffer = await fs.readFile(filePath(fileid));
    } catch {
        throw Errors.invalidFileId();
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileid}"`);
    res.type(row.mimetype || "application/octet-stream").send(buffer);
    return undefined;
};
