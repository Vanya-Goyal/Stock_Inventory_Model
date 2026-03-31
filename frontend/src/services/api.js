import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8001" });

export const predictSales     = (features) => api.post("/predict", features).then((r) => r.data);
export const getRecommendation = (data)    => api.post("/recommend", data).then((r) => r.data);
export const getAIInsights     = (data)    => api.post("/ai-insights", data).then((r) => r.data);
export const healthCheck       = ()        => api.get("/").then((r) => r.data);
export const getDashboard      = ()        => api.get("/dashboard").then((r) => r.data);
export const getStoreStats     = ()        => api.get("/store-stats").then((r) => r.data);
export const getPromoStats     = ()        => api.get("/promo-stats").then((r) => r.data);
export const getAlerts         = ()        => api.get("/alerts").then((r) => r.data);
