"""
Analytics Service
Loads and pre-computes all aggregations from train.csv + store.csv at startup.
All dashboard, store, promo, and alert data comes from here — no hardcoding.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache

DATA_DIR = Path(__file__).resolve().parents[3] / "data"


@lru_cache(maxsize=1)
def get_dataframe() -> pd.DataFrame:
    """Load, merge, and cache the full cleaned dataframe once."""
    train = pd.read_csv(DATA_DIR / "train.csv", low_memory=False, parse_dates=["Date"])
    store = pd.read_csv(DATA_DIR / "store.csv")
    df = train.merge(store, on="Store", how="left")
    df = df[df["Open"] == 1].copy()
    df = df[df["Sales"] > 0].copy()
    df["StateHoliday"] = df["StateHoliday"].astype(str).replace("0", "none")
    df["CompetitionDistance"] = df["CompetitionDistance"].fillna(df["CompetitionDistance"].median())
    df["month"] = df["Date"].dt.month
    df["year"] = df["Date"].dt.year
    df["week"] = df["Date"].dt.isocalendar().week.astype(int)
    return df


# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard_stats() -> dict:
    df = get_dataframe()

    avg_sales = round(float(df["Sales"].mean()), 2)
    total_stores = int(df["Store"].nunique())

    # Weekly trend: avg sales by day of week
    day_map = {1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun"}
    weekly = (
        df.groupby("DayOfWeek")["Sales"].mean().round(0)
        .rename(index=day_map).reset_index()
    )
    weekly.columns = ["day", "avg_sales"]

    # Monthly trend
    monthly = (
        df.groupby("month")["Sales"].mean().round(0).reset_index()
    )
    monthly.columns = ["month", "avg_sales"]
    month_names = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",
                   7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"}
    monthly["month"] = monthly["month"].map(month_names)

    # Promo lift
    promo_avg = round(float(df[df["Promo"] == 1]["Sales"].mean()), 2)
    no_promo_avg = round(float(df[df["Promo"] == 0]["Sales"].mean()), 2)
    promo_lift = round((promo_avg - no_promo_avg) / no_promo_avg * 100, 1)

    # Low stock alerts: stores whose last 7-day avg is >20% below their overall avg
    store_overall = df.groupby("Store")["Sales"].mean()
    last_date = df["Date"].max()
    recent = df[df["Date"] >= last_date - pd.Timedelta(days=7)]
    store_recent = recent.groupby("Store")["Sales"].mean()
    low_stock = store_overall[
        (store_overall - store_recent) / store_overall > 0.20
    ].index.tolist()

    return {
        "avg_sales": avg_sales,
        "total_stores": total_stores,
        "promo_lift_pct": promo_lift,
        "low_stock_alert_count": len(low_stock),
        "weekly_trend": weekly.to_dict(orient="records"),
        "monthly_trend": monthly.to_dict(orient="records"),
    }


# ── Store Analysis ────────────────────────────────────────────────────────────

def get_store_stats() -> dict:
    df = get_dataframe()

    by_store = df.groupby("Store").agg(
        avg_sales=("Sales", "mean"),
        promo_sales=("Sales", lambda x: x[df.loc[x.index, "Promo"] == 1].mean()),
        normal_sales=("Sales", lambda x: x[df.loc[x.index, "Promo"] == 0].mean()),
        total_customers=("Customers", "sum"),
    ).round(0).reset_index()

    by_store = by_store.fillna(0)

    top10 = by_store.nlargest(10, "avg_sales")[
        ["Store", "avg_sales", "promo_sales", "normal_sales"]
    ].to_dict(orient="records")

    bottom10 = by_store.nsmallest(10, "avg_sales")[
        ["Store", "avg_sales", "promo_sales", "normal_sales"]
    ].to_dict(orient="records")

    by_type = (
        df.groupby("StoreType")["Sales"].mean().round(0).reset_index()
    )
    by_type.columns = ["store_type", "avg_sales"]

    return {
        "top_stores": top10,
        "bottom_stores": bottom10,
        "by_store_type": by_type.to_dict(orient="records"),
        "total_stores": int(df["Store"].nunique()),
        "best_store": int(by_store.loc[by_store["avg_sales"].idxmax(), "Store"]),
        "worst_store": int(by_store.loc[by_store["avg_sales"].idxmin(), "Store"]),
    }


# ── Promotion Analysis ────────────────────────────────────────────────────────

def get_promo_stats() -> dict:
    df = get_dataframe()

    no_promo = round(float(df[df["Promo"] == 0]["Sales"].mean()), 0)
    promo1   = round(float(df[df["Promo"] == 1]["Sales"].mean()), 0)
    promo2   = round(float(df[df["Promo2"] == 1]["Sales"].mean()), 0)
    both     = round(float(df[(df["Promo"] == 1) & (df["Promo2"] == 1)]["Sales"].mean()), 0)

    promo_by_day = (
        df.groupby(["DayOfWeek", "Promo"])["Sales"].mean().round(0)
        .unstack(fill_value=0).reset_index()
    )
    promo_by_day.columns = ["day_of_week", "no_promo", "promo"]
    day_map = {1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat",7:"Sun"}
    promo_by_day["day"] = promo_by_day["day_of_week"].map(day_map)

    holiday_dist = {
        "Regular Day":    round(float(df[(df["StateHoliday"]=="none") & (df["SchoolHoliday"]==0)]["Sales"].mean()), 0),
        "School Holiday": round(float(df[df["SchoolHoliday"]==1]["Sales"].mean()), 0),
        "Public Holiday": round(float(df[df["StateHoliday"]=="a"]["Sales"].mean()), 0),
        "Christmas":      round(float(df[df["StateHoliday"]=="c"]["Sales"].mean()), 0),
    }

    return {
        "promo_comparison": [
            {"name": "No Promo", "avg_sales": no_promo},
            {"name": "Promo1",   "avg_sales": promo1},
            {"name": "Promo2",   "avg_sales": promo2},
            {"name": "Both",     "avg_sales": both},
        ],
        "promo_by_day": promo_by_day[["day","no_promo","promo"]].to_dict(orient="records"),
        "holiday_avg_sales": [{"name": k, "value": v} for k, v in holiday_dist.items()],
        "promo1_lift_pct": round((promo1 - no_promo) / no_promo * 100, 1),
        "promo2_lift_pct": round((promo2 - no_promo) / no_promo * 100, 1),
        "both_lift_pct":   round((both   - no_promo) / no_promo * 100, 1),
    }


# ── Alerts ────────────────────────────────────────────────────────────────────

def get_alerts() -> list:
    df = get_dataframe()

    store_overall = df.groupby("Store")["Sales"].mean()
    last_date = df["Date"].max()
    recent_df = df[df["Date"] >= last_date - pd.Timedelta(days=7)]
    store_recent = recent_df.groupby("Store")["Sales"].mean()

    alerts = []
    for store_id in store_overall.index:
        if store_id not in store_recent.index:
            continue
        overall = store_overall[store_id]
        recent  = store_recent[store_id]
        drop_pct = (overall - recent) / overall * 100

        if drop_pct > 40:
            alerts.append({
                "store": f"Store {store_id}",
                "type": "LOW_STOCK",
                "message": f"Sales dropped {drop_pct:.0f}% vs historical avg. Critical restock needed.",
                "severity": "danger",
                "recent_avg": round(float(recent), 0),
                "historical_avg": round(float(overall), 0),
            })
        elif drop_pct > 20:
            alerts.append({
                "store": f"Store {store_id}",
                "type": "LOW_STOCK",
                "message": f"Sales dropped {drop_pct:.0f}% vs historical avg. Plan a restock.",
                "severity": "warning",
                "recent_avg": round(float(recent), 0),
                "historical_avg": round(float(overall), 0),
            })
        elif drop_pct < -30:
            alerts.append({
                "store": f"Store {store_id}",
                "type": "ANOMALY",
                "message": f"Sales spiked {abs(drop_pct):.0f}% above historical avg. Possible anomaly.",
                "severity": "warning",
                "recent_avg": round(float(recent), 0),
                "historical_avg": round(float(overall), 0),
            })

    # Sort: danger first, then warning
    severity_order = {"danger": 0, "warning": 1}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 2))
    return alerts[:20]  # cap at 20
