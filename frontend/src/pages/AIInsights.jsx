import { useState } from "react";
import { getAIInsights } from "../services/api";

const DEFAULT = {
  predicted_sales: 6500,
  promo: 1,
  is_weekend: 1,
  school_holiday: 0,
  state_holiday_encoded: 0,
  competition_distance: 800,
  current_stock: 5000,
};

export default function AIInsights() {
  const [form, setForm] = useState(DEFAULT);
  const [result, setResult] = useState(null);
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
      const data = await getAIInsights(form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "API error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">AI Insights</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: "0.9rem" }}>
        RAG-powered business recommendations based on your store context.
      </p>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Context Input</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {[
                ["predicted_sales", "Predicted Sales"],
                ["competition_distance", "Competition Distance (m)"],
                ["current_stock", "Current Stock"],
              ].map(([name, label]) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  <input type="number" name={name} value={form[name]} onChange={handleChange} />
                </div>
              ))}

              {[
                ["promo", "Promo Active"],
                ["is_weekend", "Is Weekend"],
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
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Insights"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {result && (
            <>
              <div className="card">
                <div className="section-title">💡 AI Recommendations</div>
                {result.insights.map((insight, i) => (
                  <div key={i} className="insight-item">
                    <span>→</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title">📚 Retrieved Knowledge</div>
                {result.retrieved_context.map((ctx, i) => (
                  <div key={i} className="insight-item" style={{ opacity: 0.75 }}>
                    <span>📖</span>
                    <span style={{ fontSize: "0.85rem" }}>{ctx}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
