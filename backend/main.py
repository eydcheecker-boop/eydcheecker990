from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

from eyd_rules import analyze_text

app = FastAPI(title="EYD Checker API")

app.add_middleware(
    CORSMiddleware,
    # During development allow all origins (adjust for production)
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "feedback.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original TEXT,
        suggested TEXT,
        rule TEXT,
        accepted INTEGER
    )""")
    conn.commit()
    conn.close()


init_db()


class TextIn(BaseModel):
    text: str


class Correction(BaseModel):
    original: str
    suggested: str
    rule: str


class CheckOut(BaseModel):
    text: str
    corrections: List[Correction]


@app.post("/check_eyd", response_model=CheckOut)
async def check_eyd(payload: TextIn):
    """Analyze text using rule-based heuristics and return suggestions.

    This endpoint is lightweight and deterministic. If `transformers` and
    a model are installed, an optional ML pass could be added.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    result = analyze_text(payload.text)
    return result


@app.post("/feedback")
async def feedback(item: Correction, accepted: bool = True):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO feedback (original, suggested, rule, accepted) VALUES (?, ?, ?, ?)",
        (item.original, item.suggested, item.rule, 1 if accepted else 0),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}
