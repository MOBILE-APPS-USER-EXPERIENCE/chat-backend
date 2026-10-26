import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tokens", (table) => {
        table.string("token", 16).primary();
        table
            .string("userid", 8)
            .notNullable()
            .references("userid")
            .inTable("users")
            .onDelete("CASCADE");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("userid");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("tokens");
}
