# AgriMind AI 🌱

**A Prolog-powered Agricultural Expert System**
**Live link : https://agri-mind-ai-gilt.vercel.app/**
AgriMind AI is an agricultural decision-support application that analyzes farm conditions and provides rule-based crop recommendations using SWI-Prolog, FastAPI and React.

## Features

- **Farm Analysis:** Evaluate soil type, temperature, rainfall, pH, water availability, fertility and season.
- **Crop Suitability:** Score and rank six supported crops using a Prolog knowledge base.
- **Crop Explorer:** Explore crop families, duration, water requirements, benefits and cautions.
- **Crop Rotation:** Generate rotation recommendations with rule-based explanations.
- **Nutrient Advisor:** Evaluate nitrogen, phosphorus and potassium status and provide general guidance.
- **Analysis History:** Save, view, rename and delete farm analysis records.
- **Decision Explanations:** Return suitability scores and rejection reasons.

## Supported Crops

Wheat, Rice, Maize, Cotton, Mustard and Groundnut.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, JavaScript, CSS |
| Backend | Python, FastAPI, Pydantic |
| Reasoning engine | SWI-Prolog, PySwip |
| Database | SQLite |
| HTTP client | Axios |
| Deployment | Vercel, Render, Docker |

## Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP / JSON
  v
FastAPI Backend
  |
  +------> Analysis API
  |
  +------> Nutrient Advisor
  |
  +------> Crop Profiles & Rotation
  |
  +------> History Manager ------> SQLite
  |
  v
PySwip
  |
  v
SWI-Prolog Reasoning Engine
  |
  +------> facts.pl
  +------> rules.pl
  +------> reasoning.pl
```

## Project Structure

```text
AgriMind-AI/
├── backend/
│   ├── main.py
│   ├── nutrient_advisor.py
│   ├── history_manager.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── CropExplorer.jsx
│   │   ├── NutrientAdvisor.jsx
│   │   └── HistoryPanel.jsx
│   ├── package.json
│   └── vercel.json
├── prolog_engine/
│   ├── facts.pl
│   ├── rules.pl
│   └── reasoning.pl
├── Dockerfile
├── render.yaml
└── README.md
```

## How the Prolog Engine Works

The reasoning system separates agricultural knowledge from decision logic:

1. **Facts:** Store crop families, water requirements, duration, nutrient demand and other agricultural knowledge.
2. **Rules:** Define crop suitability, nutrient advice and crop rotation logic.
3. **Reasoning:** Combines facts and rules to answer queries.
4. **PySwip:** Connects Python to SWI-Prolog.
5. **FastAPI:** Exposes reasoning results through REST endpoints.

The system is rule-based decision support, not a trained machine-learning model.

## Local Installation

### Prerequisites

- Python 3.10+
- Node.js and npm
- SWI-Prolog
- Git

### 1. Install SWI-Prolog on macOS

```bash
brew install swi-prolog
swipl --version
```

### 2. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

For local development, the frontend automatically uses `http://127.0.0.1:8000` unless `VITE_API_URL` is configured.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend information |
| GET | `/health` | Health check |
| GET | `/options` | Analysis options |
| POST | `/analyze` | Farm analysis |
| POST | `/nutrients` | Nutrient advisory |
| GET | `/crop-profiles` | List supported crops |
| GET | `/crop-profile/{crop}` | Crop details |
| GET | `/rotation-advice/{previous_crop}/{next_crop}` | Rotation explanation |
| GET | `/rotation-recommendations/{previous_crop}` | Rotation recommendations |
| POST | `/history` | Save analysis |
| GET | `/history` | List saved analyses |

Additional history endpoints support viewing, renaming and deleting individual records.

## Deployment

### Backend — Render

1. Push the repository to GitHub.
2. Create a new Render Blueprint or Docker Web Service.
3. Use the repository root as the Docker build context.
4. Render uses the root `Dockerfile`, which installs SWI-Prolog and Python dependencies.
5. Configure `CORS_ORIGINS` with the deployed frontend origin.
6. Configure `AGRI_DB_PATH=/var/data/agri_history.db`.
7. Attach a persistent disk at `/var/data` for SQLite history.

The included `render.yaml` describes the service and persistent disk. Persistent disks may require a paid Render instance.

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the project Root Directory to `frontend`.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add the environment variable:

```text
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
```

6. Deploy the frontend.
7. Update the Render `CORS_ORIGINS` value to the actual Vercel domain and redeploy the backend.

## Important Notes

- Recommendations are based on simplified, rule-based agricultural knowledge.
- Suitability scores are decision-support indicators, not guaranteed yield predictions.
- Fertilizer decisions should be based on verified soil testing and local agricultural guidance.
- Persistent storage is recommended for production history records.

## Future Improvements

- Location-aware agricultural recommendations.
- More crop varieties and regional knowledge.
- Weather API integration.
- Soil-test report import.
- Expanded knowledge base and expert-validated rules.

---

**AgriMind AI — Intelligent Agricultural Decision Support through Logic Programming.**
