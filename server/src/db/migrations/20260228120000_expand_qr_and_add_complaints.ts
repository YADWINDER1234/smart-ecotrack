import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add lifecycle columns to qr_codes
  await knex.schema.alterTable("qr_codes", (table) => {
    table.string("lifecycle_state").notNullable().defaultTo("CREATED");
    table.string("previous_state").nullable();
    table.uuid("updated_by").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("state_updated_at").nullable();
    table.boolean("is_fraud").notNullable().defaultTo(false);
  });

  // Complaints table
  await knex.schema.createTable("complaints", (table) => {
    table.uuid("id").primary();
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.uuid("qr_id").nullable().references("id").inTable("qr_codes").onDelete("SET NULL");
    table.uuid("filed_by").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table
      .enu("status", ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"], {
        useNative: false,
        enumName: "complaint_status"
      })
      .notNullable()
      .defaultTo("OPEN");
    table
      .enu("priority", ["LOW", "MEDIUM", "HIGH"], {
        useNative: false,
        enumName: "complaint_priority"
      })
      .notNullable()
      .defaultTo("LOW");
    table.uuid("assigned_to").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.text("description").nullable();
    table.string("image_url").nullable();
    table.text("response_message").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["product_id"]);
    table.index(["qr_id"]);
    table.index(["filed_by"]);
    table.index(["status"]);
    table.index(["priority"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("complaints");

  await knex.schema.alterTable("qr_codes", (table) => {
    table.dropColumn("lifecycle_state");
    table.dropColumn("previous_state");
    table.dropColumn("updated_by");
    table.dropColumn("state_updated_at");
    table.dropColumn("is_fraud");
  });
}
