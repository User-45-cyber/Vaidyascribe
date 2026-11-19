"""
VaidyaScribe — Supabase Client
Handles database operations and auth token verification.
Falls back to in-memory storage when Supabase is not configured.
"""

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

_supabase_anon = None
_supabase_admin = None

def get_supabase():
    """Get or create Supabase anon client for Auth."""
    global _supabase_anon
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    if _supabase_anon is None:
        try:
            from supabase import create_client
            _supabase_anon = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception:
            return None
    return _supabase_anon

def get_supabase_admin():
    """Get or create Supabase service role client for DB."""
    global _supabase_admin
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    if _supabase_admin is None:
        try:
            from supabase import create_client
            _supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        except Exception:
            return None
    return _supabase_admin


# ─── In-Memory Fallback Storage ──────────────────────────────────────────────
# Used when Supabase is not configured (e.g., during local dev / hackathon demo)

_sessions_store: dict = {}
_profiles_store: dict = {}
_user_counter = 0


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
