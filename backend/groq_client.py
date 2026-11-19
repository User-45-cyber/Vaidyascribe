"""
VaidyaScribe — Groq API Client
Handles both Whisper (ASR) and LLaMA (SOAP generation) via Groq's unified API.
"""

import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None

def get_groq_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))
    return _client

MIME_MAP = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "m4a": "audio/mp4",
    "ogg": "audio/ogg",
    "webm": "audio/webm",
}

SYSTEM_PROMPT = """You are an expert medical scribe trained in Asian clinical practice.
You will receive a transcript of a doctor-patient consultation.
The transcript may be in English, Hindi, Chinese, Japanese, Korean, or regional languages (code-switching is common).

Your task: Generate a professional clinical SOAP note in English only.

STRICT RULES:
- Output ONLY the 4 SOAP sections. No preamble, no explanation, no commentary.
- SUBJECTIVE: Patient's complaints, history, duration, severity in their words
- OBJECTIVE: Vitals if mentioned (BP, pulse, temp, SpO2, weight), physical exam findings, lab results
- ASSESSMENT: Primary diagnosis with ICD-10 code if identifiable, differential diagnoses
- PLAN: Medications (brand name + generic in parentheses + dose + frequency + duration),
  investigations ordered, follow-up timing, lifestyle/dietary advice
- Use local drug names as the doctor used them, add generic in parentheses
- Do NOT invent information not present in the transcript
- If a section has no data, write exactly: "Not documented in this encounter."
- Format each section header as the word only on its own line followed by a colon

Output format (use exactly this structure):
SUBJECTIVE:
[content]

OBJECTIVE:
[content]

ASSESSMENT:
[content]

PLAN:
[content]"""


def transcribe_audio(audio_path: str, language: str = None) -> str:
    """
    Transcribe audio file using Groq Whisper Large v3 Turbo.
    Returns verbatim transcript as plain text string.
    """
    filename = os.path.basename(audio_path)
    ext = filename.rsplit(".", 1)[-1].lower()
    content_type = MIME_MAP.get(ext, "audio/mpeg")

    client = get_groq_client()
    with open(audio_path, "rb") as f:
        response = client.audio.transcriptions.create(
            file=(filename, f, content_type),
            model="whisper-large-v3",
            language=language if language else None,
            response_format="text",
            temperature=0.0,
            prompt=(
                "Medical consultation between a doctor and patient in a noisy clinic environment with background sounds. "
                "May include English, Hindi, Chinese, Japanese, Korean or regional Asian languages. "
                "Ensure maximum accuracy for medical terminology, drug names, and dosages despite poor audio quality."
            ),
        )
    return response


MODELS_TO_TRY = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
]


def generate_soap_note(transcript: str, doctor_specialisation: str = "") -> dict:
    """
    Generate structured SOAP note from transcript using Groq LLaMA.
    Uses resilient fallback across available models.
    """
    spec_context = (
        f"The doctor is a {doctor_specialisation}. " if doctor_specialisation else ""
    )
    user_message = f"{spec_context}Transcript:\n\n{transcript}"

    client = get_groq_client()
    last_err = None

    for model in MODELS_TO_TRY:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=1500,
                temperature=0.2,
            )
            raw = response.choices[0].message.content
            return parse_soap_sections(raw)
        except Exception as e:
            last_err = e
            err_str = str(e).lower()
            if "model" in err_str or "not found" in err_str or "404" in err_str:
                continue
            raise e

    raise last_err


def parse_soap_sections(raw_text: str) -> dict:
    """Parse raw SOAP text into structured dict."""
    sections = {"subjective": "", "objective": "", "assessment": "", "plan": ""}
    pattern = r"(SUBJECTIVE|OBJECTIVE|ASSESSMENT|PLAN):\s*"
    parts = re.split(pattern, raw_text, flags=re.IGNORECASE)

    current = None
    for part in parts:
        key = part.strip().lower()
        if key in sections:
            current = key
        elif current:
            sections[current] = part.strip()
            current = None
    return sections
