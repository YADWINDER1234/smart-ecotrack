const { db } = require('./dist/db/connection');
const crypto = require('crypto');

async function seedLocations() {
  const qrRows = await db("qr_codes").limit(10);
  for (let i = 0; i < qrRows.length; i++) {
    await db("scan_logs").insert({
      id: crypto.randomUUID(),
      qr_id: qrRows[i].id,
      timestamp: new Date(),
      outcome: "SUCCESS",
      lat: 34.0522 + (Math.random() - 0.5) * 2, // Near Los Angeles / California area
      lng: -118.2437 + (Math.random() - 0.5) * 2,
    });
  }
  console.log("Seeded 10 geolocations into scan_logs!");
  process.exit(0);
}

seedLocations().catch(err => {
  console.error(err);
  process.exit(1);
});
