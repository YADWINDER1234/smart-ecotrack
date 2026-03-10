import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table
      .enu("role", ["ADMIN", "CONSUMER", "RECYCLER", "MANUFACTURER"], {
        useNative: false,
        enumName: "user_role"
      })
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("products", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("category").notNullable();
    table.string("manufacturer").notNullable();
    table.jsonb("metadata_json").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("qr_codes", (table) => {
    table.uuid("id").primary();
    table
      .uuid("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table.string("token_hash").notNullable().unique();
    table.timestamp("expiry").notNullable();
    table
      .enu("status", ["ACTIVE", "REVOKED"], {
        useNative: false,
        enumName: "qr_status"
      })
      .notNullable()
      .defaultTo("ACTIVE");
    table
      .enu(
        "current_state",
        ["SCAN", "INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"],
        { useNative: false, enumName: "workflow_state" }
      )
      .notNullable()
      .defaultTo("SCAN");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["product_id"]);
    table.index(["current_state"]);
  });

  await knex.schema.createTable("scan_logs", (table) => {
    table.uuid("id").primary();
    table
      .uuid("qr_id")
      .notNullable()
      .references("id")
      .inTable("qr_codes")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.string("outcome").notNullable();
    table.string("ip").nullable();
    table.string("user_agent").nullable();

    table.index(["qr_id"]);
    table.index(["user_id"]);
  });

  await knex.schema.createTable("recycling_events", (table) => {
    table.uuid("id").primary();
    table
      .uuid("qr_id")
      .notNullable()
      .references("id")
      .inTable("qr_codes")
      .onDelete("CASCADE");
    table
      .uuid("actor_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .enu(
        "event_type",
        ["INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"],
        { useNative: false, enumName: "recycling_event_type" }
      )
      .notNullable();
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.string("evidence_url").nullable();
    table.text("notes").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["qr_id"]);
    table.index(["actor_id"]);
    table.index(["event_type"]);
  });

  await knex.schema.createTable("audit_logs", (table) => {
    table.uuid("id").primary();
    table
      .uuid("actor_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("action").notNullable();
    table.string("entity_type").notNullable();
    table.uuid("entity_id").nullable();
    table.jsonb("metadata_json").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["actor_id"]);
    table.index(["entity_type"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("audit_logs");
  await knex.schema.dropTableIfExists("recycling_events");
  await knex.schema.dropTableIfExists("scan_logs");
  await knex.schema.dropTableIfExists("qr_codes");
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("users");
}

