import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: 'var(--bg-body)', padding: '2rem'
    }}>
      <div style={{ 
        width: '100%', maxWidth: '440px', background: 'white', padding: '3.5rem 2.5rem', 
        borderRadius: '28px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-premium)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'var(--brand-primary)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem', fontSize: '2rem', color: 'white',
            boxShadow: '0 8px 16px rgba(0, 181, 173, 0.15)'
          }}>🩺</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            VaidyaScribe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Premium Physician Portal
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem', marginBottom: '1.5rem',
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
              Institutional Email
            </label>
            <input
              id="login-email"
              type="email"
              style={{
                width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                border: '1px solid var(--border-medium)', background: '#F8FAFC',
                fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand-primary)';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 181, 173, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.background = '#F8FAFC';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="dr.smith@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              style={{
                width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                border: '1px solid var(--border-medium)', background: '#F8FAFC',
                fontSize: '0.95rem', fontWeight: 500
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', padding: '1rem', borderRadius: '12px', 
              fontSize: '1rem', fontWeight: 800, letterSpacing: '0.01em'
            }}
            disabled={loading}
          >
            {loading ? 'Validating Credentials...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          New clinician?{' '}
          <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}>Initialize Account</Link>
        </div>
      </div>
    </div>
  );
}
