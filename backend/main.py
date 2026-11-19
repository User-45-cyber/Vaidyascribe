"""
VaidyaScribe — FastAPI Backend Entry Point
"""

import os
import sys

# Ensure backend root directory is on Python path for routes and modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VaidyaScribe API",
    description="AI Clinical Documentation Scribe — Groq-powered backend",
    version="1.0.0",
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
from routes.transcribe import router as transcribe_router
from routes.soap import router as soap_router
from routes.sessions import router as sessions_router
from routes.export import router as export_router
from routes.auth import router as auth_router

app.include_router(transcribe_router)
app.include_router(soap_router)
app.include_router(sessions_router)
app.include_router(export_router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "name": "VaidyaScribe API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

