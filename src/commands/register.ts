// src/commands/register.ts
import { db } from "../db";
import { generateUniqueId, hashPassword } from "../lib/crypto";
import { Errors } from "../lib/errors";
import {
    requireParam,
    validateFullname,
    validateNickname,
    validatePassword,
    validateUserId,
} from "../lib/validate";
import { CommandHandler } from "../types";

export const register: CommandHandler = async (params) => {
    const rawUserid = requireParam(params, "userid", "register", "The HSE login id");
    const password = requireParam(params, "password", "register", "The users password");
    const nickname = requireParam(params, "nickname", "register", "Display name");
    const fullname = requireParam(params, "fullname", "register", "Full name");

    const userid = validateUserId(rawUserid);
    validatePassword(password);
    validateNickname(nickname);
    validateFullname(fullname);

    const existing = await db("users").where({ userid }).first();
    if (existing) {
        throw Errors.userExists();
    }

    const passwordHash = hashPassword(password);

    const hash = await generateUniqueId(
        async (candidate) => !!(await db("users").where({ hash: candidate }).first())
    );

    await db("users").insert({
        userid,
        password_hash: passwordHash,
        nickname,
        fullname,
        hash,
    });

    const token = await generateUniqueId(
        async (candidate) => !!(await db("tokens").where({ token: candidate }).first())
    );

    await db("tokens").insert({ token, userid });

    return { status: "ok", message: "Registered", token, hash, code: 200 };
};
