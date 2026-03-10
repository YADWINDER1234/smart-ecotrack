export type Role = "ADMIN" | "CONSUMER" | "RECYCLER" | "MANUFACTURER";

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
