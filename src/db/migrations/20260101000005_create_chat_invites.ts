// src/db/migrations/20260101000005_create_chat_invites.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("chat_invites", (table) => {
        table.increments("id").primary();
        table
            .integer("chatid")
            .notNullable()
            .references("chatid")
            .inTable("chats")
            .onDelete("CASCADE");

        // Ebenfalls kein FK auf users, aus denselben Gründen wie chat_members.
        table.string("userid", 8).notNullable();

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.unique(["chatid", "userid"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("chat_invites");
}
