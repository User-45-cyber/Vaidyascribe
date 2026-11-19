import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    registration_number: '',
    specialisation: '',
    clinic_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.password || !form.registration_number) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: 'var(--bg-body)', padding: '2rem 2rem 5rem'
    }}>
      <div style={{ 
        width: '100%', maxWidth: '600px', background: 'white', padding: '3.5rem 3rem', 
        borderRadius: '32px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-premium)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'var(--brand-primary)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem', fontSize: '2rem', color: 'white',
            boxShadow: '0 8px 16px rgba(0, 181, 173, 0.15)'
          }}>🩺</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            VaidyaScribe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
            Initialize Physician Account
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem', marginBottom: '2rem',
            background: '#FEF2F2', border: '1px solid #FEE2E2',
            borderRadius: '12px', color: '#B91C1C',
            fontSize: '0.8rem', fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Full Legal Name *
            </label>
            <input
              id="reg-name"
              type="text"
              style={{
                width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                border: '1px solid var(--border-medium)', background: '#F8FAFC',
                fontSize: '0.95rem', fontWeight: 500
              }}
              placeholder="Dr. Arjun Varma"
              value={form.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Email Address *
              </label>
              <input
                id="reg-email"
                type="email"
                style={{
                  width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                  border: '1px solid var(--border-medium)', background: '#F8FAFC',
                  fontSize: '0.95rem', fontWeight: 500
                }}
                placeholder="dr.arjun@clinic.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Password *
              </label>
              <input
                id="reg-password"
                type="password"
                style={{
                  width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                  border: '1px solid var(--border-medium)', background: '#F8FAFC',
                  fontSize: '0.95rem', fontWeight: 500
                }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                MCI/Medical Reg. No. *
              </label>
              <input
                id="reg-registration"
                type="text"
                style={{
                  width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                  border: '1px solid var(--border-medium)', background: '#F8FAFC',
                  fontSize: '0.95rem', fontWeight: 500
                }}
                placeholder="REG-987654321"
                value={form.registration_number}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                Specialisation
              </label>
              <input
                id="reg-specialisation"
                type="text"
                style={{
                  width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                  border: '1px solid var(--border-medium)', background: '#F8FAFC',
                  fontSize: '0.95rem', fontWeight: 500
                }}
                placeholder="Cardiologist"
                value={form.specialisation}
                onChange={(e) => handleChange('specialisation', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Clinic / Hospital Name
            </label>
            <input
              id="reg-clinic"
              type="text"
              style={{
                width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                border: '1px solid var(--border-medium)', background: '#F8FAFC',
                fontSize: '0.95rem', fontWeight: 500
              }}
              placeholder="City Healthcare Center"
              value={form.clinic_name}
              onChange={(e) => handleChange('clinic_name', e.target.value)}
            />
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', padding: '1rem', borderRadius: '12px', 
              fontSize: '1rem', fontWeight: 800, letterSpacing: '0.01em'
            }}
            disabled={loading}
          >
            {loading ? 'Initializing Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in to Portal</Link>
        </div>
      </div>
    </div>
  );
}
