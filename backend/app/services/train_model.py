"""
Model Training Service
Trains a Multiple Linear Regression model on engineered features,
evaluates it, and saves the model + scaler to disk.

Run:
    python -m app.services.train_model
"""

import joblib
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

MODEL_PATH = MODELS_DIR / "linear_regression.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"


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

    # Persist
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"Model saved -> {MODEL_PATH}")
    print(f"Scaler saved -> {SCALER_PATH}")

    return metrics


# ── Prediction Helper ─────────────────────────────────────────────────────────

def load_model():
    """Load saved model and scaler from disk."""
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    return model, scaler


def predict(features: dict) -> float:
    """
    Predict sales demand from a feature dictionary.

    Args:
        features: dict with keys matching FEATURE_COLUMNS

    Returns:
        Predicted sales as a float (clipped to >= 0)
    """
    model, scaler = load_model()
    row = np.array([[features[col] for col in FEATURE_COLUMNS]])
    row_scaled = scaler.transform(row)
    prediction = model.predict(row_scaled)[0]
    return max(0.0, float(prediction))


if __name__ == "__main__":
    train()
