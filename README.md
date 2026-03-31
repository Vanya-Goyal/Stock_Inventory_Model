# Demand Forecasting System — Rossmann Store Sales

End-to-end demand forecasting using Multiple Linear Regression, FastAPI, and React.

## Project Structure

```
Stock_Inventory_Model/
├── data/                        # Raw and processed datasets
├── models/                      # Saved ML model artifacts
├── notebooks/                   # Jupyter notebooks for EDA
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI route handlers
│   │   ├── models/              # Pydantic schemas
│   │   ├── services/            # Business logic (ML, RAG)
│   │   └── utils/               # Helpers
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Dashboard, Forecast, etc.
│   │   ├── services/            # API calls
│   │   └── utils/
│   └── package.json
└── README.md
```

## Quick Start

### 1. Download Dataset
Download from Kaggle: https://www.kaggle.com/c/rossmann-store-sales/data
Place `train.csv` and `store.csv` in the `data/` folder.

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.services.train_model      # Train and save model
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start                               # Runs on http://localhost:3000
```


Complete Project Explanation for Interview
1. What is this project?
"I built an end-to-end Demand Forecasting System using the real Rossmann Store Sales dataset from Kaggle — which contains sales data from 1,115 German retail stores over 2.5 years, totalling over 1 million rows. The system predicts future sales demand and gives intelligent inventory recommendations through a full-stack web application."

2. Tech Stack — Why each choice?
"I used:

Python + Pandas/NumPy for data processing — industry standard for data science
Multiple Linear Regression (scikit-learn) — as required by the syllabus, and it's interpretable — you can read every coefficient
FastAPI for the backend — it's faster than Flask, has automatic API documentation, and uses Pydantic for data validation
React for the frontend — component-based, fast, and works well with chart libraries
Recharts for visualization — lightweight and integrates natively with React
JSON to save the model — instead of binary joblib files, so the model weights are human-readable in VS Code"

3. Data Pipeline — Phase 1
"The raw data has two CSV files — train.csv with sales records and store.csv with store metadata. I merge them on the Store ID.
Then I clean the data in preprocessing.py:
Remove rows where the store was closed — those have zero sales and add no signal
Fill missing CompetitionDistance with the median — because some stores have no nearby competitor recorded
Cap outliers using the 1st and 99th percentile — so extreme values don't skew the model
Normalize the StateHoliday column — it had mixed integer and string zeros"

4. Feature Engineering — Phase 1 continued
"In feature_engineering.py I create 14 features across 4 categories:
Time features: day_of_week, month, year, is_weekend — because sales patterns are strongly seasonal
Lag features: lag_7, lag_14, lag_30 — these are the actual sales from 7, 14, and 30 days ago for that same store. They capture recent sales momentum
Rolling mean features: rolling_mean_7 and rolling_mean_30 — the average sales over the past 7 and 30 days. These smooth out noise
Business features: promo, promo2, school_holiday, state_holiday, competition_distance — these are the external factors that directly affect demand
The most important thing here is that lag and rolling features are computed per store — so Store 1's lag_7 is Store 1's sales from 7 days ago, not some global average."

5. Machine Learning Model — Phase 2
"I use Multiple Linear Regression in train_model.py.
The training pipeline is:
Load and clean data
Engineer all 14 features
Split 80/20 — without shuffling, because this is time-series data. Shuffling would cause data leakage — the model would see future data during training
Apply StandardScaler — Linear Regression is sensitive to feature scale. lag_7 values are in thousands while is_weekend is 0 or 1, so scaling puts them on the same level
Fit the model and evaluate
My model achieves MAE of 1,038, RMSE of 1,424, and MAPE of 16.48% on the test set.
The model is saved as a readable JSON file with all coefficients. For example, the promo coefficient is +1,069 — meaning an active promotion adds about 1,069 units to the predicted sales. rolling_mean_30 has the highest coefficient at +2,918 — meaning the 30-day sales trend is the strongest predictor."

6. FastAPI Backend — Phase 3
"The backend in main.py exposes 7 endpoints:

GET / — health check
POST /predict — takes the 14 features as JSON, loads the model from JSON, applies the scaler manually, and returns predicted sales
POST /recommend — compares predicted sales vs current stock and returns RESTOCK, REDUCE, or MAINTAIN with urgency level and suggested order quantity
POST /ai-insights — the RAG endpoint
GET /dashboard — returns real KPIs computed from the CSV
GET /store-stats — top 10 and bottom 10 stores by sales
GET /promo-stats — promotion impact analysis
GET /alerts — real low-stock alerts
I use Pydantic schemas for request validation — so if someone sends a wrong data type, FastAPI automatically returns a 422 error with a clear message."

7. RAG System — Phase 4
"The RAG system in rag_service.py is a lightweight Retrieval-Augmented Generation pipeline — no external LLM needed.
It has a knowledge base of 10 business facts — things like 'promotions increase sales by 15-30%' or 'weekend demand is higher'.
When you call /ai-insights, it:
Converts your input features into a natural language query — for example if promo=1 and is_weekend=1, the query becomes 'promotion active weekend shopping'
Uses TF-IDF vectorization and cosine similarity to find the top 3 most relevant knowledge base entries
Generates rule-based insights grounded in that retrieved context
This is the same concept used in enterprise AI systems — retrieve relevant context, then generate a response based on it. In a production system, you'd replace the rule-based generator with an OpenAI or AWS Bedrock call."
8. React Frontend — Phase 5
"The frontend has 6 pages, all pulling real data from the API:
Dashboard — shows avg daily sales (6,955 units), promo lift (+38.8%), 1,115 stores monitored, and real weekly/monthly trend charts from the CSV
Forecast — the main interactive page. You fill in the 14 features, hit Predict, and it calls the ML model in real time. It also shows the stock recommendation and a trend chart
Store Analysis — top 10 and bottom 10 stores by performance, promo vs normal sales comparison, and sales by store type — all from real data
Promotion Analysis — real promo lift percentages, promo vs no-promo by day of week, holiday impact analysis
Alerts — real alerts generated by comparing each store's last 7-day average against its historical average. Stores that dropped more than 40% are critical, 20-40% are warnings
AI Insights — calls the RAG endpoint and displays retrieved knowledge and generated recommendations"

9. End-to-End Flow
"The complete flow is:

User fills form on Forecast page
    → React sends POST /predict to FastAPI
    → FastAPI validates input with Pydantic
    → Loads linear_regression.json and scaler.json
    → Applies StandardScaler manually
    → Computes: prediction = intercept + sum(coef × scaled_feature)
    → Returns predicted sales
    → React also calls POST /recommend with predicted sales + current stock
    → Displays result, recommendation, and trend chart
```"

---

## 10. Key Design Decisions (impressive to mention)

- *"I saved the model as JSON instead of joblib so it's transparent and readable — any developer can open it and understand exactly what the model learned"*
- *"I used `lru_cache` on the dataframe loader so the CSV is only read once at startup — not on every API request"*
- *"I kept temporal order in the train/test split — this is critical for time-series data to avoid data leakage"*
- *"The lag and rolling features are computed per store, not globally — this makes them much more meaningful"*
- *"CORS is configured to only allow requests from localhost:3000 — basic security practice"*

---

## 11. If asked about model accuracy

*"MAPE of 16.48% means on average the prediction is off by about 16%. For a linear model on retail sales data with high variance, this is reasonable. The model could be improved by using Random Forest or XGBoost, adding more features like weather or local events, or using a proper time-series model like ARIMA or Prophet — but the requirement was Multiple Linear Regression."*

---

**Both servers are running:**
- Backend API: `http://localhost:8001`
- Frontend UI: `http://localhost:3000`
- API Docs: `http://localhost:8001/docs` (FastAPI auto-generates this — great to show in interview)



