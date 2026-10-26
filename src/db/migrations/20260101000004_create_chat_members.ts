// src/db/migrations/20260101000004_create_chat_members.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("chat_members", (table) => {
        table.increments("id").primary();
        table
            .integer("chatid")
            .notNullable()
            .references("chatid")
            .inTable("chats")
            .onDelete("CASCADE");

        // Kein FK auf users: Mitgliedschaft bleibt laut API-Doku auch nach
        // einem `deregister` des Users bestehen.
        table.string("userid", 8).notNullable();

        table.unique(["chatid", "userid"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("chat_members");
}
