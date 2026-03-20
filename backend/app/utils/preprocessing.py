"""
Data Preprocessing Module
Handles loading, cleaning, and merging of Rossmann train.csv + store.csv
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[3] / "data"


def load_data(train_path: str = None, store_path: str = None) -> pd.DataFrame:
    """Load and merge train + store datasets."""
    train_path = train_path or DATA_DIR / "train.csv"
    store_path = store_path or DATA_DIR / "store.csv"

    train = pd.read_csv(train_path, low_memory=False, parse_dates=["Date"])
    store = pd.read_csv(store_path)

    df = train.merge(store, on="Store", how="left")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw dataframe:
    - Remove closed-store rows (Sales=0 when Open=0 is expected, not useful)
    - Fill missing values with sensible defaults
    - Cap outliers using IQR
    """
    # Drop rows where store is closed (no sales signal)
    df = df[df["Open"] == 1].copy()
    df = df[df["Sales"] > 0].copy()

    # --- Missing value imputation ---
    df["CompetitionDistance"] = df["CompetitionDistance"].fillna(df["CompetitionDistance"].median())
    df["CompetitionOpenSinceMonth"] = df["CompetitionOpenSinceMonth"].fillna(0)
    df["CompetitionOpenSinceYear"] = df["CompetitionOpenSinceYear"].fillna(0)
    df["Promo2SinceWeek"] = df["Promo2SinceWeek"].fillna(0)
    df["Promo2SinceYear"] = df["Promo2SinceYear"].fillna(0)
    df["PromoInterval"] = df["PromoInterval"].fillna("None")

    # StateHoliday: normalize '0' (int) vs '0' (str) inconsistency
    df["StateHoliday"] = df["StateHoliday"].astype(str).replace("0", "none")

    # --- Outlier capping on Sales using IQR ---
    Q1 = df["Sales"].quantile(0.01)
    Q3 = df["Sales"].quantile(0.99)
    df["Sales"] = df["Sales"].clip(lower=Q1, upper=Q3)

    df.reset_index(drop=True, inplace=True)
    return df


def validate_data(df: pd.DataFrame) -> None:
    """Basic assertions to catch data quality issues early."""
    assert df["Sales"].isna().sum() == 0, "NaN found in Sales"
    assert (df["Sales"] <= 0).sum() == 0, "Non-positive Sales found"
    assert df["Date"].dtype == "datetime64[ns]", "Date column not parsed"
    print(f"[validate_data] OK — {len(df):,} rows, {df['Store'].nunique()} stores")
