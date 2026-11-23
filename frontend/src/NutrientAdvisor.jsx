import { useState } from "react";
import axios from "axios";
import {
  FlaskConical,
  Leaf,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const nutrients = [
  { key: "nitrogen", label: "Nitrogen", symbol: "N", description: "Supports vegetative growth and leaf development" },
  { key: "phosphorus", label: "Phosphorus", symbol: "P", description: "Supports root development and energy transfer" },
  { key: "potassium", label: "Potassium", symbol: "K", description: "Supports water regulation and crop resilience" }
];

const crops = [
  "wheat", "rice", "maize", "cotton", "mustard", "groundnut"
];

const titleCase = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";

export default function NutrientAdvisor() {
  const [crop, setCrop] = useState("wheat");
  const [levels, setLevels] = useState({
    nitrogen: "medium",
    phosphorus: "medium",
    potassium: "medium"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateLevel = (key, value) => {
    setLevels((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const analyzeNutrients = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(`${API}/nutrients`, {
        crop,
        ...levels
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to generate nutrient advisory. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel nutrient-panel" id="nutrient-advisory">
      <div className="section-title">
        <div className="section-title-icon">
          <FlaskConical size={19} />
        </div>
        <div>
          <span>NPK INTELLIGENCE</span>
          <h2>Nutrient & fertilizer advisory</h2>
          <p>Use soil-test nutrient categories to generate crop-specific guidance.</p>
        </div>
      </div>

      <form onSubmit={analyzeNutrients}>
        <label className="nutrient-crop-field">
          <span><Leaf size={15} /> Select crop</span>
          <select value={crop} onChange={(e) => setCrop(e.target.value)}>
            {crops.map((item) => (
              <option key={item} value={item}>{titleCase(item)}</option>
            ))}
          </select>
        </label>

        <div className="nutrient-input-grid">
          {nutrients.map((item) => (
            <div className="nutrient-input-card" key={item.key}>
              <div className="nutrient-symbol">{item.symbol}</div>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <label>
                Soil-test level
                <select
                  value={levels[item.key]}
                  onChange={(e) => updateLevel(item.key, e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="nutrient-note">
          <Info size={16} />
          <span>Choose Low, Medium or High according to your soil-test report. Do not guess nutrient levels if a test is available.</span>
        </div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <button className="analyze-button nutrient-submit" type="submit" disabled={loading}>
          {loading
            ? <><Loader2 className="spin" size={16} /> Evaluating nutrients...</>
            : <><Zap size={16} /> Generate NPK advisory</>}
        </button>
      </form>

      {result && (
        <div className="nutrient-results">
          <div className="nutrient-result-header">
            <div>
              <span className="eyebrow">PROLOG NUTRIENT REPORT</span>
              <h3>{titleCase(result.crop)} nutrient profile</h3>
            </div>
            <span className="complete-pill">
              <CheckCircle2 size={14} /> Evaluated
            </span>
          </div>

          <div className="nutrient-summary">
            {result.attention_required.length > 0
              ? <AlertTriangle size={18} />
              : <CheckCircle2 size={18} />}
            <p>{result.summary}</p>
          </div>

          <div className="nutrient-result-grid">
            {result.nutrient_analysis.map((item) => (
              <article className="nutrient-result-card" key={item.nutrient}>
                <div className="nutrient-result-top">
                  <strong>{item.nutrient.toUpperCase()}</strong>
                  <span className={item.needs_attention ? "nutrient-low" : "nutrient-ok"}>
                    {titleCase(item.soil_status)}
                  </span>
                </div>
                <div className="nutrient-demand">
                  <span>Relative crop demand</span>
                  <strong>{titleCase(item.crop_demand)}</strong>
                </div>
                <p>{item.advice}</p>
              </article>
            ))}
          </div>

          <div className="nutrient-disclaimer">
            <Info size={16} />
            <span>{result.disclaimer}</span>
          </div>
        </div>
      )}
    </section>
  );
}
