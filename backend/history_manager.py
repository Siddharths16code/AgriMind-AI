import sqlite3
import os
import json
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("AGRI_DB_PATH", str(BASE_DIR / "agri_history.db")))


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_name TEXT NOT NULL,
                analysis_data TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


initialize_database()


# ==========================================
# REQUEST MODEL
# ==========================================

class SaveAnalysisRequest(BaseModel):
    farm_name: str = Field(default="My Farm", min_length=1, max_length=100)
    analysis: dict


# ==========================================
# SAVE ANALYSIS
# ==========================================

@router.post("/history")
def save_analysis(request: SaveAnalysisRequest):

    if not request.analysis:
        raise HTTPException(
            status_code=400,
            detail="Analysis data cannot be empty"
        )

    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO analysis_history
            (farm_name, analysis_data, created_at)
            VALUES (?, ?, ?)
            """,
            (
                request.farm_name.strip(),
                json.dumps(request.analysis),
                created_at
            )
        )

        record_id = cursor.lastrowid

    return {
        "message": "Analysis saved successfully",
        "id": record_id,
        "farm_name": request.farm_name.strip(),
        "created_at": created_at
    }


# ==========================================
# GET ALL SAVED ANALYSES
# ==========================================

@router.get("/history")
def get_history():

    with get_connection() as connection:
        records = connection.execute(
            """
            SELECT id, farm_name, created_at, analysis_data
            FROM analysis_history
            ORDER BY id DESC
            """
        ).fetchall()

    history = []

    for record in records:
        analysis = json.loads(record["analysis_data"])

        history.append({
            "id": record["id"],
            "farm_name": record["farm_name"],
            "created_at": record["created_at"],
            "best_crop": analysis.get("best_crop"),
            "suitable_crops": analysis.get("suitable_crops", [])
        })

    return {
        "history": history,
        "total": len(history)
    }


# ==========================================
# GET SINGLE SAVED ANALYSIS
# ==========================================

@router.get("/history/{record_id}")
def get_history_record(record_id: int):

    with get_connection() as connection:
        record = connection.execute(
            """
            SELECT * FROM analysis_history
            WHERE id = ?
            """,
            (record_id,)
        ).fetchone()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Saved analysis not found"
        )

    return {
        "id": record["id"],
        "farm_name": record["farm_name"],
        "created_at": record["created_at"],
        "analysis": json.loads(record["analysis_data"])
    }


# ==========================================
# DELETE SAVED ANALYSIS
# ==========================================

@router.delete("/history/{record_id}")
def delete_history_record(record_id: int):

    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM analysis_history WHERE id = ?",
            (record_id,)
        )

        deleted = cursor.rowcount

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Saved analysis not found"
        )

    return {
        "message": "Analysis deleted successfully",
        "id": record_id
    }


# ==========================================
# RENAME SAVED FARM REPORT
# ==========================================

class RenameAnalysisRequest(BaseModel):
    farm_name: str = Field(min_length=1, max_length=100)


@router.patch("/history/{record_id}/rename")
def rename_history_record(record_id: int, request: RenameAnalysisRequest):

    new_name = request.farm_name.strip()

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="Farm name cannot be empty"
        )

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE analysis_history
            SET farm_name = ?
            WHERE id = ?
            """,
            (new_name, record_id)
        )

        updated = cursor.rowcount

    if updated == 0:
        raise HTTPException(
            status_code=404,
            detail="Saved analysis not found"
        )

    return {
        "message": "Farm report renamed successfully",
        "id": record_id,
        "farm_name": new_name
    }
