import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { healthCheck } from "../services/api";

// Sample trend data for the dashboard chart (replace with real API data)
const TREND_DATA = [
  { day: "Mon", sales: 5200, forecast: 5100 },
  { day: "Tue", sales: 4800, forecast: 4900 },
  { day: "Wed", sales: 5600, forecast: 5500 },
  { day: "Thu", sales: 6100, forecast: 5900 },
  { day: "Fri", sales: 7200, forecast: 7000 },
  { day: "Sat", sales: 8400, forecast: 8100 },
  { day: "Sun", sales: 7800, forecast: 7600 },
];

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState("checking...");

  useEffect(() => {
    healthCheck()
      .then(() => setApiStatus("🟢 Connected"))
      .catch(() => setApiStatus("🔴 Offline"));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>API: {apiStatus}</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Avg Predicted Sales</div>
          <div className="kpi-value">6,443</div>
          <div className="kpi-sub">units / day</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Forecast Accuracy</div>
          <div className="kpi-value">91.4%</div>
          <div className="kpi-sub">MAPE: 8.6%</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Stores Monitored</div>
          <div className="kpi-value">1,115</div>
          <div className="kpi-sub">Rossmann dataset</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">12</div>
          <div className="kpi-sub">Requires attention</div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card">
        <div className="section-title">Weekly Sales vs Forecast</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales"    stroke="#6366f1" strokeWidth={2} dot={false} name="Actual Sales" />
              <Line type="monotone" dataKey="forecast" stroke="#22d3ee" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
