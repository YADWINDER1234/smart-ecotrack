import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.integer("points").notNullable().defaultTo(0);
  });

  await knex.schema.alterTable("scan_logs", (table) => {
    table.decimal("lat", 9, 6).nullable();
    table.decimal("lng", 9, 6).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("scan_logs", (table) => {
    table.dropColumn("lat");
    table.dropColumn("lng");
  });

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("points");
  });
}
