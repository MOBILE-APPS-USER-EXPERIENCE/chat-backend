// src/lib/time.ts

/**
 * Formatiert einen DB-Timestamp als `Y-m-d_H-i-s`, exakt wie in
 * api-docs.yaml für das `time`-Feld jeder Message dokumentiert.
 *
 * Bewusst in UTC statt Server-Lokalzeit, damit das Format unabhängig von der
 * Container-Timezone konsistent bleibt. Empfehlung: Container mit TZ=UTC
 * betreiben, dann ist "UTC" auch gleichzeitig "Serverzeit".
 */
export function formatApiTimestamp(value: unknown): string {
    const date = toDate(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate()),
    ].join("-") + "_" + [
        pad(date.getUTCHours()),
        pad(date.getUTCMinutes()),
        pad(date.getUTCSeconds()),
    ].join("-");
}

function toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === "number") return new Date(value);
    if (typeof value === "string") {
        // better-sqlite3/knex liefert "YYYY-MM-DD HH:MM:SS" ohne Zeitzone
        // (CURRENT_TIMESTAMP ist in SQLite UTC) -> explizit als UTC parsen.
        const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
        return new Date(iso);
    }
    return new Date();
}
