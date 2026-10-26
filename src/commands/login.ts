// src/commands/login.ts
import { db } from "../db";
import { generateUniqueId, hashPassword, verifyPassword } from "../lib/crypto";
import { Errors } from "../lib/errors";
import { requireParam, validateUserId } from "../lib/validate";
import { CommandHandler } from "../types";

export const login: CommandHandler = async (params) => {
    const rawUserid = requireParam(params, "userid", "login", "The users login id");
    const password = requireParam(params, "password", "login", "The users password");

    const userid = validateUserId(rawUserid);

    const user = await db("users").where({ userid }).first();
    if (!user) {
        throw Errors.unknownUser();
    }

    if (!user.password_hash) {
        // Nach einem Admin-resetuser hat der User kein Passwort mehr -> das hier
        // übergebene Passwort wird gemäß API-Doku zum neuen Passwort.
        const passwordHash = hashPassword(password);
        await db("users").where({ userid }).update({ password_hash: passwordHash });
    } else {
        if (!verifyPassword(password, user.password_hash)) {
            throw Errors.wrongPassword();
        }
    }

    const token = await generateUniqueId(
        async (candidate) => !!(await db("tokens").where({ token: candidate }).first())
    );

    await db("tokens").insert({ token, userid });

    return { status: "ok", message: "Logged in", token, hash: user.hash, code: 200 };
};
