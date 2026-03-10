import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

const COLORS = ["#2effb0", "#68bcff", "#b7ff68", "#ffd768", "#ff8dd6", "#a78bfa"];

export function CategoryPieChart({ data }: { data: { category: string; scans: number }[] }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="scans" nameKey="category" innerRadius={55} outerRadius={90}>
            {data.map((_entry, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

