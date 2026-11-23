import { useEffect, useState } from "react";
import axios from "axios";
import {
  Sprout,
  Droplets,
  Clock,
  Leaf,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  BookOpen
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function CropExplorer() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [profile, setProfile] = useState(null);
  const [previousCrop, setPreviousCrop] = useState("groundnut");
  const [nextCrop, setNextCrop] = useState("wheat");
  const [rotation, setRotation] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingRotation, setLoadingRotation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/crop-profiles`)
      .then((response) => {
        setCrops(response.data.crops || []);
      })
      .catch(() => {
        setError("Could not load crop list. Please check backend connection during final testing.");
      });
  }, []);

  const loadProfile = async (crop) => {
    setSelectedCrop(crop);
    setProfile(null);
    setLoadingProfile(true);
    setError("");

    try {
      const response = await axios.get(`${API}/crop-profile/${crop}`);
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load crop profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (crops.length > 0 && !profile && !loadingProfile) {
      loadProfile(selectedCrop);
    }
  }, [crops]);

  const getRotationAdvice = async () => {
    setLoadingRotation(true);
    setRotation(null);
    setError("");

    try {
      const response = await axios.get(
        `${API}/rotation-advice/${previousCrop}/${nextCrop}`
      );
      setRotation(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to generate rotation advice.");
    } finally {
      setLoadingRotation(false);
    }
  };

  return (
    <section className="crop-explorer" id="crop-explorer">
      <div className="crop-explorer-heading">
        <div>
          <span className="crop-eyebrow">PROLOG KNOWLEDGE BASE</span>
          <h2><BookOpen size={23} /> Crop Knowledge Explorer</h2>
          <p>Explore crop characteristics and understand crop rotation decisions.</p>
        </div>
        <span className="crop-engine-tag"><Sprout size={15} /> SWI-Prolog</span>
      </div>

      {error && <div className="crop-error">{error}</div>}

      <div className="crop-profile-panel">
        <div className="crop-section-title">
          <Leaf size={19} />
          <h3>Explore Crop Profile</h3>
        </div>

        <label className="crop-field-label" htmlFor="crop-profile-select">
          Select a crop
        </label>
        <select
          id="crop-profile-select"
          value={selectedCrop}
          onChange={(e) => loadProfile(e.target.value)}
          disabled={crops.length === 0 || loadingProfile}
        >
          {crops.map((crop) => (
            <option key={crop} value={crop}>
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </option>
          ))}
        </select>

        {loadingProfile && <p className="crop-loading">Loading crop profile...</p>}

        {profile && (
          <div className="crop-profile-content">
            <div className="crop-profile-title">
              <div className="crop-avatar"><Sprout size={25} /></div>
              <div>
                <h3>{profile.crop.charAt(0).toUpperCase() + profile.crop.slice(1)}</h3>
                <span>{profile.family} family</span>
              </div>
            </div>

            <div className="crop-data-grid">
              <div className="crop-data-card">
                <Clock size={19} />
                <span>Crop duration</span>
                <strong>{profile.duration_days.minimum}–{profile.duration_days.maximum} days</strong>
              </div>
              <div className="crop-data-card">
                <Droplets size={19} />
                <span>Water requirement</span>
                <strong>{profile.water_requirement}</strong>
              </div>
            </div>

            <div className="crop-info-block">
              <h4><BookOpen size={16} /> Agricultural use</h4>
              <p>{profile.agricultural_use}</p>
            </div>

            <div className="crop-info-block">
              <h4><Leaf size={16} /> Agricultural benefits</h4>
              <p>{profile.benefits}</p>
            </div>

            <div className="crop-info-block crop-caution-block">
              <h4><AlertTriangle size={16} /> Management caution</h4>
              <p>{profile.cautions}</p>
            </div>
          </div>
        )}
      </div>

      <div className="crop-rotation-panel">
        <div className="crop-section-title">
          <ArrowRightLeft size={19} />
          <h3>Crop Rotation Advisor</h3>
        </div>
        <p className="crop-rotation-description">
          Select the previous crop and the proposed next crop to receive a rule-based explanation.
        </p>

        <div className="rotation-select-grid">
          <div>
            <label className="crop-field-label" htmlFor="previous-crop">
              Previous crop
            </label>
            <select
              id="previous-crop"
              value={previousCrop}
              onChange={(e) => setPreviousCrop(e.target.value)}
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="crop-field-label" htmlFor="next-crop">
              Next crop
            </label>
            <select
              id="next-crop"
              value={nextCrop}
              onChange={(e) => setNextCrop(e.target.value)}
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="crop-rotation-button"
          onClick={getRotationAdvice}
          disabled={crops.length === 0 || loadingRotation}
        >
          {loadingRotation ? <RefreshCw size={17} className="crop-spin" /> : <ArrowRightLeft size={17} />}
          {loadingRotation ? "Generating advice..." : "Analyze Crop Rotation"}
        </button>

        {rotation && (
          <div className="rotation-result">
            <div className="rotation-result-heading">
              <span>{rotation.previous_crop} <ArrowRightLeft size={16} /> {rotation.next_crop}</span>
              <strong className={rotation.compatible ? "rotation-positive" : "rotation-warning"}>
                {rotation.compatible ? "Different crops" : "Same crop"}
              </strong>
            </div>
            {rotation.explanations.length > 0 ? (
              <ul>
                {rotation.explanations.map((explanation, index) => (
                  <li key={index}>{explanation}</li>
                ))}
              </ul>
            ) : (
              <p>No specific rotation rule was found for this combination.</p>
            )}
            <small>{rotation.disclaimer}</small>
          </div>
        )}
      </div>

      <p className="crop-explorer-disclaimer">
        Crop information is general knowledge-based guidance. Actual crop performance depends on local climate,
        soil testing, variety and farming practices.
      </p>
    </section>
  );
}
