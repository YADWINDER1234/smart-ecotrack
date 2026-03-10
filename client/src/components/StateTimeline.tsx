import type { LifecycleState } from "../types";

export function StateTimeline({ states, current }: { states: LifecycleState[]; current: LifecycleState }) {
  return (
    <div className="state-timeline">
      {states.map((s) => (
        <div key={s} className={`state-item ${s === current ? "state-current" : ""}`}>
          <div className="state-dot" />
          <div className="state-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

export default StateTimeline;
