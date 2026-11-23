import HistoryPanel from "./HistoryPanel";
import { useState } from "react";
import axios from "axios";
import NutrientAdvisor from "./NutrientAdvisor";
import CropExplorer from "./CropExplorer";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Droplets,
  FlaskConical,
  Leaf,
  Loader2,
  RotateCcw,
  Sprout,
  Thermometer,
  Wheat,
  Zap,
  CloudRain,
  Info,
  ShieldCheck,
  Beaker,
  CalendarDays,
  Gauge,
} from "lucide-react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const initialForm = {
  soil: "loamy",
  temperature: 25,
  rainfall: 600,
  ph: 6.5,
  water: "medium",
  previous_crop: "wheat",
  fertility: "medium",
  season: "rabi",
};

const reasonNames = {
  soil_mismatch: "Soil type is not suitable",
  temperature_mismatch: "Temperature is outside the suitable range",
  rainfall_mismatch: "Rainfall is outside the required range",
  ph_mismatch: "Soil pH is outside the preferred range",
  fertility_mismatch: "Soil fertility does not meet this crop's requirement",
  season_mismatch: "This crop is not generally grown in the selected season",
};

const cropInfo = {
  wheat: { icon: "🌾", name: "Wheat", type: "Rabi crop" },
  rice: { icon: "🌱", name: "Rice", type: "Kharif crop" },
  maize: { icon: "🌽", name: "Maize", type: "Multiple seasons" },
  cotton: { icon: "☁️", name: "Cotton", type: "Kharif crop" },
  mustard: { icon: "🌼", name: "Mustard", type: "Rabi crop" },
  groundnut: { icon: "🥜", name: "Groundnut", type: "Kharif crop" },
};

