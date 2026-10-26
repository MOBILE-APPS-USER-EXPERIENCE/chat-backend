// src/db/migrations/20260101000009_add_chats_direct_invite_sent.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("chats", (table) => {
        table.boolean("direct_invite_sent").notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("chats", (table) => {
        table.dropColumn("direct_invite_sent");
    });
}
