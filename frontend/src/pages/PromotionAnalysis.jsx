import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const PROMO_IMPACT = [
  { name: "No Promo",  avg_sales: 4800 },
  { name: "Promo1",   avg_sales: 6900 },
  { name: "Promo2",   avg_sales: 5600 },
  { name: "Both",     avg_sales: 8200 },
];

const HOLIDAY_DATA = [
  { name: "Regular Day",    value: 58 },
  { name: "School Holiday", value: 18 },
  { name: "Public Holiday", value: 14 },
  { name: "Christmas",      value: 10 },
];

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#22c55e"];

export default function PromotionAnalysis() {
  return (
    <div>
      <h1 className="page-title">Promotion Analysis</h1>

      <div className="kpi-grid">
        <div className="kpi-card success">
          <div className="kpi-label">Promo1 Lift</div>
          <div className="kpi-value">+43.8%</div>
          <div className="kpi-sub">vs no promotion</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Promo2 Lift</div>
          <div className="kpi-value">+16.7%</div>
          <div className="kpi-sub">vs no promotion</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Combined Lift</div>
          <div className="kpi-value">+70.8%</div>
          <div className="kpi-sub">Promo1 + Promo2</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Avg Sales by Promotion Type</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={PROMO_IMPACT}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="avg_sales" fill="#6366f1" radius={[4,4,0,0]} name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Sales Day Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={HOLIDAY_DATA} cx="50%" cy="50%" outerRadius={100}
                dataKey="value" label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {HOLIDAY_DATA.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
