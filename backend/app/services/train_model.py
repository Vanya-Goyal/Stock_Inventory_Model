"""
Model Training Service
Trains a Multiple Linear Regression model on engineered features,
evaluates it, and saves the model + scaler to disk.

Run:
    python -m app.services.train_model
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.utils.preprocessing import load_data, clean_data, validate_data
from app.utils.feature_engineering import engineer_features, get_feature_matrix, FEATURE_COLUMNS

MODELS_DIR = Path(__file__).resolve().parents[3] / "models"
MODELS_DIR.mkdir(exist_ok=True)

MODEL_PATH  = MODELS_DIR / "linear_regression.json"
SCALER_PATH = MODELS_DIR / "scaler.json"


# ── Metrics ──────────────────────────────────────────────────────────────────

def mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Percentage Error (avoids division by zero)."""
    mask = y_true != 0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def evaluate(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape_val = mape(y_true, y_pred)
    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "MAPE": round(mape_val, 2)}


# ── Training Pipeline ─────────────────────────────────────────────────────────

def train():
    print("Loading data...")
    df = load_data()
    df = clean_data(df)
    validate_data(df)

    print("Engineering features...")
    df = engineer_features(df)

    X, y = get_feature_matrix(df)

    # Train / test split — keep temporal order (no shuffle)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    # Scale features (important for linear regression convergence)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Training Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    metrics = evaluate(y_test, y_pred)
    print(f"[Evaluation] {metrics}")

    # Persist as human-readable JSON
    model_data = {
        "intercept": float(model.intercept_),
        "coefficients": dict(zip(FEATURE_COLUMNS, model.coef_.tolist())),
        "feature_order": FEATURE_COLUMNS,
        "metrics": metrics,
    }
    scaler_data = {
        "mean": dict(zip(FEATURE_COLUMNS, scaler.mean_.tolist())),
        "scale": dict(zip(FEATURE_COLUMNS, scaler.scale_.tolist())),
        "feature_order": FEATURE_COLUMNS,
    }
    MODEL_PATH.write_text(json.dumps(model_data, indent=2))
    SCALER_PATH.write_text(json.dumps(scaler_data, indent=2))
    print(f"Model saved -> {MODEL_PATH}")
    print(f"Scaler saved -> {SCALER_PATH}")

    return metrics


# ── Prediction Helper ─────────────────────────────────────────────────────────

def load_model() -> tuple[dict, dict]:
    """Load model and scaler from JSON files."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    model_data  = json.loads(MODEL_PATH.read_text())
    scaler_data = json.loads(SCALER_PATH.read_text())
    return model_data, scaler_data


def predict(features: dict) -> float:
    """
    Predict sales demand from a feature dictionary.
    Manually applies StandardScaler then Linear Regression using JSON weights.
    """
    model_data, scaler_data = load_model()

    # Scale: z = (x - mean) / scale
    scaled = [
        (features[col] - scaler_data["mean"][col]) / scaler_data["scale"][col]
        for col in FEATURE_COLUMNS
    ]

    # Predict: y = intercept + sum(coef * scaled_feature)
    prediction = model_data["intercept"] + sum(
        model_data["coefficients"][col] * val
        for col, val in zip(FEATURE_COLUMNS, scaled)
    )
    return max(0.0, float(prediction))


if __name__ == "__main__":
    train()
