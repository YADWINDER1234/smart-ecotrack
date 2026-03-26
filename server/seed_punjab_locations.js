const { db } = require('./dist/db/connection');
const crypto = require('crypto');

async function seedLocations() {
  // Clear old test scan logs
  await db("scan_logs").del();

  const qrRows = await db("qr_codes").limit(20);
  for (let i = 0; i < 20; i++) {
    // If no qr_codes, we can't seed scan logs easily, but the demo data has some.
    // We'll reuse the first few QR codes
    const qrId = qrRows[i % qrRows.length]?.id;
    if (!qrId) continue;

    await db("scan_logs").insert({
      id: crypto.randomUUID(),
      qr_id: qrId,
      timestamp: new Date(Date.now() - Math.random() * 10000000),
      outcome: "SUCCESS",
      lat: 31.1471 + (Math.random() - 0.5) * 1.5, // Approx Punjab lat range
      lng: 75.3412 + (Math.random() - 0.5) * 1.5, // Approx Punjab lng range
    });
  }
  console.log("Seeded 20 Punjab geolocations into scan_logs!");
  process.exit(0);
}

seedLocations().catch(err => {
  console.error(err);
  process.exit(1);
});
