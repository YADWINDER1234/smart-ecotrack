import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ComplaintStatusChart({
  data
}: {
  data: { status: string; count: number }[];
}) {
  // ensure consistent order
  const order = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
  const normalized = order.map((s) => ({
    status: s,
    count: data.find((d) => d.status === s)?.count ?? 0
  }));

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={normalized}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="rgba(255, 99, 71, 0.8)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
