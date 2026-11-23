from pathlib import Path
import os
from threading import RLock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pyswip import Prolog


app = FastAPI(
    title="AgriMind AI",
    description="Prolog-powered Agricultural Expert System",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
PROLOG_DIR = BASE_DIR / "prolog_engine"

prolog = Prolog()
prolog_lock = RLock()
prolog.consult(str(PROLOG_DIR / "reasoning.pl"))


ALLOWED_SOILS = ["loamy", "clayey", "sandy", "black"]
ALLOWED_WATER = ["low", "medium", "high"]
ALLOWED_FERTILITY = ["low", "medium", "high"]
ALLOWED_SEASONS = ["rabi", "kharif"]

ALLOWED_CROPS = [
    "wheat", "rice", "maize",
    "cotton", "mustard", "groundnut"
]


class FarmInput(BaseModel):
    soil: str
    temperature: float = Field(ge=0, le=60)
    rainfall: float = Field(ge=0, le=5000)
    ph: float = Field(default=6.5, ge=0, le=14)
    water: str
    previous_crop: str
    fertility: str = "medium"
    season: str = "rabi"


def run_query(query):
    try:
        with prolog_lock:
            return list(prolog.query(query))
    except Exception as error:
        raise RuntimeError(f"Prolog reasoning failed: {error}")


def number(value):
    return format(float(value), ".2f")


@app.get("/")
def home():
    return {
        "application": "AgriMind AI",
        "status": "running",
        "version": "3.0.0",
        "reasoning_engine": "SWI-Prolog"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "connected",
        "prolog": "initialized"
    }


@app.get("/options")
def get_options():
    return {
        "soils": ALLOWED_SOILS,
        "water_levels": ALLOWED_WATER,
        "fertility_levels": ALLOWED_FERTILITY,
        "seasons": ALLOWED_SEASONS,
        "crops": ALLOWED_CROPS
    }


@app.post("/analyze")
def analyze_farm(data: FarmInput):

    soil = data.soil.strip().lower()
    water = data.water.strip().lower()
    previous_crop = data.previous_crop.strip().lower()
    fertility = data.fertility.strip().lower()
    season = data.season.strip().lower()

    if soil not in ALLOWED_SOILS:
        raise HTTPException(400, "Invalid soil type")

    if water not in ALLOWED_WATER:
        raise HTTPException(400, "Invalid water availability")

    if previous_crop not in ALLOWED_CROPS:
        raise HTTPException(400, "Invalid previous crop")

    if fertility not in ALLOWED_FERTILITY:
        raise HTTPException(400, "Invalid fertility level")

    if season not in ALLOWED_SEASONS:
        raise HTTPException(400, "Invalid growing season")

    temp = number(data.temperature)
    rain = number(data.rainfall)
    ph = number(data.ph)

    try:
        # 1. Suitable crop recommendations
        crop_results = run_query(
            f"recommend_crops({soil}, {temp}, {rain}, {ph}, "
            f"{fertility}, {season}, Crops)"
        )

        suitable_crops = (
            [str(c) for c in crop_results[0]["Crops"]]
            if crop_results else []
        )

        # 2. Individual crop scores and rejection explanations
        crop_analysis = []

        for crop in ALLOWED_CROPS:

            score_results = run_query(
                f"crop_score({crop}, {soil}, {temp}, {rain}, "
                f"{ph}, {fertility}, {season}, Score)"
            )

            score = (
                int(score_results[0]["Score"])
                if score_results else 0
            )

            rejection_results = run_query(
                f"get_rejection_reasons({crop}, {soil}, {temp}, "
                f"{rain}, {ph}, {fertility}, {season}, Reasons)"
            )

            reasons = (
                [str(r) for r in rejection_results[0]["Reasons"]]
                if rejection_results else []
            )

            crop_analysis.append({
                "crop": crop,
                "suitable": crop in suitable_crops,
                "score": score,
                "maximum_score": 6,
                "suitability_percentage": round(score / 6 * 100),
                "rejection_reasons": reasons
            })

        # 3. Rank crops by matching conditions
        ranked_crops = sorted(
            crop_analysis,
            key=lambda item: item["score"],
            reverse=True
        )

        best_crop = (
            ranked_crops[0]
            if ranked_crops and ranked_crops[0]["score"] > 0
            else None
        )

        # 4. Soil analysis
        soil_results = run_query(
            f"analyze_soil({soil}, Advice)"
        )

        soil_advice = (
            str(soil_results[0]["Advice"])
            if soil_results else "No soil advice available"
        )

        # 5. pH analysis
        ph_results = run_query(
            f"analyze_ph({ph}, Category)"
        )

        ph_category = (
            str(ph_results[0]["Category"])
            if ph_results else "unknown"
        )

        # 6. Fertility analysis
        fertility_results = run_query(
            f"analyze_fertility({fertility}, Advice)"
        )

        fertility_advice = (
            str(fertility_results[0]["Advice"])
            if fertility_results else "No fertility advice available"
        )

        # 7. Irrigation recommendations
        irrigation = []
        irrigation_crops = suitable_crops or [previous_crop]

        for crop in irrigation_crops:
            irrigation_results = run_query(
                f"recommend_irrigation({crop}, {water}, Level, Advice)"
            )

            if irrigation_results:
                item = irrigation_results[0]
                irrigation.append({
                    "crop": crop,
                    "level": str(item["Level"]),
                    "advice": str(item["Advice"])
                })

        # 8. Crop rotation
        rotation_results = run_query(
            f"recommend_rotation({previous_crop}, Crops)"
        )

        rotation_crops = (
            [str(c) for c in rotation_results[0]["Crops"]]
            if rotation_results else []
        )

        # 9. Final response
        return {
            "success": True,
            "input": {
                "soil": soil,
                "temperature": data.temperature,
                "rainfall": data.rainfall,
                "ph": data.ph,
                "water": water,
                "previous_crop": previous_crop,
                "fertility": fertility,
                "season": season
            },
            "suitable_crops": suitable_crops,
            "crop_analysis": crop_analysis,
            "ranked_crops": ranked_crops,
            "best_crop": best_crop,
            "soil_analysis": {
                "soil_type": soil,
                "advice": soil_advice
            },
            "ph_analysis": {
                "value": data.ph,
                "category": ph_category
            },
            "fertility_analysis": {
                "level": fertility,
                "advice": fertility_advice
            },
            "irrigation": irrigation,
            "crop_rotation": {
                "previous_crop": previous_crop,
                "recommended_crops": rotation_crops
            },
            "season": season,
            "engine": "SWI-Prolog"
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

# ==========================================
# NPK NUTRIENT ADVISORY ROUTER
# ==========================================

from nutrient_advisor import router as nutrient_router

app.include_router(nutrient_router)

# ==========================================
# CROP PROFILE AND ROTATION API
# ==========================================

from fastapi import HTTPException

@app.get("/crop-profiles")
def get_crop_profiles():
    crops = list(prolog.query("known_crop(Crop)"))

    return {
        "crops": [str(item["Crop"]) for item in crops],
        "total": len(crops),
        "engine": "SWI-Prolog"
    }


@app.get("/crop-profile/{crop}")
def get_crop_profile(crop: str):
    crop = crop.lower().strip()

    if crop not in ALLOWED_CROPS:
        raise HTTPException(status_code=404, detail="Crop not found")

    if not list(prolog.query(f"known_crop({crop})")):
        raise HTTPException(status_code=404, detail="Crop not found")

    results = list(prolog.query(
        f"crop_profile({crop}, Family, MinDays, MaxDays, Water, Use, Benefit, Caution)"
    ))

    if not results:
        raise HTTPException(status_code=404, detail="Crop profile unavailable")

    profile = results[0]

    return {
        "crop": crop,
        "family": str(profile["Family"]),
        "duration_days": {
            "minimum": int(profile["MinDays"]),
            "maximum": int(profile["MaxDays"])
        },
        "water_requirement": str(profile["Water"]),
        "agricultural_use": str(profile["Use"]),
        "benefits": str(profile["Benefit"]),
        "cautions": str(profile["Caution"]),
        "engine": "SWI-Prolog"
    }


@app.get("/rotation-advice/{previous_crop}/{next_crop}")
def get_rotation_advice(previous_crop: str, next_crop: str):
    previous_crop = previous_crop.lower().strip()
    next_crop = next_crop.lower().strip()

    for crop in [previous_crop, next_crop]:
        if crop not in ALLOWED_CROPS:
            raise HTTPException(status_code=404, detail=f"Unknown crop: {crop}")

        if not list(prolog.query(f"known_crop({crop})")):
            raise HTTPException(
                status_code=404,
                detail=f"Unknown crop: {crop}"
            )

    results = list(prolog.query(
        f"rotation_explanation({previous_crop}, {next_crop}, Explanation)"
    ))

    explanations = list(dict.fromkeys(
        str(item["Explanation"]) for item in results
    ))

    return {
        "previous_crop": previous_crop,
        "next_crop": next_crop,
        "compatible": previous_crop != next_crop,
        "explanations": explanations,
        "engine": "SWI-Prolog",
        "disclaimer": "General crop rotation guidance. Consider local soil, climate and agricultural recommendations."
    }



# ==========================================
# RANKED CROP ROTATION RECOMMENDATIONS
# ==========================================

@app.get("/rotation-recommendations/{previous_crop}")
def get_rotation_recommendations(previous_crop: str):

    previous_crop = previous_crop.lower().strip()

    if previous_crop not in ALLOWED_CROPS:
        raise HTTPException(status_code=404, detail="Previous crop not found")

    if not list(prolog.query(f"known_crop({previous_crop})")):
        raise HTTPException(
            status_code=404,
            detail="Previous crop not found"
        )

    results = list(prolog.query(
        f"rotation_score({previous_crop}, NextCrop, Score)"
    ))

    recommendations = []

    for item in results:
        next_crop = str(item["NextCrop"])
        score = int(item["Score"])

        explanation_results = list(prolog.query(
            f"rotation_explanation({previous_crop}, {next_crop}, Explanation)"
        ))

        explanations = list(dict.fromkeys(
            str(result["Explanation"])
            for result in explanation_results
        ))

        recommendations.append({
            "crop": next_crop,
            "score": score,
            "maximum_score": 5,
            "explanations": explanations
        })

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    for index, item in enumerate(recommendations, start=1):
        item["rank"] = index

    return {
        "previous_crop": previous_crop,
        "recommendations": recommendations,
        "total": len(recommendations),
        "engine": "SWI-Prolog",
        "disclaimer": (
            "Ranking is based on simplified crop-family and rotation-benefit "
            "rules. Verify local soil, climate, season and farming conditions."
        )
    }


# ==========================================
# ANALYSIS HISTORY ROUTER
# ==========================================

from history_manager import router as history_router

app.include_router(history_router)
