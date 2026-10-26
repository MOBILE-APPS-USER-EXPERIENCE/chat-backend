// src/commands/validatetoken.ts
import { db } from "../db";
import { CommandHandler } from "../types";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Antwortet laut API-Doku IMMER mit HTTP 200 — das eigentliche Ergebnis
 * steht nur in `message`. Fehlt der Token komplett, wird das bewusst nicht
 * als 403 behandelt (das würde Brute-Force-Versuchen verraten, ob überhaupt
 * ein Parameter gesendet wurde), sondern einfach als "nicht valide" gewertet.
 * Die künstliche 1-Sekunden-Verzögerung bremst Brute-Force-Versuche.
 */
export const validatetoken: CommandHandler = async (params) => {
    const token = typeof params.token === "string" ? params.token.trim() : "";

    let valid = false;
    if (token !== "") {
        const row = await db("tokens").where({ token }).first();
        valid = !!row;
    }

    await sleep(1000);

    return {
        status: "ok",
        message: valid ? "Token valid" : "Token NOT valid",
        code: 200,
    };
};
