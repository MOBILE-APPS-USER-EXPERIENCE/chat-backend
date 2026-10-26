// src/db/knexfile.ts
import type { Knex } from "knex";
import path from "path";

// ts-node (Dev) liest diese Datei als .ts, der kompilierte Build als .js.
// __filename zeigt zur Laufzeit den tatsächlich geladenen Dateityp an.
const migrationExtension = __filename.endsWith(".ts") ? "ts" : "js";

const sqlitePool = {
    afterCreate: (conn: any, cb: (err: Error | null, conn: any) => void) => {
        conn.pragma("foreign_keys = ON");
        cb(null, conn);
    },
};

const config: Record<string, Knex.Config> = {
    sqlite: {
        client: "better-sqlite3",
        connection: {
            filename: process.env.DB_PATH || path.join(__dirname, "../../data/chat.db"),
        },
        useNullAsDefault: true,
        pool: sqlitePool,
        migrations: {
            directory: path.join(__dirname, "migrations"),
            extension: migrationExtension,
        },
    },
    postgres: {
        client: "pg",
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: path.join(__dirname, "migrations"),
            extension: migrationExtension,
        },
    },
};

export default config;
