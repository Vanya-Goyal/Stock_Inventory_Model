import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getStoreStats } from "../services/api";

export default function StoreAnalysis() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [view, setView]       = useState("top"); // "top" | "bottom"

  useEffect(() => {
    getStoreStats()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: "var(--muted)", padding: 40 }}>Loading store data from CSV...</div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const chartData = (view === "top" ? data.top_stores : data.bottom_stores).map((s) => ({
    store: `S${s.Store}`,
    promo_sales:  s.promo_sales,
    normal_sales: s.normal_sales,
    avg_sales:    s.avg_sales,
  }));

  return (
    <div>
      <h1 className="page-title">Store Analysis</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Stores</div>
          <div className="kpi-value">{data.total_stores.toLocaleString()}</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Best Performing</div>
          <div className="kpi-value">Store {data.best_store}</div>
          <div className="kpi-sub">Highest avg daily sales</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Needs Attention</div>
          <div className="kpi-value">Store {data.worst_store}</div>
          <div className="kpi-sub">Lowest avg daily sales</div>
        </div>
      </div>

      {/* Store Type breakdown */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Avg Sales by Store Type</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.by_store_type}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="store_type" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="avg_sales" fill="#22d3ee" radius={[4,4,0,0]} name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top / Bottom toggle */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>
              {view === "top" ? "Top 10 Stores" : "Bottom 10 Stores"} — Promo vs Normal
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${view === "top" ? "btn-primary" : ""}`}
                style={{ padding: "6px 14px", background: view === "top" ? "var(--accent)" : "var(--surface2)", color: "var(--text)" }}
                onClick={() => setView("top")}>Top 10</button>
              <button className={`btn`}
                style={{ padding: "6px 14px", background: view === "bottom" ? "var(--accent)" : "var(--surface2)", color: "var(--text)" }}
                onClick={() => setView("bottom")}>Bottom 10</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="store" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="promo_sales"  fill="#6366f1" name="Promo Sales"  radius={[4,4,0,0]} />
              <Bar dataKey="normal_sales" fill="#22d3ee" name="Normal Sales" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
