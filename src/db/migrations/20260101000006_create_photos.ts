import type { Knex } from "knex";

// Binärdaten liegen im Volume (/app/data/photos/<photoid>.png),
// hier wird nur Metadaten/Existenz getrackt.
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("photos", (table) => {
        table.string("photoid", 16).primary();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("photos");
}
