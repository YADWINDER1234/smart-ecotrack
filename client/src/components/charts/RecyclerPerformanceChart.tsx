import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function RecyclerPerformanceChart({
  data
}: {
  data: {
    recycler_id: string;
    received: number;
    sorted: number;
    finalized: number;
    avg_hours_received_to_final: number | null;
  }[];
}) {
  const short = data.map((r) => ({
    ...r,
    recycler: r.recycler_id.slice(0, 8)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h4 style={{ marginTop: 0 }}>Throughput</h4>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={short}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="recycler" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="received" fill="rgba(104, 188, 255, 0.75)" />
              <Bar dataKey="sorted" fill="rgba(183, 255, 104, 0.75)" />
              <Bar dataKey="finalized" fill="rgba(46, 255, 176, 0.75)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h4 style={{ marginTop: 0 }}>Avg hours (received → final)</h4>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={short}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="recycler" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avg_hours_received_to_final"
                stroke="rgba(255, 215, 104, 0.9)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

