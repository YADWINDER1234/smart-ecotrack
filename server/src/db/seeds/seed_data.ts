import { db } from "../connection";
import { randomUUID, createHash } from "crypto";
import bcrypt from "bcrypt";

const ADMIN_PASSWORD = "AdminPass123!";
const USER_PASSWORD = "UserPass123!";

const categories = [
  "Electronics",
  "Beverages",
  "Household",
  "PersonalCare",
  "FoodPackaging",
  "Others"
];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomScore(): number {
  return Math.round(randomInRange(0.2, 1) * 100) / 100;
}

function randomPastDate(daysBack: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

async function seed() {
  // Clear existing data
  await db("audit_logs").del();
  await db("recycling_events").del();
  await db("scan_logs").del();
  await db("qr_codes").del();
  await db("products").del();
  await db("users").del();

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(USER_PASSWORD, 10);

  // Users
  const adminId = randomUUID();
  const recyclerIds: string[] = [];
  const manufacturerIds: string[] = [];
  const consumerIds: string[] = [];

  const users: any[] = [
    {
      id: adminId,
      name: "Admin User",
      email: "admin@smart-ecotrack.local",
      password_hash: adminPasswordHash,
      role: "ADMIN"
    }
  ];

  for (let i = 0; i < 3; i++) {
    const id = randomUUID();
    recyclerIds.push(id);
    users.push({
      id,
      name: `Recycler ${i + 1}`,
      email: `recycler${i + 1}@smart-ecotrack.local`,
      password_hash: userPasswordHash,
      role: "RECYCLER"
    });
  }

  for (let i = 0; i < 5; i++) {
    const id = randomUUID();
    manufacturerIds.push(id);
    users.push({
      id,
      name: `Manufacturer ${i + 1}`,
      email: `manufacturer${i + 1}@smart-ecotrack.local`,
      password_hash: userPasswordHash,
      role: "MANUFACTURER"
    });
  }

  for (let i = 0; i < 20; i++) {
    const id = randomUUID();
    consumerIds.push(id);
    users.push({
      id,
      name: `Consumer ${i + 1}`,
      email: `consumer${i + 1}@smart-ecotrack.local`,
      password_hash: userPasswordHash,
      role: "CONSUMER"
    });
  }

  await db("users").insert(users);

  // Products
  const products: any[] = [];
  for (let i = 0; i < 1000; i++) {
    const id = randomUUID();
    const category = categories[i % categories.length];
    const manufacturerUserId =
      manufacturerIds[Math.floor(Math.random() * manufacturerIds.length)];
    products.push({
      id,
      name: `Product ${i + 1}`,
      category,
      manufacturer: `Manufacturer ${manufacturerIds.indexOf(
        manufacturerUserId
      ) + 1}`,
      metadata_json: {
        repairability: randomScore(),
        materialRecoverability: randomScore(),
        hazardSafety: randomScore(),
        localFacilityCompat: randomScore()
      },
      created_at: randomPastDate(120)
    });
  }
  await db.batchInsert("products", products, 100);

  // QR codes
  const qrCodes: any[] = [];
  const qrIdList: string[] = [];
  for (const product of products) {
    const qrId = randomUUID();
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const tokenString = `${qrId}:${expiry.toISOString()}`;
    const tokenHash = createHash("sha256").update(tokenString).digest("hex");
    qrCodes.push({
      id: qrId,
      product_id: product.id,
      token_hash: tokenHash,
      expiry,
      status: "ACTIVE",
      current_state: "SCAN",
      created_at: product.created_at
    });
    qrIdList.push(qrId);
  }
  await db.batchInsert("qr_codes", qrCodes, 100);

  // Scan logs
  const scanLogs: any[] = [];
  const totalScans = 2000;
  for (let i = 0; i < totalScans; i++) {
    const qr_id = qrIdList[Math.floor(Math.random() * qrIdList.length)];
    const isValid = Math.random() < 0.95;
    const outcomes = ["INVALID_SIGNATURE", "EXPIRED", "REVOKED", "UNKNOWN_QR"];
    const outcome = isValid
      ? "SUCCESS"
      : outcomes[Math.floor(Math.random() * outcomes.length)];
    const user_id =
      Math.random() < 0.7
        ? consumerIds[Math.floor(Math.random() * consumerIds.length)]
        : null;
    scanLogs.push({
      id: randomUUID(),
      qr_id,
      user_id,
      timestamp: randomPastDate(90),
      outcome,
      ip: "127.0.0.1",
      user_agent: "seed-script"
    });
  }
  await db.batchInsert("scan_logs", scanLogs, 200);

  // Recycling intents and completions
  const intentsCount = 500;
  const completionsCount = 350;
  const selectedForIntent = new Set<string>();
  while (selectedForIntent.size < intentsCount) {
    const qr_id = qrIdList[Math.floor(Math.random() * qrIdList.length)];
    selectedForIntent.add(qr_id);
  }
  const intentQrIds = Array.from(selectedForIntent);

  const selectedForCompletion = new Set<string>();
  while (selectedForCompletion.size < completionsCount) {
    const qr_id = intentQrIds[Math.floor(Math.random() * intentQrIds.length)];
    selectedForCompletion.add(qr_id);
  }
  const completionQrIds = Array.from(selectedForCompletion);

  const recyclingEvents: any[] = [];

  // Intents
  for (const qr_id of intentQrIds) {
    const consumerId =
      consumerIds[Math.floor(Math.random() * consumerIds.length)];
    const ts = randomPastDate(60);
    recyclingEvents.push({
      id: randomUUID(),
      qr_id,
      actor_id: consumerId,
      event_type: "INTENT_SUBMITTED",
      timestamp: ts,
      evidence_url: null,
      notes: "Consumer submitted recycling intent",
      created_at: ts
    });

    await db("qr_codes").where({ id: qr_id }).update({
      current_state: "INTENT_SUBMITTED",
      updated_at: ts
    });
  }

  // Completions
  for (const qr_id of completionQrIds) {
    const recyclerId =
      recyclerIds[Math.floor(Math.random() * recyclerIds.length)];
    const baseTs = randomPastDate(45);
    const receivedTs = new Date(baseTs.getTime() + 1 * 60 * 60 * 1000);
    const sortedTs = new Date(baseTs.getTime() + 2 * 60 * 60 * 1000);
    const finalTs = new Date(baseTs.getTime() + 3 * 60 * 60 * 1000);

    recyclingEvents.push(
      {
        id: randomUUID(),
        qr_id,
        actor_id: recyclerId,
        event_type: "RECEIVED",
        timestamp: receivedTs,
        evidence_url: null,
        notes: "Item received at facility",
        created_at: receivedTs
      },
      {
        id: randomUUID(),
        qr_id,
        actor_id: recyclerId,
        event_type: "SORTED",
        timestamp: sortedTs,
        evidence_url: null,
        notes: "Item sorted into appropriate stream",
        created_at: sortedTs
      },
      {
        id: randomUUID(),
        qr_id,
        actor_id: recyclerId,
        event_type: "FINAL_DISPOSITION",
        timestamp: finalTs,
        evidence_url: "https://example.com/evidence/sample",
        notes: "Final disposition recorded",
        created_at: finalTs
      }
    );

    await db("qr_codes").where({ id: qr_id }).update({
      current_state: "FINAL_DISPOSITION",
      updated_at: finalTs
    });
  }

  await db.batchInsert("recycling_events", recyclingEvents, 200);

  // Seed some complaints
  const complaints: any[] = [];
  for (let i = 0; i < 25; i++) {
    const id = randomUUID();
    const product = products[Math.floor(Math.random() * products.length)];
    const qr_id = qrIdList[Math.floor(Math.random() * qrIdList.length)];
    const filed_by = consumerIds[Math.floor(Math.random() * consumerIds.length)];
    const priority = Math.random() < 0.1 ? "HIGH" : Math.random() < 0.3 ? "MEDIUM" : "LOW";
    const status = "OPEN";
    complaints.push({
      id,
      product_id: product.id,
      qr_id,
      filed_by,
      status,
      priority,
      description: "Seeded complaint: item damaged or QR mismatch",
      image_url: null,
      created_at: randomPastDate(30),
      updated_at: randomPastDate(15)
    });
  }
  if (complaints.length) await db.batchInsert("complaints", complaints, 50);

  // Mark some QRs as revoked / fraud / expired
  const revokeSample = qrIdList.slice(0, 5);
  for (const id of revokeSample) {
    await db("qr_codes").where({ id }).update({ status: "REVOKED", is_fraud: Math.random() < 0.5, lifecycle_state: "REVOKED", updated_at: new Date() });
  }

  // Expire some QRs by setting expiry in the past
  const expiredSample = qrIdList.slice(5, 15);
  for (const id of expiredSample) {
    await db("qr_codes").where({ id }).update({ expiry: new Date(Date.now() - 24 * 60 * 60 * 1000), lifecycle_state: "EXPIRED", updated_at: new Date() });
  }

  // eslint-disable-next-line no-console
  console.log(
    "Seeding complete: users, 1000 products, 2000 scans, 500 intents, 350 completions."
  );
}

seed()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed error", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });

