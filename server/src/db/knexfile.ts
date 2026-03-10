import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/smart_ecotrack";

const common: Knex.Config = {
  client: "pg",
  connection: DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, "migrations")
  },
  seeds: {
    directory: path.join(__dirname, "seeds")
  }
};

const config: { [key: string]: Knex.Config } = {
  development: common,
  production: common
};

module.exports = config;

