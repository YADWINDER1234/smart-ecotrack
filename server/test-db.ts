
import knex from "knex";
const db = knex({
    client: "pg",
    connection: "postgres://postgres:postgres@localhost:5432/smart_ecotrack"
});

async function testConn() {
    try {
        console.log("Connecting to local DB...");
        const result = await db.raw("SELECT 1+1 AS result");
        console.log("DB Connection successful:", result.rows);

        const tables = await db.raw("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tables in public schema:", tables.rows.map((r: any) => r.tablename));

        process.exit(0);
    } catch (err: any) {
        if (err.code === '3D000') {
            console.error("Database 'smart_ecotrack' does not exist.");
        } else {
            console.error("DB Connection failed:", err.message);
        }
        process.exit(1);
    }
}

testConn();
