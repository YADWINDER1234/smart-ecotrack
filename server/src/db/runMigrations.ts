import { db } from "./connection";
import path from "path";

async function run() {
  try {
    const migrationsDir = path.join(__dirname, "migrations");
    await db.migrate.latest({ directory: migrationsDir });
    // eslint-disable-next-line no-console
    console.log("Migrations completed");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Migration error", err);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

void run();

