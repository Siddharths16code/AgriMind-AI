from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pyswip import Prolog


router = APIRouter(tags=["Nutrient Advisory"])

BASE_DIR = Path(__file__).resolve().parent
PROLOG_FILE = BASE_DIR.parent / "prolog_engine" / "reasoning.pl"

prolog = Prolog()
prolog.consult(str(PROLOG_FILE))

ALLOWED_CROPS = {
    "wheat", "rice", "maize",
    "cotton", "mustard", "groundnut"
}

ALLOWED_LEVELS = {"low", "medium", "high"}


class NutrientInput(BaseModel):
    crop: str
    nitrogen: str
    phosphorus: str
    potassium: str


@router.post("/nutrients")
def nutrient_analysis(data: NutrientInput):

    crop = data.crop.lower().strip()
    levels = {
        "nitrogen": data.nitrogen.lower().strip(),
        "phosphorus": data.phosphorus.lower().strip(),
        "potassium": data.potassium.lower().strip()
    }

    if crop not in ALLOWED_CROPS:
        raise HTTPException(status_code=400, detail="Invalid crop selected")

    for nutrient, level in levels.items():
        if level not in ALLOWED_LEVELS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {nutrient} level"
            )

    try:
        results = []

        for nutrient, level in levels.items():

            advice_query = list(
                prolog.query(
                    f"nutrient_advice({nutrient}, {level}, Advice)"
                )
            )

            demand_query = list(
                prolog.query(
                    f"nutrient_demand({crop}, {nutrient}, Demand)"
                )
            )

            if not advice_query or not demand_query:
                raise HTTPException(
                    status_code=500,
                    detail=f"Knowledge base entry missing for {nutrient}"
                )

            advice = str(advice_query[0]["Advice"])
            demand = str(demand_query[0]["Demand"])

            results.append({
                "nutrient": nutrient,
                "soil_status": level,
                "crop_demand": demand,
                "needs_attention": level == "low",
                "advice": advice
            })

        deficient = [
            item["nutrient"]
            for item in results
            if item["needs_attention"]
        ]

        return {
            "crop": crop,
            "nutrient_analysis": results,
            "attention_required": deficient,
            "summary": (
                "Nutrient deficiencies or low reported levels need attention."
                if deficient
                else "No low nutrient levels were reported. Maintain balanced nutrient management."
            ),
            "engine": "SWI-Prolog",
            "disclaimer": (
                "This is general decision-support guidance. "
                "Use a verified soil test and local agricultural recommendations "
                "to determine fertilizer type and quantity."
            )
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Nutrient reasoning failed: {str(error)}"
        )
