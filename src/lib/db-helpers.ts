// src/lib/db-helpers.ts

/**
 * Normalisiert den Rückgabewert von `.insert(...).returning(col)` über
 * Dialekte hinweg: Postgres liefert ein Array von Row-Objekten, manche
 * SQLite-Treiberversionen liefern stattdessen ein Array von Rohwerten.
 * Einmal hier zentral geschrieben, damit jeder Command, der nach einem
 * Insert die Auto-Increment-ID braucht, heute auf SQLite und später auf
 * Postgres identisch funktioniert.
 */
export function extractReturningValue<T = any>(rows: any[], column: string): T {
    const first = rows[0];
    return (typeof first === "object" && first !== null ? first[column] : first) as T;
}
