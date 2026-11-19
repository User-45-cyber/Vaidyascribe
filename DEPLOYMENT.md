# VaidyaScribe — Deployment Guide (Firebase Edition)

VaidyaScribe consists of:
1. **Backend**: FastAPI (Python) using Groq API for Whisper transcription & LLaMA SOAP generation, Firebase for auth & Firestore for database.
2. **Frontend**: Vite + React 19 Single Page Application.
3. **Database**: Firebase Cloud Firestore (NoSQL, auto-managed).

---

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name it `vaidyascribe` → Continue → Disable Google Analytics (optional) → **Create project**.

### Enable Authentication
1. In your Firebase project, click **Authentication** (left sidebar) → **Get started**.
2. Click **Email/Password** → Toggle **Enable** → **Save**.

### Enable Firestore Database
1. Click **Firestore Database** (left sidebar) → **Create database**.
2. Choose **Start in production mode** → Select region (e.g., `asia-south1` for India) → **Enable**.
3. Go to **Rules** tab and set:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /doctor_profiles/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /sessions/{sessionId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.doctor_id;
         allow create: if request.auth != null;
       }
     }
   }
   ```
   Click **Publish**.

### Get Your Firebase Credentials

#### A. Web API Key
1. Click the **⚙️ gear** icon (top-left, next to "Project Overview") → **Project settings**.
2. Under **General** tab, find **Web API Key** → Copy it.
   - This is your `FIREBASE_WEB_API_KEY`.

#### B. Service Account JSON
1. In **Project settings** → **Service accounts** tab.
2. Click **Generate new private key** → **Generate key**.
3. A JSON file downloads. This is your service account credentials.
4. For deployment, paste the entire JSON content as the value of `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable.

---

## Step 2: Deploy Backend to Render (Free)

1. Push your repository to GitHub.
2. Sign up / Log in to [Render](https://render.com/).
3. Click **New +** → **Web Service** → Connect your GitHub repo.
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `GROQ_API_KEY` = `<your-groq-api-key>`
   - `FIREBASE_WEB_API_KEY` = `<your-firebase-web-api-key>`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = `<paste-entire-json-content-here>`
6. Click **Create Web Service**.
7. Copy your backend URL (e.g., `https://vaidyascribe-backend.onrender.com`).
8. Test: `https://your-backend.onrender.com/health` → should return `{"status":"ok"}`.

---

## Step 3: Deploy Frontend to Vercel (Free)

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project** → Import your GitHub repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://vaidyascribe-backend.onrender.com` (no trailing slash)
5. Click **Deploy**.

---

## Post-Deployment Checklist
- [ ] Firebase Authentication (Email/Password) enabled
- [ ] Firestore database created with security rules
- [ ] Backend `/health` endpoint returns `{"status":"ok"}`
- [ ] Register a test doctor account
- [ ] Login works and redirects to dashboard
- [ ] Audio upload → Groq Whisper transcription works
- [ ] SOAP note generation works
- [ ] PDF export downloads correctly
- [ ] Sessions saved and visible in dashboard
