const ALERTS = [
  { id: 1, store: "Store 42",  type: "LOW_STOCK",  message: "Stock at 35% of predicted demand. Restock urgently.", severity: "danger",  time: "2 min ago" },
  { id: 2, store: "Store 117", type: "LOW_STOCK",  message: "Stock at 62% of predicted demand. Plan restock.", severity: "warning", time: "15 min ago" },
  { id: 3, store: "Store 8",   type: "ANOMALY",    message: "Sales 3.2σ above forecast — possible data error or flash sale.", severity: "warning", time: "1 hr ago" },
  { id: 4, store: "Store 201", type: "OVERSTOCK",  message: "Stock at 210% of demand. Consider markdown promotions.", severity: "info",    time: "3 hr ago" },
  { id: 5, store: "Store 55",  type: "LOW_STOCK",  message: "Stock at 28% of predicted demand. Critical shortage.", severity: "danger",  time: "5 hr ago" },
  { id: 6, store: "Store 330", type: "ANOMALY",    message: "Sales dropped 45% vs 7-day average. Investigate.", severity: "danger",  time: "6 hr ago" },
];

const severityLabel = { danger: "CRITICAL", warning: "WARNING", info: "INFO" };
const typeIcon = { LOW_STOCK: "📦", ANOMALY: "⚠️", OVERSTOCK: "🏪" };

export default function Alerts() {
  const critical = ALERTS.filter((a) => a.severity === "danger").length;
  const warnings = ALERTS.filter((a) => a.severity === "warning").length;

  return (
    <div>
      <h1 className="page-title">Alerts</h1>

      <div className="kpi-grid">
        <div className="kpi-card danger">
          <div className="kpi-label">Critical Alerts</div>
          <div className="kpi-value">{critical}</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Warnings</div>
          <div className="kpi-value">{warnings}</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Healthy Stores</div>
          <div className="kpi-value">1,097</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Active Alerts</div>
        {ALERTS.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.severity}`}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span>{typeIcon[alert.type]}</span>
                <strong>{alert.store}</strong>
                <span className={`badge badge-${alert.severity}`}>{severityLabel[alert.severity]}</span>
                <span className={`badge badge-info`}>{alert.type.replace("_", " ")}</span>
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{alert.message}</div>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", whiteSpace: "nowrap", marginLeft: 16 }}>
              {alert.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