function titleCase(value) {
  if (!value) return "—";
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><Icon size={19} /></div>
      <div>
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="section-title">
      <div className="section-title-icon"><Icon size={19} /></div>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function ScoreBar({ score, percentage }) {
  return (
    <div className="score-wrap">
      <div className="score-track">
        <div className="score-fill" style={{ width: `${percentage || 0}%` }} />
      </div>
      <span>{score}/6 · {percentage || 0}%</span>
    </div>
  );
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const analyzeFarm = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/analyze`, {
        ...form,
        temperature: Number(form.temperature),
        rainfall: Number(form.rainfall),
        ph: Number(form.ph),
      });

      setResult(response.data);

      // Automatic history save
      try {
        await axios.post(`${API}/history`, {
          farm_name: "My Farm",
          analysis: response.data
        });
        console.log("Farm analysis saved to history.");
      } catch (historyError) {
        console.error("Analysis succeeded, but history saving failed:", historyError);
      }
      setActiveTab("all");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to connect to the AgriMind reasoning engine. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
    setActiveTab("all");
  };

  const cropAnalysis = result?.crop_analysis || [];
  const filteredCrops = cropAnalysis.filter((crop) => {
    if (activeTab === "suitable") return crop.suitable;
    if (activeTab === "unsuitable") return !crop.suitable;
    return true;
  });

  const bestCrop = result?.best_crop?.crop || result?.best_crop;
  const bestCropInfo = bestCrop ? cropInfo[bestCrop] : null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sprout size={25} /></div>
          <div>
            <h1>AgriMind<span>AI</span></h1>
            <small>INTELLIGENT AGRICULTURE</small>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <a className="side-link active" href="#overview">
          <BarChart3 size={18} /> Overview
        </a>
        <a className="side-link" href="#farm-input">
          <Wheat size={18} /> Farm Analysis
        </a>
        <a className="side-link" href="#crop-results">
          <Leaf size={18} /> Crop Intelligence
        </a>
        <a className="side-link" href="#soil-insights">
          <FlaskConical size={18} /> Soil Insights
        </a>
        <a className="side-link" href="#farm-advice">
          <Droplets size={18} /> Farm Advisory
        </a>

        <div className="sidebar-bottom">
          <div className="engine-status">
            <span className="status-dot" />
            <div>
              <strong>Reasoning Engine</strong>
              <small>SWI-Prolog powered</small>
            </div>
          </div>
          <p>Rule-based agricultural decision support.</p>
          <span className="version">AGRIMIND AI · v1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace <ChevronRight size={13} /> Overview</span>
            <h2>Farm Intelligence Dashboard</h2>
          </div>
          <div className="topbar-right">
            <span className="engine-pill"><span className="status-dot" /> Prolog Engine</span>
            <div className="avatar">A</div>
          </div>
        </header>

        <section className="hero" id="overview">
          <div className="hero-content">
            <div className="hero-tag"><Zap size={14} /> INTELLIGENT CROP DECISION SUPPORT</div>
            <h1>Make smarter decisions.<br /><span>Grow with confidence.</span></h1>
            <p>
              Analyze your farm conditions using a Prolog-powered expert system
              and discover crop matches, soil insights and irrigation guidance.
            </p>
            <a href="#farm-input" className="hero-button">
              Analyze your farm <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-art">
            <div className="hero-circle circle-one" />
            <div className="hero-circle circle-two" />
            <div className="hero-plant"><Sprout size={118} strokeWidth={1.1} /></div>
            <div className="floating-chip chip-one"><Leaf size={15} /> Crop intelligence</div>
            <div className="floating-chip chip-two"><Activity size={15} /> Rule-based AI</div>
          </div>
        </section>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">YOUR AGRICULTURAL WORKSPACE</span>
            <h2>Farm overview</h2>
          </div>
          <span className="date-label"><Activity size={15} /> Live analysis on demand</span>
        </div>

        <section className="metrics-grid">
          <Metric icon={Sprout} label="Crops in knowledge base" value="06" detail="Available crop profiles" />
          <Metric icon={FlaskConical} label="Decision parameters" value="06" detail="Independent rule conditions" />
          <Metric icon={ShieldCheck} label="Reasoning system" value="Prolog" detail="Logical inference engine" />
          <Metric icon={BarChart3} label="Analysis status" value={result ? "Complete" : "Ready"} detail={result ? "Latest analysis available" : "Awaiting farm inputs"} />
        </section>

        <section className="workspace-grid" id="farm-input">
          <div className="panel input-panel">
            <SectionTitle
              eyebrow="FARM CONFIGURATION"
              title="Analyze your farm"
              description="Enter your farm conditions to start the reasoning process."
              icon={Wheat}
            />

            <form onSubmit={analyzeFarm}>
              <div className="form-section-label"><span>01</span> LAND & SOIL CONDITIONS</div>

              <div className="field-grid">
                <label className="field">
                  <span>Soil type</span>
                  <select value={form.soil} onChange={(e) => updateField("soil", e.target.value)}>
                    <option value="loamy">Loamy</option>
                    <option value="clayey">Clayey</option>
                    <option value="sandy">Sandy</option>
                    <option value="black">Black soil</option>
                  </select>
                </label>

                <label className="field">
                  <span>Soil fertility</span>
                  <select value={form.fertility} onChange={(e) => updateField("fertility", e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="field">
                  <span>Soil pH <b>{form.ph}</b></span>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.1"
                    value={form.ph}
                    onChange={(e) => updateField("ph", e.target.value)}
                  />
                  <div className="range-labels"><small>0 · Acidic</small><small>7 · Neutral</small><small>14 · Alkaline</small></div>
                </label>

                <label className="field">
                  <span>Previous crop</span>
                  <select value={form.previous_crop} onChange={(e) => updateField("previous_crop", e.target.value)}>
                    {Object.keys(cropInfo).map((crop) => (
                      <option key={crop} value={crop}>{cropInfo[crop].name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-section-label"><span>02</span> CLIMATE CONDITIONS</div>

              <div className="field-grid">
                <label className="field">
                  <span><Thermometer size={15} /> Temperature (°C)</span>
                  <input type="number" min="0" max="60" value={form.temperature} onChange={(e) => updateField("temperature", e.target.value)} required />
                </label>

                <label className="field">
                  <span><CloudRain size={15} /> Annual rainfall (mm)</span>
                  <input type="number" min="0" max="5000" value={form.rainfall} onChange={(e) => updateField("rainfall", e.target.value)} required />
                </label>

                <label className="field">
                  <span><Droplets size={15} /> Water availability</span>
                  <select value={form.water} onChange={(e) => updateField("water", e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="field">
                  <span><CalendarDays size={15} /> Growing season</span>
                  <select value={form.season} onChange={(e) => updateField("season", e.target.value)}>
                    <option value="rabi">Rabi</option>
                    <option value="kharif">Kharif</option>
                  </select>
                </label>
              </div>

              <div className="form-note">
                <Info size={16} />
                <span>All six parameters are evaluated by the Prolog rule engine. Results are based on the knowledge base, not live field sensors.</span>
              </div>

              {error && <div className="error-message"><AlertTriangle size={17} /> {error}</div>}

              <div className="form-actions">
                <button type="button" className="reset-button" onClick={resetForm}>
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="submit" className="analyze-button" disabled={loading}>
                  {loading ? <><Loader2 className="spin" size={17} /> Analyzing...</> : <>Analyze farm <ArrowRight size={17} /></>}
                </button>
              </div>
            </form>
          </div>

          <aside className="panel logic-panel">
            <div className="logic-icon"><Beaker size={22} /></div>
            <span className="eyebrow">HOW IT WORKS</span>
            <h3>Logic-driven<br />agricultural advice</h3>
            <p>AgriMind evaluates farm inputs against a structured agricultural knowledge base.</p>

            <div className="logic-steps">
              <div><span>01</span><p><strong>Input facts</strong><small>Soil, climate, water and season</small></p></div>
              <div><span>02</span><p><strong>Prolog inference</strong><small>Evaluate facts against logical rules</small></p></div>
              <div><span>03</span><p><strong>Explainable results</strong><small>Scores and rejection reasons</small></p></div>
            </div>

            <div className="logic-footer"><ShieldCheck size={17} /> Explainable rule-based system</div>
          </aside>
        </section>

        {result && (
          <>
            <section className="results-intro" id="crop-results">
              <div>
                <span className="eyebrow">PROLOG REASONING OUTPUT</span>
                <h2>Farm analysis results</h2>
                <p>Your submitted farm conditions have been evaluated against the knowledge base.</p>
              </div>
              <span className="complete-pill"><CheckCircle2 size={15} /> Analysis complete</span>
            </section>

            <section className="result-overview">
              <div className="best-match-card">
                <div className="best-match-top"><span><Zap size={15} /> TOP RULE MATCH</span><span>01 / 06</span></div>
                {bestCrop ? (
                  <>
                    <div className="best-crop-main">
                      <div className="best-crop-emoji">{bestCropInfo?.icon || "🌱"}</div>
                      <div>
                        <small>Highest matching crop</small>
                        <h2>{bestCropInfo?.name || titleCase(bestCrop)}</h2>
                        <span>{bestCropInfo?.type || "Crop profile"}</span>
                      </div>
                    </div>
                    <p>This crop achieved the highest condition score among the crops evaluated. It is a rule-based match, not a guaranteed agronomic recommendation.</p>
                  </>
                ) : (
                  <div className="no-match"><AlertTriangle size={22} /><h3>No matching crop found</h3><p>Review your farm inputs or consult a local agricultural expert.</p></div>
                )}
              </div>

              <div className="result-stats">
                <div className="result-stat">
                  <span>Suitable crops</span>
                  <strong>{result.suitable_crops?.length ?? 0}</strong>
                  <small>All six conditions satisfied</small>
                </div>
                <div className="result-stat">
                  <span>Crops evaluated</span>
                  <strong>{cropAnalysis.length}</strong>
                  <small>Knowledge base profiles</small>
                </div>
                <div className="result-stat">
                  <span>Decision factors</span>
                  <strong>06</strong>
                  <small>Per crop evaluation</small>
                </div>
              </div>
            </section>

            <section className="panel crop-panel">
              <SectionTitle
                eyebrow="CROP RECOMMENDATION ENGINE"
                title="Crop suitability analysis"
                description="Each crop is evaluated against six independent conditions."
                icon={Sprout}
              />

              <div className="factor-chips">
                {["Soil", "Temperature", "Rainfall", "pH", "Fertility", "Season"].map((factor, index) => (
                  <span key={factor}><b>{index + 1}</b>{factor}</span>
                ))}
              </div>

              <div className="tabs">
                <button className={activeTab === "all" ? "selected" : ""} onClick={() => setActiveTab("all")}>All crops <b>{cropAnalysis.length}</b></button>
                <button className={activeTab === "suitable" ? "selected" : ""} onClick={() => setActiveTab("suitable")}>Suitable <b>{cropAnalysis.filter((c) => c.suitable).length}</b></button>
                <button className={activeTab === "unsuitable" ? "selected" : ""} onClick={() => setActiveTab("unsuitable")}>Needs review <b>{cropAnalysis.filter((c) => !c.suitable).length}</b></button>
              </div>

              <div className="crop-list">
                {filteredCrops.map((crop) => {
                  const info = cropInfo[crop.crop] || { icon: "🌱", name: titleCase(crop.crop), type: "Crop" };
                  const percentage = crop.suitability_percentage ?? Math.round((crop.score / 6) * 100);
                  const reasons = crop.rejection_reasons || [];

                  return (
                    <article className="crop-row" key={crop.crop}>
                      <div className="crop-identity">
                        <div className="crop-emoji">{info.icon}</div>
                        <div><strong>{info.name}</strong><small>{info.type}</small></div>
                      </div>
                      <div className="crop-score">
                        <ScoreBar score={crop.score} percentage={percentage} />
                      </div>
                      <div className="crop-status">
                        {crop.suitable
                          ? <span className="status-suitable"><CheckCircle2 size={14} /> Suitable</span>
                          : <span className="status-review"><AlertTriangle size={14} /> Not suitable</span>}
                      </div>
                      <div className="crop-reasons">
                        {reasons.length > 0
                          ? reasons.map((reason) => <span key={reason}>{reasonNames[reason] || titleCase(reason)}</span>)
                          : <span className="reason-good">All six conditions matched</span>}
                      </div>
                    </article>
                  );
                })}
                {filteredCrops.length === 0 && <div className="empty-state">No crops in this category.</div>}
              </div>
              <div className="explanation-note"><Info size={16} /> A crop is marked suitable only when all six Prolog conditions pass. The score shows how many conditions matched.</div>
            </section>

            <NutrientAdvisor />

            <CropExplorer />

            <HistoryPanel />

            <section className="insights-grid" id="soil-insights">
              <div className="panel insight-card">
                <div className="insight-heading"><div className="insight-icon soil"><FlaskConical size={19} /></div><span>SOIL INTELLIGENCE</span></div>
                <h3>Soil analysis</h3>
                <div className="insight-value">{titleCase(form.soil)} soil</div>
                <p>{result.soil_analysis?.advice || "No soil advice available."}</p>
                <div className="insight-divider" />
                <div className="mini-detail"><span>Soil pH</span><strong>{form.ph}</strong></div>
                <div className="mini-detail"><span>pH classification</span><strong>{titleCase(result.ph_analysis?.category)}</strong></div>
              </div>

              <div className="panel insight-card">
                <div className="insight-heading"><div className="insight-icon fertility"><Gauge size={19} /></div><span>FERTILITY INTELLIGENCE</span></div>
                <h3>Fertility analysis</h3>
                <div className="insight-value">{titleCase(result.fertility_analysis?.level || form.fertility)}</div>
                <p>{result.fertility_analysis?.advice || "No fertility advice available."}</p>
                <div className="insight-divider" />
                <div className="mini-detail"><span>Growing season</span><strong>{titleCase(result.season || form.season)}</strong></div>
                <div className="mini-detail"><span>Water availability</span><strong>{titleCase(form.water)}</strong></div>
              </div>
            </section>

            <section className="panel advisory-panel" id="farm-advice">
              <SectionTitle
                eyebrow="FARM MANAGEMENT"
                title="Irrigation & crop rotation"
                description="Additional recommendations generated from Prolog rules."
                icon={Droplets}
              />

              <div className="advisory-grid">
                <div className="advisory-block">
                  <div className="advisory-heading"><Droplets size={19} /><h3>Irrigation guidance</h3></div>
                  {result.irrigation?.length ? result.irrigation.map((item, index) => (
                    <div className="advice-item" key={`${item.crop}-${index}`}>
                      <div className="advice-item-top"><strong>{titleCase(item.crop)}</strong><span className={`level-${item.level}`}>{titleCase(item.level)}</span></div>
                      <p>{item.advice}</p>
                    </div>
                  )) : <p className="muted-text">No irrigation recommendation available.</p>}
                </div>

                <div className="advisory-block rotation-block">
                  <div className="advisory-heading"><RotateCcw size={19} /><h3>Crop rotation planner</h3></div>
                  <div className="rotation-flow">
                    <div><small>PREVIOUS CROP</small><strong>{titleCase(form.previous_crop)}</strong></div>
                    <ArrowRight size={20} />
                    <div><small>RECOMMENDED NEXT CROPS</small>
                      <strong>{result.crop_rotation?.recommended_crops?.length
                        ? result.crop_rotation.recommended_crops.map(titleCase).join(", ")
                        : "No rule found"}</strong>
                    </div>
                  </div>
                  <p className="rotation-description">Rotation suggestions are retrieved from the crop rotation facts in the Prolog knowledge base.</p>
                </div>
              </div>
            </section>

            <section className="input-summary">
              <div><Info size={17} /><strong>Analysis input summary</strong></div>
              <div className="summary-chips">
                <span>Soil: {titleCase(form.soil)}</span>
                <span>Fertility: {titleCase(form.fertility)}</span>
                <span>Temperature: {form.temperature}°C</span>
                <span>Rainfall: {form.rainfall} mm</span>
                <span>pH: {form.ph}</span>
                <span>Water: {titleCase(form.water)}</span>
                <span>Season: {titleCase(form.season)}</span>
              </div>
            </section>
          </>
        )}

        {!result && (
          <section className="empty-dashboard">
            <div className="empty-dashboard-icon"><Sprout size={28} /></div>
            <div>
              <h3>Your farm intelligence report will appear here</h3>
              <p>Configure your farm conditions and select <strong>Analyze farm</strong> to generate crop suitability, soil insights and farm management recommendations.</p>
            </div>
            <ArrowRight size={20} />
          </section>
        )}

        <footer className="footer">
          <div><Sprout size={18} /><strong>AgriMind AI</strong><span>Intelligent agricultural decision support</span></div>
          <p>Knowledge-base recommendations are simplified general rules. Actual crop suitability depends on local variety, soil testing, location, weather and farming practices. Confirm important decisions with local agricultural experts.</p>
          <span className="footer-engine">Powered by SWI-Prolog + FastAPI</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
