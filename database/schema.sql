-- VaidyaScribe Database Schema
-- Target: Supabase (PostgreSQL)

-- Doctor profiles (extends Supabase auth.users)
CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    specialisation TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_ref TEXT,
    language TEXT,
    audio_duration_seconds INTEGER,
    audio_storage_path TEXT,
    transcript TEXT NOT NULL,
    soap_subjective TEXT,
    soap_objective TEXT,
    soap_assessment TEXT,
    soap_plan TEXT,
    pdf_storage_path TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_sessions_doctor_id ON sessions(doctor_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can only access their own sessions"
    ON sessions FOR ALL
    USING (doctor_id = auth.uid());

ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can only access their own profile"
    ON doctor_profiles FOR ALL
    USING (id = auth.uid());
