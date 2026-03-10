import { db } from "../db/connection";

type CategoryScan = { category: string; scans: number };
type FunnelStage = { state: string; count: number };
type RecyclerPerf = {
  recycler_id: string;
  received: number;
  sorted: number;
  finalized: number;
  avg_hours_received_to_final: number | null;
};

function manufacturerWhereClause(manufacturer?: string) {
  if (!manufacturer) return {};
  return { "products.manufacturer": manufacturer };
}

export async function getAdminDashboard(manufacturer?: string) {
  const totalScansRow = await db("scan_logs")
    .count<{ count: string }>("* as count")
    .where({ outcome: "SUCCESS" })
    .first();

  const intentsRow = await db("qr_codes")
    .count<{ count: string }>("* as count")
    .modify((qb) => {
      qb.whereIn("current_state", [
        "INTENT_SUBMITTED",
        "RECEIVED",
        "SORTED",
        "FINAL_DISPOSITION"
      ]);
    })
    .join("products", "qr_codes.product_id", "products.id")
    .where(manufacturerWhereClause(manufacturer))
    .first();

  const completionsRow = await db("qr_codes")
    .count<{ count: string }>("* as count")
    .where({ current_state: "FINAL_DISPOSITION" })
    .join("products", "qr_codes.product_id", "products.id")
    .where(manufacturerWhereClause(manufacturer))
    .first();

  const categoryScans = (await db("scan_logs")
    .select("products.category")
    .count<{ count: string }>("scan_logs.id as count")
    .join("qr_codes", "scan_logs.qr_id", "qr_codes.id")
    .join("products", "qr_codes.product_id", "products.id")
    .where({ "scan_logs.outcome": "SUCCESS" })
    .where(manufacturerWhereClause(manufacturer))
    .groupBy("products.category")
    .orderBy("count", "desc")) as unknown as Array<{ category: string; count: string }>;

  const funnel = (await db("qr_codes")
    .select("qr_codes.current_state")
    .count<{ count: string }>("qr_codes.id as count")
    .join("products", "qr_codes.product_id", "products.id")
    .where(manufacturerWhereClause(manufacturer))
    .groupBy("qr_codes.current_state")) as unknown as Array<{ current_state: string; count: string }>;

  const recyclerPerformance = (await db
    .with("per_qr", (qb) => {
      qb.select([
        "qr_id",
        "actor_id",
        db.raw(
          "MIN(CASE WHEN event_type='RECEIVED' THEN timestamp END) as received_ts"
        ),
        db.raw(
          "MIN(CASE WHEN event_type='FINAL_DISPOSITION' THEN timestamp END) as final_ts"
        )
      ])
        .from("recycling_events")
        .groupBy("qr_id", "actor_id");
    })
    .select([
      "recycling_events.actor_id as recycler_id",
      db.raw("COUNT(*) FILTER (WHERE event_type='RECEIVED') as received"),
      db.raw("COUNT(*) FILTER (WHERE event_type='SORTED') as sorted"),
      db.raw("COUNT(*) FILTER (WHERE event_type='FINAL_DISPOSITION') as finalized"),
      db.raw(
        "AVG(EXTRACT(EPOCH FROM (per_qr.final_ts - per_qr.received_ts))/3600.0) as avg_hours_received_to_final"
      )
    ])
    .from("recycling_events")
    .join("per_qr", function joinPerQr() {
      this.on("per_qr.qr_id", "=", "recycling_events.qr_id").andOn(
        "per_qr.actor_id",
        "=",
        "recycling_events.actor_id"
      );
    })
    .whereNotNull("per_qr.received_ts")
    .whereNotNull("per_qr.final_ts")
    .groupBy("recycling_events.actor_id")) as unknown as Array<{
    recycler_id: string;
    received: string;
    sorted: string;
    finalized: string;
    avg_hours_received_to_final: string | null;
  }>;

  const avgEcoRow = await db("qr_codes")
    .join("products", "qr_codes.product_id", "products.id")
    .where(manufacturerWhereClause(manufacturer))
    .select(
      db.raw(
        `AVG(
          0.25*LEAST(GREATEST(COALESCE((products.metadata_json->>'repairability')::float,0),0),1) +
          0.25*LEAST(GREATEST(COALESCE((products.metadata_json->>'materialRecoverability')::float, COALESCE((products.metadata_json->>'material_recoverability')::float,0)),0),1) +
          0.20*LEAST(GREATEST(COALESCE((products.metadata_json->>'hazardSafety')::float, COALESCE((products.metadata_json->>'hazard_safety')::float,0)),0),1) +
          0.15*LEAST(GREATEST(COALESCE((products.metadata_json->>'localFacilityCompat')::float, COALESCE((products.metadata_json->>'local_facility_compat')::float,0)),0),1) +
          0.15*(
            CASE qr_codes.current_state
              WHEN 'SCAN' THEN 0
              WHEN 'INTENT_SUBMITTED' THEN 0.25
              WHEN 'RECEIVED' THEN 0.5
              WHEN 'SORTED' THEN 0.75
              WHEN 'FINAL_DISPOSITION' THEN 1
              ELSE 0
            END
          )
        ) as avg_eco`
      )
    )
    .first();

  const totalScans = Number(totalScansRow?.count ?? 0);
  const totalIntents = Number(intentsRow?.count ?? 0);
  const completions = Number(completionsRow?.count ?? 0);
  const complaintTotalRow = await db("complaints").count<{ count: string }>("* as count").first();
  const totalComplaints = Number(complaintTotalRow?.count ?? 0);
  const completionRate = totalIntents === 0 ? 0 : completions / totalIntents;

  // complaints by status (for charting)
  const statusRows = (await db("complaints")
    .select("status")
    .count<{ count: string }>("id as count")
    .groupBy("status")) as unknown as Array<{ status: string; count: string }>;
  const complaintStatusCounts: { status: string; count: number }[] = statusRows.map((r) => ({
    status: r.status,
    count: Number(r.count)
  }));

  return {
    totals: {
      totalScans,
      totalIntents,
      completions,
      totalComplaints,
      completionRate,
      averageEcoScore: Number(avgEcoRow?.avg_eco ?? 0)
    },
    complaintStatusCounts,
    categoryWiseScans: categoryScans.map((r) => ({
      category: r.category,
      scans: Number(r.count)
    })) as CategoryScan[],
    funnel: funnel.map((r) => ({
      state: r.current_state,
      count: Number(r.count)
    })) as FunnelStage[],
    recyclerPerformance: recyclerPerformance.map((r) => ({
      recycler_id: r.recycler_id,
      received: Number(r.received ?? 0),
      sorted: Number(r.sorted ?? 0),
      finalized: Number(r.finalized ?? 0),
      avg_hours_received_to_final:
        r.avg_hours_received_to_final === null ? null : Number(r.avg_hours_received_to_final)
    })) as RecyclerPerf[]
  };
}

