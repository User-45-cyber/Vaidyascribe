"""
VaidyaScribe — Transcription Route
POST /api/transcribe — accepts audio file, returns Groq Whisper transcript.
"""

import os
import uuid
import time
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from groq_client import transcribe_audio
from utils.rate_limiter import retry_on_rate_limit

router = APIRouter()

ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "ogg", "webm"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@router.post("/api/transcribe")
async def transcribe(
    audio_file: UploadFile = File(...),
    language: str = Form(None),
):
    # Validate extension
    ext = audio_file.filename.rsplit(".", 1)[-1].lower() if audio_file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{ext}'. Accepted: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await audio_file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Please trim the audio to under 10 minutes (25MB max).",
        )

    # Save to temp file for Groq API
    tmp_path = os.path.join(tempfile.gettempdir(), f"vs_{uuid.uuid4().hex}.{ext}")
    try:
        with open(tmp_path, "wb") as f:
            f.write(content)

        start_time = time.time()

        @retry_on_rate_limit(max_retries=2, wait_seconds=15)
        def do_transcribe():
            return transcribe_audio(tmp_path, language if language else None)

        transcript = do_transcribe()
        elapsed_ms = int((time.time() - start_time) * 1000)

        session_id = f"sess_{uuid.uuid4().hex[:12]}"

        return {
            "transcript": transcript,
            "language_detected": language or "auto",
            "duration_seconds": None,
            "session_id": session_id,
            "transcription_time_ms": elapsed_ms,
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
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
