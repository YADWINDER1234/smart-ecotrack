import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("admin_actions", (table) => {
    table.uuid("id").primary();
    table.uuid("admin_id").notNullable().references("id").inTable("users");
    table.enum("action_type", [
      "OVERRIDE_COMPLAINT",
      "OVERRIDE_QR_STATE",
      "OVERRIDE_USER_ROLE",
      "OVERRIDE_COMPLAINT_ASSIGN",
      "BATCH_UPDATE"
    ]).notNullable();
    table.string("entity_type", 50).notNullable(); // complaint, qr_code, user, etc.
    table.string("entity_id").notNullable();
    table.text("old_value"); // JSON stored as text
    table.text("new_value"); // JSON stored as text
    table.text("reason").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("undone_at").nullable(); // When this action was undone
    
    table.index(["admin_id", "created_at"]);
    table.index(["entity_type", "entity_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("admin_actions");
}
