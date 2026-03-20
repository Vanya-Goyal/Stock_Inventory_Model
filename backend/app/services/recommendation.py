"""
Recommendation Service
Generates inventory action recommendations based on predicted demand vs current stock.
"""


def recommend_action(predicted_sales: float, current_stock: float) -> dict:
    """
    Compare predicted demand against current stock and recommend an action.

    Thresholds:
        stock_ratio < 0.8  → RESTOCK (stock covers < 80% of predicted demand)
        stock_ratio > 1.5  → REDUCE  (stock is 50% more than predicted demand)
        else               → MAINTAIN
    """
    if predicted_sales <= 0:
        return {
            "action": "MAINTAIN",
            "urgency": "LOW",
            "message": "No demand predicted. Hold current stock.",
            "suggested_order_qty": 0.0,
        }

    stock_ratio = current_stock / predicted_sales

    if stock_ratio < 0.5:
        action, urgency = "RESTOCK", "HIGH"
        order_qty = round(predicted_sales * 1.2 - current_stock, 2)
        message = f"Critical stock shortage! Only {stock_ratio:.0%} of demand covered. Order immediately."
    elif stock_ratio < 0.8:
        action, urgency = "RESTOCK", "MEDIUM"
        order_qty = round(predicted_sales - current_stock, 2)
        message = f"Stock below demand threshold ({stock_ratio:.0%} covered). Plan a restock soon."
    elif stock_ratio > 1.5:
        action, urgency = "REDUCE", "LOW"
        order_qty = 0.0
        message = f"Overstocked ({stock_ratio:.0%} of demand). Consider promotions to clear excess inventory."
    else:
        action, urgency = "MAINTAIN", "LOW"
        order_qty = 0.0
        message = f"Stock levels healthy ({stock_ratio:.0%} of demand covered). No action needed."

    return {
        "action": action,
        "urgency": urgency,
        "message": message,
        "suggested_order_qty": max(0.0, order_qty),
    }
