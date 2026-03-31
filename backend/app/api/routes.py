"""
API Route Handlers
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PredictRequest, PredictResponse,
    RecommendRequest, RecommendResponse,
    InsightRequest, InsightResponse,
    DashboardResponse, StoreStatsResponse,
    PromoStatsResponse, AlertItem,
)
from app.services.train_model import predict
from app.services.recommendation import recommend_action
from app.services.rag_service import generate_insights
from app.services.analytics import (
    get_dashboard_stats, get_store_stats,
    get_promo_stats, get_alerts,
)

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
def predict_sales(request: PredictRequest):
    """Predict sales demand from input features."""
    try:
        features = request.model_dump()
        predicted = predict(features)
        return PredictResponse(predicted_sales=predicted)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Model not trained yet. Run: python -m app.services.train_model"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend", response_model=RecommendResponse)
def get_recommendation(request: RecommendRequest):
    """Generate inventory recommendation based on predicted demand vs current stock."""
    result = recommend_action(request.predicted_sales, request.current_stock)
    return RecommendResponse(**result)


@router.post("/ai-insights", response_model=InsightResponse)
def get_ai_insights(request: InsightRequest):
    """RAG-powered business insights based on input context."""
    features = request.model_dump()
    result = generate_insights(features, request.predicted_sales)
    return InsightResponse(**result)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard_stats():
    """Real aggregated KPIs and trends from train.csv."""
    try:
        return get_dashboard_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/store-stats", response_model=StoreStatsResponse)
def store_stats():
    """Real per-store sales stats from train.csv."""
    try:
        return get_store_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/promo-stats", response_model=PromoStatsResponse)
def promo_stats():
    """Real promotion impact analysis from train.csv."""
    try:
        return get_promo_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=list[AlertItem])
def alerts():
    """Real low-stock and anomaly alerts derived from train.csv."""
    try:
        return get_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
