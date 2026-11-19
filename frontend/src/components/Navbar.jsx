import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-light)',
      padding: '0.75rem 2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ 
            width: '34px', height: '34px', background: 'var(--brand-primary)', 
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', fontWeight: 800, fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(0, 181, 173, 0.2)'
          }}>🩺</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>VaidyaScribe</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
              fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' 
            }}
          >
            Dashboard
          </button>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-light)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.full_name || 'Dr. Clinical'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{user?.specialization || 'General Physician'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-sm"
              style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#F1F5F9', color: '#64748B', fontWeight: 700, border: 'none' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
