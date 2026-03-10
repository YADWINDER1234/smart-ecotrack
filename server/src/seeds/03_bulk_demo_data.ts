import type { Knex } from "knex";
import { randomUUID } from "crypto";

const PRODUCTS = [
    { name: "EcoPhone X2", category: "Electronics", manufacturer: "GreenTech Corp", metadata: { model: "X2", year: 2024, weight_kg: 0.17, material: "Recycled Aluminum", color: "Midnight Blue" } },
    { name: "BioLaptop Air", category: "Electronics", manufacturer: "GreenTech Corp", metadata: { model: "Air", year: 2024, weight_kg: 1.2, material: "Bioplastic", screen: "14 inch" } },
    { name: "EcoTablet Mini", category: "Electronics", manufacturer: "GreenTech Corp", metadata: { model: "Mini", year: 2024, weight_kg: 0.35, material: "Recycled Plastic" } },
    { name: "SolarWatch S5", category: "Wearables", manufacturer: "SunWear Inc", metadata: { model: "S5", year: 2024, weight_kg: 0.06, material: "Recycled Steel" } },
    { name: "SolarWatch Lite", category: "Wearables", manufacturer: "SunWear Inc", metadata: { model: "Lite", year: 2024, weight_kg: 0.04, material: "Bamboo Fiber" } },
    { name: "GreenEarbuds Max", category: "Audio", manufacturer: "AcousticGreen Ltd", metadata: { model: "Max", year: 2024, weight_kg: 0.06, material: "Ocean Plastic" } },
    { name: "GreenEarbuds Lite", category: "Audio", manufacturer: "AcousticGreen Ltd", metadata: { model: "Lite", year: 2023, weight_kg: 0.04, material: "Bioplastic" } },
    { name: "BioSpeaker 360", category: "Audio", manufacturer: "AcousticGreen Ltd", metadata: { model: "360", year: 2024, weight_kg: 0.8, material: "Cork & Bamboo" } },
    { name: "EcoKeyboard K1", category: "Accessories", manufacturer: "TypeGreen Co", metadata: { model: "K1", year: 2024, weight_kg: 0.45, material: "Recycled ABS" } },
    { name: "EcoMouse M1", category: "Accessories", manufacturer: "TypeGreen Co", metadata: { model: "M1", year: 2024, weight_kg: 0.08, material: "Recycled HDPE" } },
    { name: "BioCharger 65W", category: "Accessories", manufacturer: "ChargeSafe Inc", metadata: { model: "65W", year: 2024, weight_kg: 0.15, material: "Recycled PC" } },
    { name: "BioCharger 100W", category: "Accessories", manufacturer: "ChargeSafe Inc", metadata: { model: "100W", year: 2024, weight_kg: 0.22, material: "Recycled PC" } },
    { name: "SolarPanel Home", category: "Energy", manufacturer: "SunWear Inc", metadata: { model: "Home", year: 2024, weight_kg: 18.5, material: "Recycled Silicon" } },
    { name: "SolarPanel Portable", category: "Energy", manufacturer: "SunWear Inc", metadata: { model: "Portable", year: 2024, weight_kg: 2.1, material: "Flexible PV Cells" } },
    { name: "EcoRouter WiFi7", category: "Networking", manufacturer: "GreenTech Corp", metadata: { model: "WiFi7", year: 2024, weight_kg: 0.3, material: "Recycled ABS" } },
    { name: "BioCable USB-C 2m", category: "Accessories", manufacturer: "ChargeSafe Inc", metadata: { model: "C2M", year: 2024, weight_kg: 0.05, material: "Bio-Nylon" } },
    { name: "EcoMonitor 27", category: "Electronics", manufacturer: "GreenTech Corp", metadata: { model: "M27", year: 2024, weight_kg: 4.8, material: "Recycled Aluminum" } },
    { name: "BioHeadphones H1", category: "Audio", manufacturer: "AcousticGreen Ltd", metadata: { model: "H1", year: 2024, weight_kg: 0.25, material: "Bamboo & Recycled Steel" } },
    { name: "SolarPowerbank 20K", category: "Energy", manufacturer: "SunWear Inc", metadata: { model: "20K", year: 2024, weight_kg: 0.35, material: "Recycled Li-ion" } },
    { name: "EcoSmartPlug V2", category: "Smart Home", manufacturer: "GreenTech Corp", metadata: { model: "V2", year: 2024, weight_kg: 0.07, material: "Recycled PC" } },
    { name: "BioThermostat Eco", category: "Smart Home", manufacturer: "GreenTech Corp", metadata: { model: "Eco", year: 2024, weight_kg: 0.15, material: "Recycled ABS" } },
    { name: "GreenCam Outdoor", category: "Smart Home", manufacturer: "GreenTech Corp", metadata: { model: "Outdoor", year: 2024, weight_kg: 0.35, material: "Recycled Polycarbonate" } },
    { name: "EcoFitBand V3", category: "Wearables", manufacturer: "SunWear Inc", metadata: { model: "V3", year: 2024, weight_kg: 0.03, material: "Ocean Plastic Strap" } },
    { name: "BioGamepad G1", category: "Gaming", manufacturer: "TypeGreen Co", metadata: { model: "G1", year: 2024, weight_kg: 0.28, material: "Recycled HIPS" } },
    { name: "EcoWebcam HD", category: "Accessories", manufacturer: "GreenTech Corp", metadata: { model: "HD", year: 2024, weight_kg: 0.1, material: "Recycled ABS" } },
];

