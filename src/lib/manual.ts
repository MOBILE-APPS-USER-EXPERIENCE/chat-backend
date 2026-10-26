// src/lib/manual.ts
import { Response } from "express";
import fs from "fs";
import path from "path";

let cached: string | null = null;

/** Liefert manual.html; GET ohne `request`-Parameter landet hier. */
export function sendManual(res: Response): void {
    if (cached === null) {
        const manualPath = path.join(process.cwd(), "manual.html");
        cached = fs.existsSync(manualPath)
            ? fs.readFileSync(manualPath, "utf-8")
            : "<html><body><h1>Chat Server</h1><p>manual.html nicht gefunden.</p></body></html>";
    }
    res.type("html").send(cached);
}
