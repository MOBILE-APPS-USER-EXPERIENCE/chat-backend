// src/commands/ping.ts
import { CommandHandler } from "../types";

export const ping: CommandHandler = async () => {
    return { status: "ok", message: "Pong", code: 200 };
};