const COMPLAINT_DESCRIPTIONS = [
    "QR code on my device is not scanning. The image looks damaged.",
    "Dropped off my device 3 weeks ago but no status update on the app.",
    "Device was marked as recycled but I never submitted it. Please investigate.",
    "The recycler confirmed they never received my device despite app saying RECEIVED.",
    "Need proof of recycling certificate for insurance claim.",
    "Product label is peeling off making QR code unreadable.",
    "Recycling center rejected my device saying QR code is invalid.",
    "My device shows FINAL_DISPOSITION but I want to know what happened to it.",
    "The app crashed when I tried to scan my device's QR code.",
    "Recycler charged me a fee even though the app says it should be free.",
    "Device stuck in INTENT_SUBMITTED state for 2 weeks.",
    "Wrong product information showing when QR is scanned.",
    "Got an error saying token expired but my device is only 1 month old.",
    "Recycler provided wrong location for drop-off point.",
    "Need to transfer my QR code ownership to someone else.",
];

const EVENT_NOTES = [
    "Device received in good condition. Proceeding with sorting.",
    "Device sorted. Contains recyclable lithium-ion battery.",
    "Components separated: metals, plastics, circuit boards.",
    "Final disposition complete. Materials sent to respective recycling streams.",
    "Consumer expressed intent to recycle. Scheduled for pickup.",
    "Device received. Cosmetic damage noted but internals intact.",
    "Sorted into electronics waste category. Battery removed safely.",
    "All precious metals extracted and catalogued.",
    "Device disassembled. Screen separated from frame.",
    "Packaging materials recycled. Device core sent for processing.",
];

