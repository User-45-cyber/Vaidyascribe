"""
VaidyaScribe — Firebase Client
Handles database operations (Firestore) and auth token verification (Firebase Admin).
Falls back to in-memory storage when Firebase is not configured.
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()

_firebase_app = None
_firestore_db = None


def _init_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_app, _firestore_db
    if _firebase_app is not None:
        return True

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        # Option 1: Local service account JSON file in backend directory
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "firebase_service_account.json")
        # Option 2: GOOGLE_APPLICATION_CREDENTIALS file path
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")
        # Option 3: Service account JSON as env var string
        cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")

        if os.path.exists(local_path):
            cred = credentials.Certificate(local_path)
        elif cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        elif cred_json:
            cred_data = json.loads(cred_json)
            cred = credentials.Certificate(cred_data)
        else:
            return False

        _firebase_app = firebase_admin.initialize_app(cred)
        _firestore_db = firestore.client()
        return True
    except Exception as e:
        print(f"[Firebase] Init failed: {e}")
        return False


def get_firestore():
    """Get Firestore client."""
    if _firestore_db is None:
        _init_firebase()
    return _firestore_db


def verify_firebase_token(id_token: str) -> dict | None:
    """Verify a Firebase ID token and return decoded claims."""
    if not _init_firebase():
        return None
    try:
        from firebase_admin import auth
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        print(f"[Firebase] Token verification failed: {e}")
        return None


def create_firebase_user(email: str, password: str) -> dict:
    """Create a new Firebase Auth user."""
    if not _init_firebase():
        raise Exception("Firebase not configured")
    from firebase_admin import auth
    user = auth.create_user(email=email, password=password)
    # Generate custom token for immediate sign-in
    custom_token = auth.create_custom_token(user.uid)
    return {
        "uid": user.uid,
        "email": user.email,
        "custom_token": custom_token.decode("utf-8") if isinstance(custom_token, bytes) else custom_token,
    }


def firebase_sign_in(email: str, password: str) -> dict:
    """
    Sign in via Firebase REST API (Identity Toolkit).
    Firebase Admin SDK doesn't support sign-in, so we use the REST API.
    """
    import urllib.request
    import urllib.error

    api_key = os.environ.get("FIREBASE_WEB_API_KEY", "")
    if not api_key:
        raise Exception("FIREBASE_WEB_API_KEY not configured")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = json.dumps({
        "email": email,
        "password": password,
        "returnSecureToken": True,
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "uid": data["localId"],
                "email": data["email"],
                "id_token": data["idToken"],
                "refresh_token": data["refreshToken"],
            }
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8"))
        msg = body.get("error", {}).get("message", "Authentication failed")
        if msg == "EMAIL_NOT_FOUND" or msg == "INVALID_LOGIN_CREDENTIALS":
            raise Exception("Invalid email or password.")
        elif msg == "INVALID_PASSWORD":
            raise Exception("Invalid email or password.")
        elif msg == "USER_DISABLED":
            raise Exception("This account has been disabled.")
        else:
            raise Exception(msg)


def firebase_sign_up(email: str, password: str) -> dict:
    """
    Sign up via Firebase REST API (Identity Toolkit).
    Returns uid, email, and id_token.
    """
    import urllib.request
    import urllib.error

    api_key = os.environ.get("FIREBASE_WEB_API_KEY", "")
    if not api_key:
        raise Exception("FIREBASE_WEB_API_KEY not configured")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={api_key}"
    payload = json.dumps({
        "email": email,
        "password": password,
        "returnSecureToken": True,
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "uid": data["localId"],
                "email": data["email"],
                "id_token": data["idToken"],
                "refresh_token": data["refreshToken"],
            }
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8"))
        msg = body.get("error", {}).get("message", "Sign up failed")
        if msg == "EMAIL_EXISTS":
            raise Exception("This email is already registered! Please switch to the 'Sign In' tab.")
        elif "WEAK_PASSWORD" in msg:
            raise Exception("Password should be at least 6 characters.")
        else:
            raise Exception(msg)


# ─── Firestore CRUD helpers ─────────────────────────────────────────────────

def db_save_profile(user_id: str, profile_data: dict) -> dict:
    """Save/update a doctor profile in Firestore."""
    db = get_firestore()
    if db:
        doc_ref = db.collection("doctor_profiles").document(user_id)
        doc_ref.set(profile_data, merge=True)
        return {**profile_data, "id": user_id}
    else:
        return memory_update_profile(user_id, profile_data) or memory_create_profile(user_id, profile_data)


def db_get_profile(user_id: str) -> dict | None:
    """Get a doctor profile from Firestore."""
    db = get_firestore()
    if db:
        doc = db.collection("doctor_profiles").document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None
    else:
        return memory_get_profile(user_id)


def db_update_profile(user_id: str, update_data: dict) -> dict | None:
    """Update a doctor profile in Firestore."""
    db = get_firestore()
    if db:
        doc_ref = db.collection("doctor_profiles").document(user_id)
        doc_ref.update(update_data)
        doc = doc_ref.get()
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    else:
        return memory_update_profile(user_id, update_data)


def db_save_session(session_data: dict) -> dict:
    """Save a consultation session to Firestore."""
    db = get_firestore()
    if db:
        session_id = session_data.get("id", "")
        doc_ref = db.collection("sessions").document(session_id)
        doc_ref.set(session_data)
        return session_data
    else:
        return memory_save_session(session_data)


def db_get_sessions(doctor_id: str) -> list:
    """Get all sessions for a doctor from Firestore."""
    db = get_firestore()
    if db:
        docs = (
            db.collection("sessions")
            .where("doctor_id", "==", doctor_id)
            .where("status", "!=", "deleted")
            .order_by("created_at", direction="DESCENDING")
            .stream()
        )
        sessions = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            sessions.append(data)
        return sessions
    else:
        return memory_get_sessions(doctor_id)


def db_get_session(session_id: str) -> dict | None:
    """Get a single session by ID from Firestore."""
    db = get_firestore()
    if db:
        doc = db.collection("sessions").document(session_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None
    else:
        return memory_get_session(session_id)


def db_delete_session(session_id: str) -> bool:
    """Soft-delete a session in Firestore."""
    db = get_firestore()
    if db:
        doc_ref = db.collection("sessions").document(session_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_ref.update({"status": "deleted"})
            return True
        return False
    else:
        return memory_delete_session(session_id)


# ─── In-Memory Fallback Storage ──────────────────────────────────────────────
# Used when Firebase is not configured (e.g., during local dev / hackathon demo)

_sessions_store: dict = {}
_profiles_store: dict = {}
_user_counter = 0


def memory_create_profile(user_id: str, profile_data: dict) -> dict:
    _profiles_store[user_id] = {**profile_data, "id": user_id}
    return _profiles_store[user_id]


def memory_create_user(email: str, password: str, profile_data: dict) -> dict:
    """Create a mock user in memory."""
    global _user_counter
    _user_counter += 1
    user_id = f"user_{_user_counter}"
    _profiles_store[user_id] = {
        "id": user_id,
        "email": email,
        "full_name": profile_data.get("full_name", ""),
        "registration_number": profile_data.get("registration_number", ""),
        "specialisation": profile_data.get("specialisation", ""),
        "clinic_name": profile_data.get("clinic_name", ""),
        "clinic_address": profile_data.get("clinic_address", ""),
        "phone": profile_data.get("phone", ""),
    }
    return {"user_id": user_id, "email": email, "token": f"mock_token_{user_id}"}


def memory_login(email: str, password: str) -> dict | None:
    """Mock login — finds user by email."""
    for uid, profile in _profiles_store.items():
        if profile.get("email") == email:
            return {"user_id": uid, "email": email, "token": f"mock_token_{uid}"}
    return None


def memory_get_profile(user_id: str) -> dict | None:
    return _profiles_store.get(user_id)


def memory_update_profile(user_id: str, data: dict) -> dict | None:
    if user_id in _profiles_store:
        _profiles_store[user_id].update(data)
        return _profiles_store[user_id]
    return None


def memory_save_session(session_data: dict) -> dict:
    sid = session_data.get("id", f"sess_{len(_sessions_store) + 1}")
    session_data["id"] = sid
    _sessions_store[sid] = session_data
    return session_data


def memory_get_sessions(user_id: str) -> list:
    return [
        s for s in _sessions_store.values()
        if s.get("doctor_id") == user_id and s.get("status") != "deleted"
    ]


def memory_get_session(session_id: str) -> dict | None:
    return _sessions_store.get(session_id)


def memory_delete_session(session_id: str) -> bool:
    if session_id in _sessions_store:
        _sessions_store[session_id]["status"] = "deleted"
        return True
    return False
