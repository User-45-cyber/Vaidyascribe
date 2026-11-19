"""
VaidyaScribe — SOAP Note Generation Route
POST /api/generate-soap — generates structured SOAP note from transcript.
"""

import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from groq_client import generate_soap_note
from utils.rate_limiter import retry_on_rate_limit

router = APIRouter()


class SOAPRequest(BaseModel):
    session_id: str
    transcript: str
    doctor_specialisation: Optional[str] = ""


@router.post("/api/generate-soap")
async def generate_soap(req: SOAPRequest):
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    start_time = time.time()

    try:
        @retry_on_rate_limit(max_retries=2, wait_seconds=15)
        def do_generate():
            return generate_soap_note(req.transcript, req.doctor_specialisation or "")

        soap = do_generate()
        elapsed_ms = int((time.time() - start_time) * 1000)

        return {
            "soap": soap,
            "tokens_used": None,
            "generation_time_ms": elapsed_ms,
        }

    except Exception as e:
        error_msg = str(e).lower()
        if "rate_limit" in error_msg or "429" in error_msg:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "rate_limit",
                    "message": "Groq API rate limit reached. Retry in 30 seconds.",
                    "retry_after": 30,
                },
            )
        raise HTTPException(
            status_code=500, detail=f"SOAP generation failed: {str(e)}"
        )
