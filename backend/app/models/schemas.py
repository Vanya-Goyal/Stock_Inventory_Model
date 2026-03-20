"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    # Time features
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2013, le=2030)
    is_weekend: int = Field(..., ge=0, le=1)

    # Lag features
    lag_7: float = Field(..., description="Sales 7 days ago")
    lag_14: float = Field(..., description="Sales 14 days ago")
    lag_30: float = Field(..., description="Sales 30 days ago")

    # Rolling features
    rolling_mean_7: float
    rolling_mean_30: float

    # Business features
    promo: int = Field(..., ge=0, le=1)
    promo2: int = Field(..., ge=0, le=1)
    school_holiday: int = Field(..., ge=0, le=1)
    state_holiday_encoded: int = Field(..., ge=0, le=3)
    competition_distance: float = Field(..., ge=0)


class PredictResponse(BaseModel):
    predicted_sales: float
    store_id: Optional[int] = None


class RecommendRequest(BaseModel):
    predicted_sales: float
    current_stock: float
    store_id: Optional[int] = None


class RecommendResponse(BaseModel):
    action: str                  # "RESTOCK" | "REDUCE" | "MAINTAIN"
    urgency: str                 # "HIGH" | "MEDIUM" | "LOW"
    message: str
    suggested_order_qty: float


class InsightRequest(BaseModel):
    predicted_sales: float
    promo: int
    is_weekend: int
    school_holiday: int
    state_holiday_encoded: int
    competition_distance: float
    current_stock: Optional[float] = None


class InsightResponse(BaseModel):
    insights: list[str]
    retrieved_context: list[str]
