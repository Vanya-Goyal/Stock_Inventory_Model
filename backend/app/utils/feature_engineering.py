"""
Feature Engineering Module
Builds all model features from the cleaned dataframe.

Features created:
  Time     : day_of_week, month, year, is_weekend
  Lag      : lag_7, lag_14, lag_30
  Rolling  : rolling_mean_7, rolling_mean_30
  Business : promo, promo2, school_holiday, state_holiday, competition_distance
"""

import pandas as pd
import numpy as np

# Columns the model will actually train on
FEATURE_COLUMNS = [
    "day_of_week", "month", "year", "is_weekend",
    "lag_7", "lag_14", "lag_30",
    "rolling_mean_7", "rolling_mean_30",
    "promo", "promo2", "school_holiday", "state_holiday_encoded",
    "competition_distance",
]

TARGET_COLUMN = "Sales"


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract calendar features from the Date column."""
    df["day_of_week"] = df["Date"].dt.dayofweek          # 0=Mon … 6=Sun
    df["month"] = df["Date"].dt.month
    df["year"] = df["Date"].dt.year
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    return df


def add_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create lag features per store (sorted by date).
    Lags capture recent sales history as a predictor.
    """
    df = df.sort_values(["Store", "Date"]).copy()

    for lag in [7, 14, 30]:
        df[f"lag_{lag}"] = (
            df.groupby("Store")["Sales"]
            .shift(lag)
        )
    return df


def add_rolling_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Rolling mean features per store.
    Captures short-term and medium-term sales trends.
    """
    df = df.sort_values(["Store", "Date"]).copy()

    for window in [7, 30]:
        df[f"rolling_mean_{window}"] = (
            df.groupby("Store")["Sales"]
            .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
        )
    return df


def add_business_features(df: pd.DataFrame) -> pd.DataFrame:
    """Encode business/promotional features."""
    df["promo"] = df["Promo"].astype(int)
    df["promo2"] = df["Promo2"].astype(int)
    df["school_holiday"] = df["SchoolHoliday"].astype(int)

    # Encode StateHoliday: none=0, public=1, easter=2, christmas=3
    holiday_map = {"none": 0, "a": 1, "b": 2, "c": 3}
    df["state_holiday_encoded"] = (
        df["StateHoliday"].str.lower().map(holiday_map).fillna(0).astype(int)
    )

    df["competition_distance"] = df["CompetitionDistance"].fillna(
        df["CompetitionDistance"].median()
    )
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full feature engineering pipeline.
    Returns dataframe with all features + target column.
    Drops rows with NaN lags (first N rows per store).
    """
    df = add_time_features(df)
    df = add_lag_features(df)
    df = add_rolling_features(df)
    df = add_business_features(df)

    # Drop rows where lag features are NaN (start of each store's history)
    df = df.dropna(subset=["lag_7", "lag_14", "lag_30"]).reset_index(drop=True)

    print(f"[engineer_features] {len(df):,} rows after feature engineering")
    return df


def get_feature_matrix(df: pd.DataFrame):
    """Return X (features) and y (target) as numpy arrays."""
    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values
    return X, y
