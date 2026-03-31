import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";
import { getPromoStats } from "../services/api";

export default function PromotionAnalysis() {
  const [data, setData]       = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");

  useEffect(() => {
    getPromoStats()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: "var(--muted)", padding: 40 }}>Loading promotion data from CSV...</div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h1 className="page-title">Promotion Analysis</h1>

      {/* Real lift KPIs from CSV */}
      <div className="kpi-grid">
        <div className="kpi-card success">
          <div className="kpi-label">Promo1 Lift</div>
          <div className="kpi-value">+{data.promo1_lift_pct}%</div>
          <div className="kpi-sub">vs no promotion</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Promo2 Lift</div>
          <div className="kpi-value">+{data.promo2_lift_pct}%</div>
          <div className="kpi-sub">vs no promotion</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Combined Lift</div>
          <div className="kpi-value">+{data.both_lift_pct}%</div>
          <div className="kpi-sub">Promo1 + Promo2</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Promo comparison bar chart */}
        <div className="card">
          <div className="section-title">Avg Sales by Promotion Type</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.promo_comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="avg_sales" fill="#6366f1" radius={[4,4,0,0]} name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Holiday avg sales */}
        <div className="card">
          <div className="section-title">Avg Sales by Holiday Type</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.holiday_avg_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[4,4,0,0]} name="Avg Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Promo vs No-Promo by day of week */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">Promo vs No-Promo Sales by Day of Week</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.promo_by_day}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="promo"    stroke="#6366f1" strokeWidth={2} name="With Promo" />
            <Line type="monotone" dataKey="no_promo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="No Promo" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
