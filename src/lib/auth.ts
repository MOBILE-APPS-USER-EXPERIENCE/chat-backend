// src/lib/auth.ts
import { db } from "../db";
import { CommandParams } from "../types";
import { Errors } from "./errors";
import { requireParam } from "./validate";

export interface AuthContext {
    token: string;
    userid: string;
    nickname: string;
    fullname: string;
    hash: string;
}

/**
 * Löst das Token zu einem User auf. Wirft 403/404 bei fehlendem Parameter,
 * 456 bei unbekanntem/abgelaufenem Token. Wird von jedem Command außer
 * ping, register, login, validatetoken und clear benötigt.
 */
export async function requireAuth(params: CommandParams, requestName: string): Promise<AuthContext> {
    const token = requireParam(params, "token", requestName, "Session token from login/register");

    const row = await db("tokens")
        .join("users", "users.userid", "tokens.userid")
        .where("tokens.token", token)
        .select(
            "tokens.token",
            "users.userid",
            "users.nickname",
            "users.fullname",
            "users.hash"
        )
        .first();

    if (!row) {
        throw Errors.invalidToken();
    }

    return row;
}
