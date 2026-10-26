// src/db/migrations/20260101000008_create_messages.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("messages", (table) => {
        table.increments("id").primary();
        table.integer("chatid").notNullable();

        // Bewusst OHNE Foreign-Key-Constraint: userid ist hier eine historische
        // Referenz. Nach einem `deregister` existiert die Zeile in `users` nicht
        // mehr, die Nachricht soll laut API-Doku aber trotzdem erhalten bleiben.
        // Autor-Infos werden daher beim Posten denormalisiert statt live gejoint.
        table.string("userid", 8).notNullable();
        table.string("usernick", 30).notNullable();
        table.string("userhash", 16).notNullable();
        table.string("userfullname", 30).notNullable();

        table.timestamp("time").notNullable().defaultTo(knex.fn.now());
        table.text("text").nullable();

        table
            .string("photoid", 16)
            .nullable()
            .references("photoid")
            .inTable("photos")
            .onDelete("SET NULL");

        table
            .string("fileid", 16)
            .nullable()
            .references("fileid")
            .inTable("files")
            .onDelete("SET NULL");

        table.string("position").nullable();
        table.boolean("important").notNullable().defaultTo(false);

        table.index(["chatid", "id"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("messages");
}
