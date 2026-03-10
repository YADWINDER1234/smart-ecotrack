import knex, { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/smart_ecotrack";

const config: Knex.Config = {
  client: "pg",
  connection: DATABASE_URL
};

export const db = knex(config);

