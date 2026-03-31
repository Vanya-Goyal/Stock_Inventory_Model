import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getDashboard, healthCheck } from "../services/api";

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [apiStatus, setStatus] = useState("checking...");
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");

  useEffect(() => {
    healthCheck()
      .then(() => setStatus("🟢 Connected"))
      .catch(() => setStatus("🔴 Offline"));

    getDashboard()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: "var(--muted)", padding: 40 }}>Loading real data from CSV...</div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>API: {apiStatus}</span>
      </div>

      {/* KPI Cards — all from CSV */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Avg Daily Sales</div>
          <div className="kpi-value">{data.avg_sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="kpi-sub">units / day (all stores)</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Promo Sales Lift</div>
          <div className="kpi-value">+{data.promo_lift_pct}%</div>
          <div className="kpi-sub">vs non-promo days</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Stores Monitored</div>
          <div className="kpi-value">{data.total_stores.toLocaleString()}</div>
          <div className="kpi-sub">Rossmann dataset</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{data.low_stock_alert_count}</div>
          <div className="kpi-sub">Sales dropped &gt;20% recently</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Weekly trend from CSV */}
        <div className="card">
          <div className="section-title">Avg Sales by Day of Week</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.weekly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="avg_sales" fill="#6366f1" radius={[4,4,0,0]} name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend from CSV */}
        <div className="card">
          <div className="section-title">Avg Sales by Month</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="avg_sales" stroke="#22d3ee" strokeWidth={2} dot={false} name="Avg Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
