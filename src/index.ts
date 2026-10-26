// src/index.ts
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { db } from "./db";
import { dispatcher } from "./dispatcher";
import { ApiError } from "./lib/errors";
import { ensureStorageDirs } from "./lib/storage";

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap(): Promise<void> {
    ensureStorageDirs();

    await db.migrate.latest();
    console.log("Datenbank-Migrationen angewendet.");

    const app = express();
    app.use(express.json({ limit: "20mb" }));

    app.all("*", dispatcher);

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof ApiError) {
            res.status(err.code).json({ status: "error", message: err.message, code: err.code });
            return;
        }
        console.error("Unerwarteter Fehler:", err);
        res.status(500).json({ status: "error", message: "Internal server error", code: 500 });
    });

    app.listen(PORT, () => {
        console.log(`Chat-Server läuft auf Port ${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error("Fataler Fehler beim Start:", err);
    process.exit(1);
});
