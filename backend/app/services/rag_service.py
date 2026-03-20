"""
RAG (Retrieval-Augmented Generation) Service
Uses a small in-memory knowledge base + cosine similarity to retrieve
relevant business facts, then generates human-readable insights.

No external LLM required — uses rule-based generation on top of retrieved context.
Swap generate_insight() with an OpenAI/Bedrock call for a real LLM upgrade.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Knowledge Base ────────────────────────────────────────────────────────────

KNOWLEDGE_BASE = [
    "Sales increase significantly during promotional periods. Running Promo1 can boost daily sales by 15-30%.",
    "Weekend demand is higher for most retail stores. Saturday typically peaks; Sunday is slightly lower.",
    "School holidays increase family shopping traffic, especially for food and household items.",
    "Public holidays and Christmas drive the highest single-day sales spikes of the year.",
    "High competition distance (far competitors) correlates with higher store sales.",
    "Stores near competitors (low competition distance) tend to have lower average sales.",
    "Promo2 (continuous promotion) has a moderate positive effect on long-term customer retention.",
    "Easter holidays show a gradual sales build-up in the week before the holiday.",
    "January typically shows a post-holiday sales dip; plan inventory reductions accordingly.",
    "Stores with assortment type 'c' (extra) tend to have higher average sales than type 'a' or 'b'.",
]

# Pre-compute TF-IDF vectors for the knowledge base
_vectorizer = TfidfVectorizer()
_kb_vectors = _vectorizer.fit_transform(KNOWLEDGE_BASE)


# ── Retrieval ─────────────────────────────────────────────────────────────────

def retrieve(query: str, top_k: int = 3) -> list[str]:
    """Return top-k most relevant knowledge base entries for a query."""
    query_vec = _vectorizer.transform([query])
    scores = cosine_similarity(query_vec, _kb_vectors).flatten()
    top_indices = scores.argsort()[::-1][:top_k]
    return [KNOWLEDGE_BASE[i] for i in top_indices]


# ── Query Builder ─────────────────────────────────────────────────────────────

def build_query(features: dict) -> str:
    """Convert input features into a natural language query for retrieval."""
    parts = []
    if features.get("promo"):
        parts.append("promotion active")
    if features.get("is_weekend"):
        parts.append("weekend shopping")
    if features.get("school_holiday"):
        parts.append("school holiday traffic")
    if features.get("state_holiday_encoded", 0) > 0:
        parts.append("public holiday sales spike")
    if features.get("competition_distance", 999) < 500:
        parts.append("high competition nearby")
    if not parts:
        parts.append("regular weekday sales forecast")
    return " ".join(parts)


# ── Insight Generator ─────────────────────────────────────────────────────────

def generate_insights(features: dict, predicted_sales: float) -> dict:
    """
    Retrieve relevant context and generate actionable insights.

    Returns:
        {
            "insights": [list of insight strings],
            "retrieved_context": [list of retrieved KB entries]
        }
    """
    query = build_query(features)
    context = retrieve(query, top_k=3)

    insights = [f"Predicted sales for this period: {predicted_sales:,.0f} units."]

    # Rule-based insight generation grounded in retrieved context
    if features.get("promo"):
        insights.append("Promotion is active — expect 15-30% higher footfall. Ensure adequate stock.")
    if features.get("is_weekend"):
        insights.append("Weekend traffic expected. Consider extended hours and extra staff.")
    if features.get("school_holiday"):
        insights.append("School holiday in effect — family purchases likely to increase.")
    if features.get("state_holiday_encoded", 0) > 0:
        insights.append("State holiday detected — prepare for peak demand and potential supply delays.")
    if features.get("competition_distance", 999) < 300:
        insights.append("Close competitor detected. Focus on promotions and loyalty programs to retain customers.")

    if predicted_sales > 8000:
        insights.append("High demand forecast — prioritize restocking fast-moving SKUs.")
    elif predicted_sales < 3000:
        insights.append("Low demand forecast — consider targeted promotions to drive traffic.")

    return {"insights": insights, "retrieved_context": context}
