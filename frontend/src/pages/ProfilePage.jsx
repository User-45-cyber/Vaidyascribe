import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    registration_number: user?.registration_number || '',
    specialisation: user?.specialisation || '',
    clinic_name: user?.clinic_name || '',
    clinic_address: user?.clinic_address || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-root" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Navbar />
      <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Clinician Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>
            Management of your professional credentials and institutional settings.
          </p>
        </header>

        <section style={{ 
          background: 'white', border: '1px solid var(--border-light)', borderRadius: '32px', 
          boxShadow: 'var(--shadow-premium)', overflow: 'hidden' 
        }}>
          <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Account & Credentials</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>VERIFIED PRACTITIONER</span>
          </div>
          
          <div style={{ padding: '3rem 2.5rem' }}>
            {error && (
              <div style={{
                padding: '1rem 1.25rem', marginBottom: '2rem', background: '#FEF2F2',
                borderRadius: '12px', color: '#B91C1C', fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid #FEE2E2'
              }}>
                ⚠️ {error}
              </div>
            )}

            {saved && (
              <div style={{
                padding: '1rem 1.25rem', marginBottom: '2rem', background: '#ECFDF5',
                borderRadius: '12px', color: '#059669', fontSize: '0.85rem',
                fontWeight: 700, border: '1px solid #D1FAE5'
              }}>
                ✓ Profile successfully updated
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                    border: '1px solid var(--border-medium)', background: '#F8FAFC',
                    fontSize: '1rem', fontWeight: 600
                  }}
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                    MCI/State Registration
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                      border: '1px solid var(--border-medium)', background: '#F8FAFC',
                      fontSize: '1rem', fontWeight: 600
                    }}
                    value={form.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                    Specialisation
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                      border: '1px solid var(--border-medium)', background: '#F8FAFC',
                      fontSize: '1rem', fontWeight: 600
                    }}
                    value={form.specialisation}
                    onChange={(e) => handleChange('specialisation', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Primary Clinic / Hospital
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px',
                    border: '1px solid var(--border-medium)', background: '#F8FAFC',
                    fontSize: '1rem', fontWeight: 600
                  }}
                  value={form.clinic_name}
                  onChange={(e) => handleChange('clinic_name', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Clinic Address
                </label>
                <textarea
                  rows={3}
                  style={{
                    width: '100%', padding: '1rem 1.1rem', borderRadius: '12px',
                    border: '1px solid var(--border-medium)', background: '#F8FAFC',
                    fontSize: '1rem', fontWeight: 500, lineHeight: 1.6
                  }}
                  value={form.clinic_address}
                  onChange={(e) => handleChange('clinic_address', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                  style={{ padding: '0.9rem 2.5rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem' }}
                >
                  {saving ? 'Saving...' : 'Sync Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
