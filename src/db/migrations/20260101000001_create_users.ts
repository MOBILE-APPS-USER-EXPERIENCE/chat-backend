import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) => {
        table.string("userid", 8).primary();          // z.B. abcdit01
        table.string("password_hash").nullable();       // null nach resetuser
        table.string("nickname", 30).notNullable();
        table.string("fullname", 30).notNullable();
        table.string("hash", 16).notNullable().unique(); // public id
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("users");
}
