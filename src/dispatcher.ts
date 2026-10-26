// src/dispatcher.ts
import { NextFunction, Request, Response } from "express";
import { commands } from "./commands";
import { Errors } from "./lib/errors";
import { sendManual } from "./lib/manual";

export async function dispatcher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const params: Record<string, any> =
            req.method === "POST" ? req.body ?? {} : { ...req.query };

        const hasRequestParam = typeof params.request === "string" && params.request.trim() !== "";

        if (!hasRequestParam) {
            const isGet = req.method === "GET";
            const bodyIsEmpty = !isGet && Object.keys(params).length === 0;
            if (isGet || bodyIsEmpty) {
                sendManual(res);
                return;
            }
            throw Errors.missingRequest();
        }

        const requestName = String(params.request);
        if (!/^[a-zA-Z]+$/.test(requestName)) {
            throw Errors.illegalCharacters("request");
        }

        const handler = commands[requestName.toLowerCase()];
        if (!handler) {
            throw Errors.unknownRequest(requestName);
        }

        const result = await handler(params, res);

        // getphoto/getfile schreiben die Response bereits selbst (Binärdaten) und
        // geben undefined zurück -> dann hier nichts mehr senden.
        if (result === undefined) return;

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
