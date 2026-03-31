import { useState, useEffect } from "react";
import { getAlerts } from "../services/api";

const severityLabel = { danger: "CRITICAL", warning: "WARNING", info: "INFO" };
const typeIcon      = { LOW_STOCK: "📦", ANOMALY: "⚠️", OVERSTOCK: "🏪" };

export default function Alerts() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");

  useEffect(() => {
    getAlerts()
      .then((d) => { setAlerts(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: "var(--muted)", padding: 40 }}>Analysing store data for alerts...</div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const critical = alerts.filter((a) => a.severity === "danger").length;
  const warnings = alerts.filter((a) => a.severity === "warning").length;
  const healthy  = 1115 - critical - warnings;

  return (
    <div>
      <h1 className="page-title">Alerts</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 20 }}>
        Derived from real sales data — stores where recent 7-day avg dropped &gt;20% vs historical average.
      </p>

      <div className="kpi-grid">
        <div className="kpi-card danger">
          <div className="kpi-label">Critical Alerts</div>
          <div className="kpi-value">{critical}</div>
          <div className="kpi-sub">Sales dropped &gt;40%</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Warnings</div>
          <div className="kpi-value">{warnings}</div>
          <div className="kpi-sub">Sales dropped 20–40%</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Healthy Stores</div>
          <div className="kpi-value">{healthy > 0 ? healthy.toLocaleString() : "—"}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Active Alerts ({alerts.length})</div>

        {alerts.length === 0 && (
          <div className="alert alert-success">No alerts — all stores are performing normally.</div>
        )}

        {alerts.map((alert, i) => (
          <div key={i} className={`alert alert-${alert.severity}`}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span>{typeIcon[alert.type] || "🔔"}</span>
                <strong>{alert.store}</strong>
                <span className={`badge badge-${alert.severity}`}>{severityLabel[alert.severity]}</span>
                <span className="badge badge-info">{alert.type.replace("_", " ")}</span>
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 4 }}>
                {alert.message}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Recent avg: <strong style={{ color: "var(--text)" }}>{alert.recent_avg.toLocaleString()}</strong>
                &nbsp;|&nbsp;
                Historical avg: <strong style={{ color: "var(--text)" }}>{alert.historical_avg.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