export async function seed(knex: Knex): Promise<void> {
    const admin = await knex("users").where({ email: "admin@ecotrack.dev" }).first();
    const consumer = await knex("users").where({ email: "consumer@ecotrack.dev" }).first();
    const recycler = await knex("users").where({ email: "recycler@ecotrack.dev" }).first();
    const manufacturer = await knex("users").where({ email: "manufacturer@ecotrack.dev" }).first();

    if (!admin || !consumer || !recycler || !manufacturer) {
        console.log("⚠️  Run seed 01 first!");
        return;
    }

    // --- INSERT PRODUCTS ---
    const existingProducts = await knex("products").select("name");
    const existingNames = new Set(existingProducts.map((p: any) => p.name));
    const newProducts = PRODUCTS.filter(p => !existingNames.has(p.name)).map(p => ({
        id: randomUUID(),
        name: p.name,
        category: p.category,
        manufacturer: p.manufacturer,
        metadata_json: JSON.stringify(p.metadata),
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    }));

    if (newProducts.length > 0) {
        await knex("products").insert(newProducts);
        console.log(`✅  Inserted ${newProducts.length} products`);
    } else {
        console.log("⏭️  Products already exist, skipping");
    }

    // --- INSERT QR CODES ---
    const allProducts = await knex("products").select("id", "name");
    const STATES = ["SCAN", "INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
    let qrInserted = 0;

    for (const product of allProducts) {
        const existingQr = await knex("qr_codes").where({ product_id: product.id }).first();
        if (!existingQr) {
            await knex("qr_codes").insert({
                id: randomUUID(),
                product_id: product.id,
                token_hash: randomUUID(),
                expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                status: "ACTIVE",
                current_state: STATES[Math.floor(Math.random() * STATES.length)],
                lifecycle_state: "CREATED",
                is_fraud: false,
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updated_at: new Date(),
            });
            qrInserted++;
        }
    }
    console.log(`✅  Inserted ${qrInserted} QR codes`);

    // --- INSERT RECYCLING EVENTS ---
    const allQrCodes = await knex("qr_codes").select("id");
    const EVENT_TYPES = ["INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
    let eventsInserted = 0;

    for (const qr of allQrCodes) {
        const existingEvent = await knex("recycling_events").where({ qr_id: qr.id }).first();
        if (!existingEvent) {
            // Insert 1-3 events per QR code
            const numEvents = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numEvents && i < EVENT_TYPES.length; i++) {
                await knex("recycling_events").insert({
                    id: randomUUID(),
                    qr_id: qr.id,
                    actor_id: recycler.id,
                    event_type: EVENT_TYPES[i],
                    timestamp: new Date(Date.now() - (numEvents - i) * 2 * 24 * 60 * 60 * 1000),
                    notes: EVENT_NOTES[Math.floor(Math.random() * EVENT_NOTES.length)],
                    created_at: new Date(),
                });
                eventsInserted++;
            }
        }
    }
    console.log(`✅  Inserted ${eventsInserted} recycling events`);

    // --- INSERT COMPLAINTS ---
    const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
    const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
    let complaintsInserted = 0;

    for (let i = 0; i < allProducts.length && i < COMPLAINT_DESCRIPTIONS.length; i++) {
        const product = allProducts[i];
        const qr = await knex("qr_codes").where({ product_id: product.id }).first();
        const existing = await knex("complaints").where({ product_id: product.id, filed_by: consumer.id }).first();
        if (!existing) {
            await knex("complaints").insert({
                id: randomUUID(),
                product_id: product.id,
                qr_id: qr?.id ?? null,
                filed_by: consumer.id,
                status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
                priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
                assigned_to: admin.id,
                description: COMPLAINT_DESCRIPTIONS[i],
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updated_at: new Date(),
            });
            complaintsInserted++;
        }
    }
    console.log(`✅  Inserted ${complaintsInserted} complaints`);

    // --- INSERT AUDIT LOGS ---
    const ACTIONS = ["PRODUCT_CREATED", "QR_GENERATED", "QR_SCANNED", "COMPLAINT_FILED", "COMPLAINT_RESOLVED", "USER_REGISTERED", "QR_REVOKED"];
    const ENTITY_TYPES = ["product", "qr_code", "complaint", "user"];
    let auditsInserted = 0;

    const existingAudits = await knex("audit_logs").count("id as cnt").first();
    if (Number(existingAudits?.cnt || 0) < 10) {
        for (let i = 0; i < 25; i++) {
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            const entityType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
            const actors = [admin.id, consumer.id, recycler.id, manufacturer.id];
            await knex("audit_logs").insert({
                id: randomUUID(),
                actor_id: actors[Math.floor(Math.random() * actors.length)],
                action,
                entity_type: entityType,
                entity_id: randomUUID(),
                metadata_json: JSON.stringify({ source: "seed", note: `Auto-generated ${action} event` }),
                created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            });
            auditsInserted++;
        }
        console.log(`✅  Inserted ${auditsInserted} audit logs`);
    }

    // --- INSERT SCAN LOGS ---
    let scansInserted = 0;
    const existingScans = await knex("scan_logs").count("id as cnt").first();
    if (Number(existingScans?.cnt || 0) < 10) {
        for (const qr of allQrCodes.slice(0, 20)) {
            await knex("scan_logs").insert({
                id: randomUUID(),
                qr_id: qr.id,
                user_id: consumer.id,
                timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
                outcome: Math.random() > 0.2 ? "VALID" : "EXPIRED",
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
            });
            scansInserted++;
        }
        console.log(`✅  Inserted ${scansInserted} scan logs`);
    }

    console.log("\n🎉  Bulk demo data seeded successfully!");
}
