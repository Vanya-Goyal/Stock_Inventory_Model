import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { predictSales, getRecommendation } from "../services/api";

const DEFAULT_FORM = {
  day_of_week: 0, month: 6, year: 2024, is_weekend: 0,
  lag_7: 5000, lag_14: 4800, lag_30: 4900,
  rolling_mean_7: 5100, rolling_mean_30: 4950,
  promo: 0, promo2: 0, school_holiday: 0,
  state_holiday_encoded: 0, competition_distance: 1000,
};

export default function Forecast() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [stock, setStock] = useState(4000);
  const [result, setResult] = useState(null);
  const [recommend, setRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const pred = await predictSales(form);
      setResult(pred);
      const rec = await getRecommendation({
        predicted_sales: pred.predicted_sales,
        current_stock: stock,
      });
      setRecommend(rec);
    } catch (err) {
      setError(err.response?.data?.detail || "API error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Build a simple 7-day trend from lag values for the chart
  const chartData = result
    ? [
        { day: "-30d", sales: form.lag_30 },
        { day: "-14d", sales: form.lag_14 },
        { day: "-7d",  sales: form.lag_7  },
        { day: "Today", sales: result.predicted_sales },
      ]
    : [];

  const urgencyClass = { HIGH: "danger", MEDIUM: "warning", LOW: "success" };

  return (
    <div>
      <h1 className="page-title">Sales Forecast</h1>

      <div className="grid-2">
        {/* Input Form */}
        <div className="card">
          <div className="section-title">Input Features</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {[
                ["day_of_week", "Day of Week (0=Mon)", 0, 6],
                ["month", "Month", 1, 12],
                ["year", "Year", 2013, 2030],
                ["lag_7", "Sales 7 Days Ago", 0, 99999],
                ["lag_14", "Sales 14 Days Ago", 0, 99999],
                ["lag_30", "Sales 30 Days Ago", 0, 99999],
                ["rolling_mean_7", "Rolling Mean 7d", 0, 99999],
                ["rolling_mean_30", "Rolling Mean 30d", 0, 99999],
                ["competition_distance", "Competition Distance (m)", 0, 99999],
              ].map(([name, label, min, max]) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  <input
                    type="number" name={name} min={min} max={max}
                    value={form[name]} onChange={handleChange}
                  />
                </div>
              ))}

              {/* Toggle fields */}
              {[
                ["is_weekend", "Is Weekend"],
                ["promo", "Promo Active"],
                ["promo2", "Promo2 Active"],
                ["school_holiday", "School Holiday"],
              ].map(([name, label]) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  <select name={name} value={form[name]} onChange={handleChange}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              ))}

              <div className="form-group">
                <label>State Holiday</label>
                <select name="state_holiday_encoded" value={form.state_holiday_encoded} onChange={handleChange}>
                  <option value={0}>None</option>
                  <option value={1}>Public Holiday</option>
                  <option value={2}>Easter</option>
                  <option value={3}>Christmas</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Stock</label>
                <input type="number" min={0} value={stock}
                  onChange={(e) => setStock(parseFloat(e.target.value))} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Predicting..." : "Predict Demand"}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {result && (
            <div className="card">
              <div className="section-title">Prediction Result</div>
              <div className="kpi-value" style={{ fontSize: "2.5rem", color: "var(--accent)" }}>
                {result.predicted_sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="kpi-sub">Predicted Sales Units</div>
            </div>
          )}

          {recommend && (
            <div className="card">
              <div className="section-title">Stock Recommendation</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span className={`badge badge-${urgencyClass[recommend.urgency]}`}>
                  {recommend.action}
                </span>
                <span className={`badge badge-${urgencyClass[recommend.urgency]}`}>
                  {recommend.urgency} URGENCY
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 8 }}>
                {recommend.message}
              </p>
              {recommend.suggested_order_qty > 0 && (
                <p style={{ fontSize: "0.9rem" }}>
                  Suggested Order: <strong>{recommend.suggested_order_qty.toLocaleString()}</strong> units
                </p>
              )}
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card">
              <div className="section-title">Sales Trend</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
