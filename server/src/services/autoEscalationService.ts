import { db } from "../db/connection";

/**
 * Auto-escalate pending complaints that have been open for too long
 * Escalation rules:
 * - OPEN for 3+ days with LOW priority → escalate to MEDIUM
 * - OPEN for 5+ days with MEDIUM priority → escalate to HIGH
 * - OPEN for 7+ days → force to IN_REVIEW (auto-assign if needed)
 */
export async function autoEscalatePendingComplaints() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const escalationLog: any[] = [];

  // Rule 1: LOW priority complaints open 3+ days → MEDIUM
  const lowPriorityOld = await db("complaints")
    .where({ status: "OPEN", priority: "LOW" })
    .where("created_at", "<", threeDaysAgo);
  
  if (lowPriorityOld.length > 0) {
    await db("complaints")
      .whereIn("id", lowPriorityOld.map((c: any) => c.id))
      .update({ priority: "MEDIUM", updated_at: now });
    
    escalationLog.push({
      count: lowPriorityOld.length,
      rule: "LOW→MEDIUM after 3 days",
      ids: lowPriorityOld.map((c: any) => c.id)
    });
  }

  // Rule 2: MEDIUM priority complaints open 5+ days → HIGH
  const mediumPriorityOld = await db("complaints")
    .where({ status: "OPEN", priority: "MEDIUM" })
    .where("created_at", "<", fiveDaysAgo);
  
  if (mediumPriorityOld.length > 0) {
    await db("complaints")
      .whereIn("id", mediumPriorityOld.map((c: any) => c.id))
      .update({ priority: "HIGH", updated_at: now });
    
    escalationLog.push({
      count: mediumPriorityOld.length,
      rule: "MEDIUM→HIGH after 5 days",
      ids: mediumPriorityOld.map((c: any) => c.id)
    });
  }

  // Rule 3: Any OPEN complaint 7+ days → force IN_REVIEW
  const veryOld = await db("complaints")
    .where({ status: "OPEN" })
    .where("created_at", "<", sevenDaysAgo);
  
  if (veryOld.length > 0) {
    // Get a list of recyclers to distribute assignments
    const recyclers = await db("users").where({ role: "RECYCLER" });
    
    if (recyclers.length > 0) {
      for (const complaint of veryOld) {
        const recycler = recyclers[Math.floor(Math.random() * recyclers.length)];
        await db("complaints")
          .where({ id: complaint.id })
          .update({
            status: "IN_REVIEW",
            assigned_to: recycler.id,
            updated_at: now
          });
      }
      
      escalationLog.push({
        count: veryOld.length,
        rule: "OPEN→IN_REVIEW after 7 days (auto-assigned)",
        ids: veryOld.map((c: any) => c.id)
      });
    }
  }

  return { escalated: escalationLog, timestamp: now };
}

/**
 * Get pending/overdue complaint metrics for admin
 */
export async function getPendingMetrics() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    openCount,
    highPriorityCount,
    overdueSevenDays,
    overdueThreeDays
  ] = await Promise.all([
    db("complaints").where({ status: "OPEN" }).count("* as cnt").first(),
    db("complaints").where({ status: "OPEN", priority: "HIGH" }).count("* as cnt").first(),
    db("complaints").where({ status: "OPEN" }).where("created_at", "<", sevenDaysAgo).count("* as cnt").first(),
    db("complaints").where({ status: "OPEN" }).where("created_at", "<", threeDaysAgo).count("* as cnt").first()
  ]);

  return {
    openComplaints: openCount?.cnt || 0,
    highPriority: highPriorityCount?.cnt || 0,
    overdueBySevenDays: overdueSevenDays?.cnt || 0,
    overdueByThreeDays: overdueThreeDays?.cnt || 0
  };
}
