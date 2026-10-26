// src/lib/storage.ts
import fs from "fs";
import path from "path";

// process.cwd() ist im Docker-Image "/app" (siehe Dockerfile WORKDIR),
// also landet das standardmäßig exakt im gemounteten Volume /app/data.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const PHOTOS_DIR = path.join(DATA_DIR, "photos");
export const FILES_DIR = path.join(DATA_DIR, "files");

export function ensureStorageDirs(): void {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

/**
 * Entfernt ein optionales `data:<mime>;base64,`-Prefix und dekodiert den
 * Rest als Buffer. Fotos/Dateien kommen laut api-docs.yaml mit oder ohne
 * diesen Prefix.
 */
export function decodeBase64Payload(input: string): Buffer {
    const commaIndex = input.indexOf(",");
    const payload =
        input.startsWith("data:") && commaIndex !== -1 ? input.slice(commaIndex + 1) : input;
    return Buffer.from(payload, "base64");
}

/**
 * Verteidigung in der Tiefe: photoid/fileid stammen zwar ausschließlich aus
 * generateId() (siehe crypto.ts) und werden vor jedem Dateizugriff gegen die
 * DB geprüft — aber genau eine ungeprüfte ID-als-Dateiname-Stelle war der
 * Auslöser für die ursprüngliche PHP-Schwachstelle. Daher hier zusätzlich
 * ein strikter Zeichen-Whitelist-Check, auch wenn er im Normalfall nie
 * greifen sollte.
 */
function assertSafeId(id: string): void {
    if (!/^[A-Za-z0-9]+$/.test(id)) {
        throw new Error(`Unsafe id used for file access: ${id}`);
    }
}

export function photoPath(photoid: string): string {
    assertSafeId(photoid);
    return path.join(PHOTOS_DIR, `${photoid}.png`);
}

export function filePath(fileid: string): string {
    assertSafeId(fileid);
    return path.join(FILES_DIR, fileid);
}
