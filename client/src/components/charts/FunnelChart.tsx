import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FunnelChart({
  data
}: {
  data: { state: string; count: number }[];
}) {
  const ordered = ["SCAN", "INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
  const normalized = ordered.map((s) => ({
    state: s,
    count: data.find((d) => d.state === s)?.count ?? 0
  }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={normalized}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="state" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="rgba(46, 255, 176, 0.8)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

