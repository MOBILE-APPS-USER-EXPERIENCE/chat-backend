// src/db/index.ts
import knexLib from "knex";
import config from "./knexfile";

// Bewusst getrennt von NODE_ENV: NODE_ENV darf in Produktion "production"
// bleiben (Performance-Optimierungen von Express etc.), ohne dass dadurch
// automatisch Postgres gewählt wird.
const client = process.env.DB_CLIENT === "postgres" ? "postgres" : "sqlite";

export const db = knexLib(config[client]);
