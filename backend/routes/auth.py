"""
VaidyaScribe — Auth Routes
Authentication using Firebase Auth + Firestore for doctor profiles.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from firebase_client import (
    get_firestore,
    firebase_sign_up,
    firebase_sign_in,
    db_save_profile,
    db_get_profile,
    db_update_profile,
    memory_create_user,
    memory_login,
    memory_get_profile,
    memory_update_profile,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    registration_number: str
    specialisation: Optional[str] = ""
    clinic_name: Optional[str] = ""
    clinic_address: Optional[str] = ""
    phone: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    registration_number: Optional[str] = None
    specialisation: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    phone: Optional[str] = None


@router.post("/api/auth/register")
async def register(req: RegisterRequest):
    db = get_firestore()
    if db:
        try:
            # 1. Create user in Firebase Auth
            auth_result = firebase_sign_up(req.email, req.password)
            user_id = auth_result["uid"]
            token = auth_result["id_token"]

            # 2. Save doctor profile in Firestore
            profile_data = {
                "full_name": req.full_name,
                "registration_number": req.registration_number,
                "specialisation": req.specialisation,
                "clinic_name": req.clinic_name,
                "clinic_address": req.clinic_address,
                "phone": req.phone,
                "email": req.email,
            }
            db_save_profile(user_id, profile_data)

            return {
                "user_id": user_id,
                "email": req.email,
                "token": token,
                "profile": {**profile_data, "id": user_id},
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # Fallback to memory
        result = memory_create_user(
            email=req.email,
            password=req.password,
            profile_data={
                "full_name": req.full_name,
                "registration_number": req.registration_number,
                "specialisation": req.specialisation,
                "clinic_name": req.clinic_name,
                "clinic_address": req.clinic_address,
                "phone": req.phone,
            },
        )
        return {
            "user_id": result["user_id"],
            "email": result["email"],
            "token": result["token"],
            "profile": memory_get_profile(result["user_id"]),
        }


@router.post("/api/auth/login")
async def login(req: LoginRequest):
    db = get_firestore()
    if db:
        try:
            # Sign in via Firebase REST API
            auth_result = firebase_sign_in(req.email, req.password)
            user_id = auth_result["uid"]
            token = auth_result["id_token"]

            # Get doctor profile from Firestore
            profile = db_get_profile(user_id) or {}

            return {
                "user_id": user_id,
                "email": req.email,
                "token": token,
                "profile": profile,
            }
        except Exception as e:
            error_msg = str(e)
            if "Invalid email or password" in error_msg:
                raise HTTPException(status_code=401, detail="Invalid email or password.")
            else:
                raise HTTPException(status_code=401, detail=error_msg)
    else:
        result = memory_login(req.email, req.password)
        if not result:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        return {
            "user_id": result["user_id"],
            "email": result["email"],
            "token": result["token"],
            "profile": memory_get_profile(result["user_id"]),
        }


@router.get("/api/auth/profile")
async def get_profile(user_id: str = "demo_doctor"):
    db = get_firestore()
    if db and not user_id.startswith("user_"):
        profile = db_get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return profile
    else:
        profile = memory_get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return profile


@router.put("/api/auth/profile")
async def update_profile(req: ProfileUpdate, user_id: str = "demo_doctor"):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    db = get_firestore()
    if db and not user_id.startswith("user_"):
        try:
            result = db_update_profile(user_id, update_data)
            if not result:
                raise HTTPException(status_code=404, detail="Profile not found.")
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        profile = memory_update_profile(user_id, update_data)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return profile
