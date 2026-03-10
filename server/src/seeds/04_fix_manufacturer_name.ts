import type { Knex } from "knex";

// One-time fix: update the manufacturer user name to match product data
export async function seed(knex: Knex): Promise<void> {
    await knex("users")
        .where({ email: "manufacturer@ecotrack.dev" })
        .update({ name: "GreenTech Corp" });
    console.log("✅  Updated manufacturer name to 'GreenTech Corp'");
}
