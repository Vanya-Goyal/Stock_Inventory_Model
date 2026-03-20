import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// Static sample data — replace with real API data when available
const STORE_DATA = [
  { store: "S1",  avg_sales: 7200, promo_sales: 9100, normal_sales: 5800 },
  { store: "S2",  avg_sales: 5400, promo_sales: 7200, normal_sales: 4100 },
  { store: "S3",  avg_sales: 8100, promo_sales: 10200, normal_sales: 6500 },
  { store: "S4",  avg_sales: 4200, promo_sales: 5800, normal_sales: 3400 },
  { store: "S5",  avg_sales: 6700, promo_sales: 8400, normal_sales: 5500 },
  { store: "S6",  avg_sales: 9300, promo_sales: 11500, normal_sales: 7800 },
];

export default function StoreAnalysis() {
  return (
    <div>
      <h1 className="page-title">Store Analysis</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Stores</div>
          <div className="kpi-value">1,115</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Best Performing</div>
          <div className="kpi-value">Store 6</div>
          <div className="kpi-sub">Avg 9,300 units/day</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Needs Attention</div>
          <div className="kpi-value">Store 4</div>
          <div className="kpi-sub">Avg 4,200 units/day</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Sales Comparison — Promo vs Normal</div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={STORE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="store" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="promo_sales"  fill="#6366f1" name="Promo Sales"  radius={[4,4,0,0]} />
            <Bar dataKey="normal_sales" fill="#22d3ee" name="Normal Sales" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
