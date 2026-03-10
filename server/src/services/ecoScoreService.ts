import type { WorkflowState } from "../repos/qrRepo";

export type EcoComponents = {
  R: number;
  M: number;
  H: number;
  L: number;
  T: number;
};

export type EcoWeights = {
  wr: number;
  wm: number;
  wh: number;
  wl: number;
  wt: number;
};

export type EligibilityLabel =
  | "RECYCLABLE"
  | "HAZARD-AWARE RECYCLABLE"
  | "MANUAL REVIEW REQUIRED"
  | "NOT RECOMMENDED";

export type EcoScoreResult = {
  ecoScore: number;
  components: EcoComponents;
  weights: EcoWeights;
  label: EligibilityLabel;
  explanation: string;
};

const weights: EcoWeights = {
  wr: 0.25,
  wm: 0.25,
  wh: 0.2,
  wl: 0.15,
  wt: 0.15
};

function clamp01(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function traceabilityFromState(state: WorkflowState): number {
  switch (state) {
    case "SCAN":
      return 0;
    case "INTENT_SUBMITTED":
      return 0.25;
    case "RECEIVED":
      return 0.5;
    case "SORTED":
      return 0.75;
    case "FINAL_DISPOSITION":
      return 1;
    default:
      return 0;
  }
}

export function computeEcoScore(input: {
  metadata: any;
  currentState: WorkflowState;
}): EcoScoreResult {
  const md = input.metadata ?? {};

  const R = clamp01(Number(md.repairability ?? md.repairabilityScore ?? 0));
  const M = clamp01(Number(md.materialRecoverability ?? md.material_recoverability ?? 0));
  const H = clamp01(Number(md.hazardSafety ?? md.hazard_safety ?? 0));
  const L = clamp01(Number(md.localFacilityCompat ?? md.local_facility_compat ?? 0));
  const T = traceabilityFromState(input.currentState);

  const ecoScore =
    weights.wr * R +
    weights.wm * M +
    weights.wh * H +
    weights.wl * L +
    weights.wt * T;

  const Se = clamp01(ecoScore);

  let label: EligibilityLabel;
  if (Se >= 0.75 && H >= 0.7) label = "RECYCLABLE";
  else if (Se >= 0.6 && H >= 0.4) label = "HAZARD-AWARE RECYCLABLE";
  else if (Se >= 0.4) label = "MANUAL REVIEW REQUIRED";
  else label = "NOT RECOMMENDED";

  const explanation = `Eco-score ${Se.toFixed(
    2
  )} derived from repairability (R=${R.toFixed(2)}), material recoverability (M=${M.toFixed(
    2
  )}), hazard safety (H=${H.toFixed(2)}), local facility compatibility (L=${L.toFixed(
    2
  )}), and traceability completeness (T=${T.toFixed(2)}) at workflow stage ${input.currentState}.`;

  return {
    ecoScore: Se,
    components: { R, M, H, L, T },
    weights,
    label,
    explanation
  };
}

