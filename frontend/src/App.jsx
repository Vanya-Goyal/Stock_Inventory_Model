import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import StoreAnalysis from "./pages/StoreAnalysis";
import PromotionAnalysis from "./pages/PromotionAnalysis";
import Alerts from "./pages/Alerts";
import AIInsights from "./pages/AIInsights";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/stores"   element={<StoreAnalysis />} />
            <Route path="/promos"   element={<PromotionAnalysis />} />
            <Route path="/alerts"   element={<Alerts />} />
            <Route path="/insights" element={<AIInsights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
