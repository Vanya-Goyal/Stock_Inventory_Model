"""
API Route Handlers
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PredictRequest, PredictResponse,
    RecommendRequest, RecommendResponse,
    InsightRequest, InsightResponse,
)
from app.services.train_model import predict
from app.services.recommendation import recommend_action
from app.services.rag_service import generate_insights

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
