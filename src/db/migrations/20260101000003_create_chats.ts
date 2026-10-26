import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("chats", (table) => {
        table.increments("chatid").primary(); // startet bei 1; 0 = Main-Chat (virtuell, kein DB-Eintrag)
        table.string("chatname").notNullable();
        table.boolean("ispublic").notNullable().defaultTo(false);
        table.boolean("directchat").notNullable().defaultTo(false);
        table
            .string("owner_userid", 8)
            .nullable()
            .references("userid")
            .inTable("users")
            .onDelete("SET NULL"); // Chat bleibt bestehen, owner wird leer (siehe API-Doku)
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("chats");
}
