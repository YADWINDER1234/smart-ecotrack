export type LifecycleState =
  | "CREATED"
  | "ACTIVE"
  | "SCAN"
  | "INTENT_SUBMITTED"
  | "PICKUP_SCHEDULED"
  | "RECEIVED"
  | "SORTED"
  | "FINAL_DISPOSITION"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED";

const allowedTransitions: Record<string, string[]> = {
  CREATED: ["ACTIVE", "REVOKED"],
  ACTIVE: ["SCAN", "REVOKED"],
  SCAN: ["INTENT_SUBMITTED", "REVOKED"],
  INTENT_SUBMITTED: ["PICKUP_SCHEDULED", "RECEIVED", "REJECTED", "REVOKED"],
  PICKUP_SCHEDULED: ["RECEIVED", "REJECTED", "REVOKED"],
  RECEIVED: ["SORTED", "REJECTED", "REVOKED"],
  SORTED: ["FINAL_DISPOSITION", "REJECTED", "REVOKED"],
  FINAL_DISPOSITION: [],
  REJECTED: [],
  REVOKED: [],
  EXPIRED: []
};

export function validateStateTransition(current: LifecycleState, next: LifecycleState): boolean {
  if (current === next) return true;
  const allowed = allowedTransitions[current] ?? [];
  return allowed.includes(next);
}

export const ALL_STATES: LifecycleState[] = Object.keys(allowedTransitions) as LifecycleState[];
