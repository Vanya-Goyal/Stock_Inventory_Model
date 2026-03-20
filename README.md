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

## API Endpoints
| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| GET    | /              | Health check             |
| POST   | /predict       | Predict sales demand     |
| POST   | /recommend     | Get stock recommendation |
| POST   | /ai-insights   | RAG-based insights       |
