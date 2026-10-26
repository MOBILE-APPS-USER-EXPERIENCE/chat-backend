import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("files", (table) => {
        table.string("fileid", 16).primary();
        table.string("mimetype").notNullable().defaultTo("application/octet-stream");
        table.string("original_name").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("files");
}
