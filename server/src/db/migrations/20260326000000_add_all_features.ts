import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- Smart Bins table ---
  await knex.schema.createTable("bins", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.decimal("location_lat", 9, 6).notNullable();
    table.decimal("location_lng", 9, 6).notNullable();
    table
      .enu(
        "bin_type",
        ["GENERAL", "PLASTIC", "METAL", "GLASS", "PAPER", "ORGANIC", "EWASTE"],
        { useNative: false, enumName: "bin_type" }
      )
      .notNullable()
      .defaultTo("GENERAL");
    table.integer("fill_level").notNullable().defaultTo(0); // 0-100
    table.decimal("weight_kg", 8, 2).notNullable().defaultTo(0);
    table.decimal("gas_level", 6, 2).notNullable().defaultTo(0);
    table
      .enu("status", ["ACTIVE", "FULL", "MAINTENANCE"], {
        useNative: false,
        enumName: "bin_status"
      })
      .notNullable()
      .defaultTo("ACTIVE");
    table.timestamp("last_reading_at").nullable();
    table.timestamp("predicted_overflow_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["bin_type"]);
    table.index(["status"]);
    table.index(["fill_level"]);
  });

  // --- Rewards table ---
  await knex.schema.createTable("rewards", (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("points").notNullable();
    table.string("reason").notNullable();
    table
      .uuid("source_event_id")
      .nullable()
      .references("id")
      .inTable("recycling_events")
      .onDelete("SET NULL");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["user_id"]);
  });

  // --- Reward Redemptions table ---
  await knex.schema.createTable("reward_redemptions", (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("points_spent").notNullable();
    table.string("reward_type").notNullable(); // e.g. DISCOUNT_CODE, ECO_CREDIT
    table.string("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["user_id"]);
  });

  // --- Blockchain Ledger table ---
  await knex.schema.createTable("blockchain_ledger", (table) => {
    table.increments("id").primary();
    table
      .uuid("event_id")
      .notNullable()
      .references("id")
      .inTable("recycling_events")
      .onDelete("CASCADE");
    table.string("data_hash", 64).notNullable();
    table.string("prev_hash", 64).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["event_id"]);
  });

  // --- Alter products: add waste classification fields ---
  await knex.schema.alterTable("products", (table) => {
    table
      .enu(
        "waste_type",
        [
          "PLASTIC",
          "METAL",
          "GLASS",
          "PAPER",
          "ORGANIC",
          "EWASTE",
          "HAZARDOUS",
          "GENERAL"
        ],
        { useNative: false, enumName: "waste_type" }
      )
      .notNullable()
      .defaultTo("GENERAL");
    table.boolean("is_hazardous").notNullable().defaultTo(false);
  });

  // --- Alter recycling_events: add reward and waste fields ---
  await knex.schema.alterTable("recycling_events", (table) => {
    table.integer("reward_points_awarded").notNullable().defaultTo(0);
    table.string("waste_category").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycling_events", (table) => {
    table.dropColumn("waste_category");
    table.dropColumn("reward_points_awarded");
  });

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("is_hazardous");
    table.dropColumn("waste_type");
  });

  await knex.schema.dropTableIfExists("blockchain_ledger");
  await knex.schema.dropTableIfExists("reward_redemptions");
  await knex.schema.dropTableIfExists("rewards");
  await knex.schema.dropTableIfExists("bins");
}
