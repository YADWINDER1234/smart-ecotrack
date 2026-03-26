import dotenv from "dotenv";
import app from "./app";
import { db } from "./db/connection";
import path from "path";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function start() {
  // Auto-run pending migrations on startup
  try {
    await db.migrate.latest({ directory: path.join(__dirname, "db", "migrations") });
    console.log("Migrations completed successfully");
  } catch (err) {
    console.error("Migration error:", err);
  }

  app.listen(PORT, () => {
    console.log(`Smart EcoTrack API listening on port ${PORT}`);
  });
}

void start();

