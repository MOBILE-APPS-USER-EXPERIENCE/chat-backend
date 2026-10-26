// src/lib/validate.ts
import { CommandParams } from "../types";
import { Errors } from "./errors";

const USERID_REGEX = /^[a-zA-Z]{4}it[0-9]{2}$/i;

/** Holt einen Pflichtparameter, wirft 403 bei Abwesenheit, 404 bei Leerstring. */
export function requireParam(
    params: CommandParams,
    name: string,
    requestName: string,
    description: string
): string {
    const value = params[name];
    if (value === undefined || value === null) {
        throw Errors.missingParameter(requestName, name, description);
    }
    const str = String(value);
    if (str.trim() === "") {
        throw Errors.emptyParameter(name);
    }
    return str;
}

/** Wie requireParam, prüft zusätzlich auf eine reine Ganzzahl (405). */
export function requireNumeric(
    params: CommandParams,
    name: string,
    requestName: string,
    description: string
): number {
    const raw = requireParam(params, name, requestName, description);
    if (!/^-?\d+$/.test(raw)) {
        throw Errors.notNumeric(name);
    }
    return parseInt(raw, 10);
}

/** Validiert das HSE-Login-Format und normalisiert auf Kleinschreibung. */
export function validateUserId(userid: string): string {
    if (!USERID_REGEX.test(userid)) {
        throw Errors.invalidUserId();
    }
    return userid.toLowerCase();
}

export function validatePassword(password: string): void {
    if (password.length < 6) {
        throw Errors.passwordTooShort();
    }
}

export function validateNickname(nickname: string): void {
    if (nickname.length < 2) throw Errors.nicknameTooShort();
    if (nickname.length > 30) throw Errors.nicknameTooLong();
}

export function validateFullname(fullname: string): void {
    if (fullname.length < 2) throw Errors.fullnameTooShort();
    if (fullname.length > 30) throw Errors.fullnameTooLong();
}

/** Entfernt HTML-Tags und NUL-Bytes, escaped Quotes — wie im Original beschrieben. */
export function sanitizeText(text: string): string {
    return text
        .replace(/\0/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/** Wie requireNumeric, aber optional mit Default-Wert statt 403/404. */
export function optionalNumeric(
    params: CommandParams,
    name: string,
    defaultValue: number
): number {
    const value = params[name];
    if (value === undefined || value === null || String(value).trim() === "") {
        return defaultValue;
    }
    const str = String(value);
    if (!/^-?\d+$/.test(str)) {
        throw Errors.notNumeric(name);
    }
    return parseInt(str, 10);
}

/**
 * Akzeptiert laut api-docs.yaml true/false, "true"/"false" und 1/0.
 * Zentral hier definiert, da sowohl createchat (ispublic/directchat) als
 * auch postmessage (important) dieselbe Logik brauchen.
 */
export function parseBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
    if (typeof value === "number") return value === 1;
    return false;
}
