import type { Knex } from "knex";
import { randomUUID } from "crypto";

const PRODUCTS = [
    {
        id: randomUUID(),
        name: "EcoPhone X1",
        category: "Electronics",
        manufacturer: "GreenTech Corp",
        metadata_json: JSON.stringify({ model: "X1", year: 2024, weight_kg: 0.18, material: "Recycled Aluminum" }),
    },
    {
        id: randomUUID(),
        name: "BioLaptop Pro",
        category: "Electronics",
        manufacturer: "GreenTech Corp",
        metadata_json: JSON.stringify({ model: "Pro", year: 2023, weight_kg: 1.4, material: "Bioplastic" }),
    },
    {
        id: randomUUID(),
        name: "EcoTablet 12",
        category: "Electronics",
        manufacturer: "GreenTech Corp",
        metadata_json: JSON.stringify({ model: "Tab12", year: 2024, weight_kg: 0.55, material: "Recycled Plastic" }),
    },
    {
        id: randomUUID(),
        name: "GreenEarbuds Pro",
        category: "Audio",
        manufacturer: "AcousticGreen Ltd",
        metadata_json: JSON.stringify({ model: "GPro", year: 2024, weight_kg: 0.05, material: "Bioplastic" }),
    },
    {
        id: randomUUID(),
        name: "SolarWatch S3",
        category: "Wearables",
        manufacturer: "SunWear Inc",
        metadata_json: JSON.stringify({ model: "S3", year: 2024, weight_kg: 0.08, material: "Recycled Steel" }),
    }
];

export async function seed(knex: Knex): Promise<void> {
    // Get existing seeded users
    const admin = await knex("users").where({ email: "admin@ecotrack.dev" }).first();
    const consumer = await knex("users").where({ email: "consumer@ecotrack.dev" }).first();
    const recycler = await knex("users").where({ email: "recycler@ecotrack.dev" }).first();
    const manufacturer = await knex("users").where({ email: "manufacturer@ecotrack.dev" }).first();

    if (!admin || !consumer || !recycler || !manufacturer) {
        console.log("⚠️  Please run the 01_test_accounts seed first!");
        return;
    }

    // --- PRODUCTS ---
    const existingProducts = await knex("products").whereIn("name", PRODUCTS.map(p => p.name));
    const existingNames = new Set(existingProducts.map((p: any) => p.name));
    const newProducts = PRODUCTS.filter(p => !existingNames.has(p.name)).map(p => ({
        ...p,
        created_at: new Date()
    }));
    if (newProducts.length > 0) {
        await knex("products").insert(newProducts);
        console.log(`✅  Inserted ${newProducts.length} products`);
    }

    // Get all products for reference
    const products = await knex("products").whereIn("name", PRODUCTS.map(p => p.name));

    // --- QR CODES ---
    const qrCodes: any[] = [];
    const STATES = ["SCAN", "INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
    for (const product of products) {
        const existing = await knex("qr_codes").where({ product_id: product.id }).first();
        if (!existing) {
            const qrId = randomUUID();
            const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            qrCodes.push({
                id: qrId,
                product_id: product.id,
                token_hash: randomUUID(),
                expiry,
                status: "ACTIVE",
                current_state: STATES[Math.floor(Math.random() * STATES.length)],
                lifecycle_state: "CREATED",
                is_fraud: false,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }
    if (qrCodes.length > 0) {
        await knex("qr_codes").insert(qrCodes);
        console.log(`✅  Inserted ${qrCodes.length} QR codes`);
    }

    // Get all QR codes for the products
    const allQrCodes = await knex("qr_codes")
        .whereIn("product_id", products.map((p: any) => p.id));

    // --- RECYCLING EVENTS ---
    const EVENT_TYPES = ["INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
    const recyclingEvents: any[] = [];
    for (const qr of allQrCodes) {
        const existingEvent = await knex("recycling_events").where({ qr_id: qr.id }).first();
        if (!existingEvent) {
            // Add 1-2 events per QR code
            const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
            recyclingEvents.push({
                id: randomUUID(),
                qr_id: qr.id,
                actor_id: recycler.id,
                event_type: eventType,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                notes: `Device received and processed at recycling facility.`,
                created_at: new Date()
            });
        }
    }
    if (recyclingEvents.length > 0) {
        await knex("recycling_events").insert(recyclingEvents);
        console.log(`✅  Inserted ${recyclingEvents.length} recycling events`);
    }

    // --- COMPLAINTS ---
    const COMPLAINT_DATA = [
        {
            description: "The QR code on my EcoPhone X1 is not scanning properly. I have tried multiple times but it always fails.",
            status: "OPEN",
            priority: "HIGH"
        },
        {
            description: "I dropped off my BioLaptop Pro at the recycling center 2 weeks ago but there is no status update in the app.",
            status: "IN_REVIEW",
            priority: "MEDIUM"
        },
        {
            description: "My SolarWatch S3 was marked as recycled but I never dropped it off. Please investigate.",
            status: "OPEN",
            priority: "HIGH"
        },
        {
            description: "The app shows my GreenEarbuds as RECEIVED but the recycler said they never got them.",
            status: "RESOLVED",
            priority: "LOW"
        },
        {
            description: "Requesting proof of recycling for my EcoTablet 12 for my company's sustainability report.",
            status: "IN_REVIEW",
            priority: "MEDIUM"
        }
    ];

    for (let i = 0; i < COMPLAINT_DATA.length && i < products.length; i++) {
        const product = products[i];
        const qrForProduct = allQrCodes.find((q: any) => q.product_id === product.id);
        const existing = await knex("complaints").where({ product_id: product.id, filed_by: consumer.id }).first();
        if (!existing) {
            await knex("complaints").insert({
                id: randomUUID(),
                product_id: product.id,
                qr_id: qrForProduct?.id ?? null,
                filed_by: consumer.id,
                status: COMPLAINT_DATA[i].status,
                priority: COMPLAINT_DATA[i].priority,
                assigned_to: admin.id,
                description: COMPLAINT_DATA[i].description,
                created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
                updated_at: new Date()
            });
        }
    }
    console.log(`✅  Inserted complaints`);

    console.log("\n🎉  Demo data seeded successfully!");
}
