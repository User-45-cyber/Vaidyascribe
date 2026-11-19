# VaidyaScribe 🩺✨

**AI Clinical Documentation Scribe** — Groq-powered multilingual doctor-patient consultation transcription, automated SOAP clinical note generation, and PDF consultation export.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [React Router v7](https://reactrouter.com/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Groq Cloud SDK](https://console.groq.com/)
  - **Whisper Large v3 Turbo**: Fast, multilingual audio transcription (with code-switching support)
  - **LLaMA 3**: Professional SOAP clinical documentation (Subjective, Objective, Assessment, Plan)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Export**: [FPDF2](https://py-pdf.github.io/fpdf2/) for clinical consultation PDF summaries

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY and SUPABASE credentials
python main.py
```
Backend will be live at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## 🚢 Deployment

For complete instructions on deploying to **Vercel + Render**, **Docker**, **Render Blueprints**, or **Railway**, see the [**Deployment Guide (DEPLOYMENT.md)**](./DEPLOYMENT.md).

Quick Docker deploy:
```bash
docker compose up --build -d
```
