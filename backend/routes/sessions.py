"""
VaidyaScribe — Session Routes
CRUD operations for consultation sessions (Firebase Firestore with in-memory fallback).
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from firebase_client import (
    db_save_session,
    db_get_sessions,
    db_get_session,
    db_delete_session,
    memory_save_session,
    memory_get_sessions,
    memory_get_session,
    memory_delete_session,
    get_firestore,
)

router = APIRouter()


class SessionCreate(BaseModel):
    session_id: str
    transcript: str
    soap: dict
    language: Optional[str] = "auto"
    audio_duration_seconds: Optional[int] = None
    patient_ref: Optional[str] = ""
    doctor_id: Optional[str] = "demo_doctor"


class SessionUpdate(BaseModel):
    soap: dict
    patient_ref: Optional[str] = ""


@router.post("/api/sessions", status_code=201)
async def create_session(req: SessionCreate):
    session_data = {
        "id": req.session_id,
        "doctor_id": req.doctor_id,
        "patient_ref": req.patient_ref,
        "language": req.language,
        "audio_duration_seconds": req.audio_duration_seconds,
        "transcript": req.transcript,
        "soap_subjective": req.soap.get("subjective", ""),
        "soap_objective": req.soap.get("objective", ""),
        "soap_assessment": req.soap.get("assessment", ""),
        "soap_plan": req.soap.get("plan", ""),
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        saved = db_save_session(session_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "id": saved["id"],
        "created_at": saved["created_at"],
        "pdf_url": None,
    }


@router.get("/api/sessions")
async def list_sessions(
    page: int = 1,
    per_page: int = 20,
    doctor_id: str = "demo_doctor",
):
    try:
        all_sessions = db_get_sessions(doctor_id)
    except Exception:
        all_sessions = []

    all_sessions.sort(key=lambda s: s.get("created_at", ""), reverse=True)

    total = len(all_sessions)
    start = (page - 1) * per_page
    end = start + per_page
    page_sessions = all_sessions[start:end]

    return {
        "sessions": [
            {
                "id": s["id"],
                "created_at": s.get("created_at", ""),
                "language": s.get("language", ""),
                "duration_seconds": s.get("audio_duration_seconds"),
                "soap_preview": (s.get("soap_subjective", "") or "")[:60],
                "patient_ref": s.get("patient_ref", ""),
                "status": s.get("status", "draft"),
            }
            for s in page_sessions
        ],
        "total": total,
        "page": page,
    }


@router.get("/api/sessions/{session_id}")
async def get_session_route(session_id: str):
    session = db_get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    success = db_delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"message": "Session deleted."}
