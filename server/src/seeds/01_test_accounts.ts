import type { Knex } from "knex";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const ROLES = [
    { name: "Admin User", email: "admin@ecotrack.dev", password: "Admin@1234!", role: "ADMIN" },
    { name: "Consumer User", email: "consumer@ecotrack.dev", password: "Consumer@1234!", role: "CONSUMER" },
    { name: "Recycler User", email: "recycler@ecotrack.dev", password: "Recycler@1234!", role: "RECYCLER" },
    { name: "Manufacturer User", email: "manufacturer@ecotrack.dev", password: "Manufacturer@1234!", role: "MANUFACTURER" },
];

export async function seed(knex: Knex): Promise<void> {
    for (const account of ROLES) {
        const existing = await knex("users").where({ email: account.email }).first();
        if (!existing) {
            const password_hash = await bcrypt.hash(account.password, 10);
            await knex("users").insert({
                id: randomUUID(),
                name: account.name,
                email: account.email,
                password_hash,
                role: account.role,
                created_at: new Date(),
                updated_at: new Date(),
            });
            console.log(`Created ${account.role} account: ${account.email}`);
        } else {
            console.log(`Skipped ${account.role} (already exists): ${account.email}`);
        }
    }
}
