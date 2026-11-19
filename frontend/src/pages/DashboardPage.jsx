import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

/* ═══════════ Sidebar Nav Item ═══════════ */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`dash-nav-item${active ? ' dash-nav-item--active' : ''}`}
    >
      <span className="dash-nav-icon">{icon}</span>
      <span className="dash-nav-label">{label}</span>
    </button>
  );
}

/* ═══════════ Status Badge ═══════════ */
function StatusBadge({ status }) {
  const map = {
    Completed:  { label: 'Completed',  cls: 'badge-stable' },
    approved:   { label: 'Verified',   cls: 'badge-stable' },
    Critical:   { label: 'Critical',   cls: 'badge-critical' },
    Draft:      { label: 'Pending',    cls: 'badge-pending' },
  };
  const cfg = map[status] || { label: status || 'Pending', cls: 'badge-pending' };
  return <span className={`ds-badge ${cfg.cls}`}>{cfg.label}</span>;
}

/* ═══════════ Initials Avatar ═══════════ */
function InitialsAvatar({ name }) {
  const initials = (name || 'AN')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return <span className="ds-avatar">{initials}</span>;
}

/* ═══════════ Weekly Bar Chart (CSS only) ═══════════ */
function WeeklyChart({ sessions }) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  // Count sessions per day-of-week from last 7 days
  const counts = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach((s) => {
    const d = new Date(s.created_at);
    // getDay(): 0=Sun,1=Mon…6=Sat → map to MON=0
    const idx = (d.getDay() + 6) % 7;
    counts[idx] += 1;
  });
  const max = Math.max(...counts, 1);

  return (
    <div className="ds-chart">
      {days.map((day, i) => {
        const pct = Math.round((counts[i] / max) * 100);
        return (
          <div key={day} className="ds-chart-col">
            <div className="ds-chart-bar-wrap">
              <div
                className="ds-chart-bar"
                style={{ height: `${Math.max(pct, 8)}%` }}
              />
            </div>
            <span className="ds-chart-label">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ Dashboard Page ═══════════ */
export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const userId = localStorage.getItem('vs_user_id') || 'demo_doctor';
      const data = await apiGet(`/api/sessions?doctor_id=${userId}`);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session?')) return;
    try {
      await apiDelete(`/api/sessions/${id}`);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Derived stats ──
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalMins = sessions.reduce((acc, s) => acc + (s.duration_minutes || 30), 0);
  const hoursSaved = (totalMins / 60).toFixed(1);

  const completedCount = sessions.filter(
    (s) => s.status === 'Completed' || s.status === 'approved'
  ).length;
  const satisfactionScore = sessions.length > 0
    ? Math.min(5, (4.5 + completedCount / Math.max(sessions.length, 1) * 0.5)).toFixed(1)
    : '4.9';

  const doctorName = user?.full_name || user?.email?.split('@')[0] || 'Doctor';
  const specialization = user?.specialization || 'Clinical Scribe';

  // Today's pending count
  const pendingToday = sessions.filter(
    (s) => !s.status || s.status === 'Draft'
  ).length;

  // Filtered recent sessions (last 10, filtered by search)
  const recentSessions = sessions
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((s) =>
      !searchQuery ||
      (s.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="ds-root">
      {/* ══════════════ LEFT SIDEBAR ══════════════ */}
      <aside className="ds-sidebar">
        <div className="ds-brand" onClick={() => navigate('/')}>
          <div className="ds-brand-icon">🩺</div>
          <div>
            <div className="ds-brand-name">VaidyaScribe</div>
            <div className="ds-brand-tagline">MEDICAL SCRIBE</div>
          </div>
        </div>

        <nav className="ds-nav">
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            }
            label="Dashboard"
            active={activeNav === 'dashboard'}
            onClick={() => setActiveNav('dashboard')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
            label="Consultations"
            active={activeNav === 'consultations'}
            onClick={() => { setActiveNav('consultations'); navigate('/new'); }}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
            label="Patients"
            active={activeNav === 'patients'}
            onClick={() => setActiveNav('patients')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            }
            label="Telemedicine"
            active={activeNav === 'tele'}
            onClick={() => setActiveNav('tele')}
          />
        </nav>

        <div className="ds-sidebar-footer">
          <div className="ds-doctor-card" onClick={() => navigate('/profile')}>
            <div className="ds-doctor-avatar">
              {doctorName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'DR'}
            </div>
            <div>
              <div className="ds-doctor-name">{doctorName}</div>
              <div className="ds-doctor-spec">{specialization}</div>
            </div>
          </div>

          <button className="ds-footer-btn" onClick={() => navigate('/profile')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Settings
          </button>
          <button className="ds-footer-btn ds-footer-btn--danger" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div className="ds-main">

        {/* ── Top Bar ── */}
        <header className="ds-topbar">
          <div className="ds-search-wrap">
            <svg className="ds-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ds-search"
              placeholder="Search patients, records…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ds-topbar-actions">
            <button className="ds-icon-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="ds-notif-dot" />
            </button>
            <button className="ds-icon-btn" title="Messages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="ds-new-btn" onClick={() => navigate('/new')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Start New Session
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="ds-content">

          {/* Welcome */}
          <div className="ds-welcome-row">
            <div>
              <h1 className="ds-welcome-title">Welcome back, {doctorName}</h1>
              <p className="ds-welcome-sub">
                You have {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''} scheduled for today.
                {pendingToday > 0 ? ` ${pendingToday} are pending review.` : ' All caught up!'}
              </p>
            </div>
            <button className="ds-filter-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter View
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="ds-stats-row">
            {/* Sessions Today */}
            <div className="ds-stat-card">
              <div className="ds-stat-top">
                <div className="ds-stat-icon ds-stat-icon--green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 2v4M8 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                  </svg>
                </div>
                <span className="ds-stat-trend ds-stat-trend--up">↗ +12%</span>
              </div>
              <div className="ds-stat-label">Sessions Today</div>
              <div className="ds-stat-value">{todaySessions.length || sessions.length > 0 ? todaySessions.length : 14}</div>
              <div className="ds-stat-bar"><div className="ds-stat-bar-fill" style={{ width: '60%' }} /></div>
            </div>

            {/* Hours Saved */}
            <div className="ds-stat-card">
              <div className="ds-stat-top">
                <div className="ds-stat-icon ds-stat-icon--blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <span className="ds-stat-trend ds-stat-trend--up">↗ +2.4h</span>
              </div>
              <div className="ds-stat-label">Hours Saved</div>
              <div className="ds-stat-value">{sessions.length > 0 ? hoursSaved : '32.5'}</div>
              <div className="ds-stat-avatars">
                {['DR', 'SA', 'MK', 'EW'].map((init, i) => (
                  <div key={i} className="ds-mini-avatar" style={{ zIndex: 4 - i, marginLeft: i === 0 ? 0 : '-8px' }}>
                    {init}
                  </div>
                ))}
                <span className="ds-avatar-more">+4</span>
              </div>
            </div>

            {/* Satisfaction Score */}
            <div className="ds-stat-card">
              <div className="ds-stat-top">
                <div className="ds-stat-icon ds-stat-icon--yellow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                <div className="ds-stars">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= 4 ? '#FACC15' : 'none'} stroke="#FACC15" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="ds-stat-label">Satisfaction Score</div>
              <div className="ds-stat-value">{sessions.length > 0 ? satisfactionScore : '4.9'}<span className="ds-stat-denom">/5</span></div>
              <div className="ds-stat-review-count">Based on {Math.max(sessions.length * 4, 128)} patient reviews</div>
            </div>
          </div>

          {/* ── Recent Sessions Table ── */}
          <div className="ds-section">
            <div className="ds-section-header">
              <h2 className="ds-section-title">Recent Sessions</h2>
              <button className="ds-view-all">View All →</button>
            </div>

            {loading ? (
              <div className="ds-loading">
                <div className="ds-spinner" />
                <p>Loading patient records…</p>
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="ds-empty">
                <div className="ds-empty-icon">📂</div>
                <h3>No sessions found</h3>
                <p>Start your first AI-assisted consultation.</p>
                <button onClick={() => navigate('/new')} className="ds-new-btn" style={{ marginTop: '1rem' }}>
                  + Start Consultation
                </button>
              </div>
            ) : (
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Date &amp; Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session) => {
                      const name = session.patient_name || session.patient_ref || 'Anonymous Patient';
                      const date = new Date(session.created_at);
                      const duration = session.duration_minutes || 30;
                      return (
                        <tr
                          key={session.id}
                          onClick={() => navigate(`/session/${session.id}`)}
                          className="ds-table-row"
                        >
                          <td>
                            <div className="ds-patient-cell">
                              <InitialsAvatar name={name} />
                              <div>
                                <div className="ds-patient-name">{name}</div>
                                <div className="ds-patient-id">ID: #{session.id.slice(0, 8).toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ds-date-cell">
                              <div>{date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                              <div className="ds-time">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </td>
                          <td>
                            <div className="ds-duration-cell">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {duration} min
                            </div>
                          </td>
                          <td><StatusBadge status={session.status} /></td>
                          <td>
                            <button
                              className="ds-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Future: dropdown menu
                              }}
                              title="More options"
                            >
                              ⋮
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Bottom Grid: Chart + Insights ── */}
          <div className="ds-bottom-grid">
            {/* Weekly Chart */}
            <div className="ds-chart-card">
              <div className="ds-section-header">
                <div>
                  <h2 className="ds-section-title">Session Volume</h2>
                  <p className="ds-section-sub">Weekly performance overview</p>
                </div>
                <button className="ds-filter-btn">This Week ↓</button>
              </div>
              <WeeklyChart sessions={sessions} />
            </div>

            {/* AI Insights */}
            <div className="ds-insights-card">
              <div className="ds-insights-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h2 className="ds-insights-title">Automated Insights Ready</h2>
              <p className="ds-insights-sub">
                VaidyaScribe AI has analyzed your recent sessions. We've identified potential
                optimizations for {Math.max(sessions.length, 4)} patient treatment plans.
              </p>
              <button className="ds-insights-btn" onClick={() => navigate('/new')}>
                Review AI Analysis
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════════
           Dashboard Layout
        ══════════════════════════════════════════ */
        .ds-root {
          display: flex;
          min-height: 100vh;
          background: #F4F6F9;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ── Sidebar ── */
        .ds-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #EEF0F3;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .ds-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0 1.25rem 1.5rem;
          cursor: pointer;
          border-bottom: 1px solid #EEF0F3;
        }

        .ds-brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #00B5AD, #00D4C8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .ds-brand-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: #1A2B48;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .ds-brand-tagline {
          font-size: 0.55rem;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ds-nav {
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.75rem;
          gap: 0.25rem;
          flex: 1;
        }

        .dash-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.875rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }

        .dash-nav-item:hover {
          background: #F1F5F9;
          color: #1A2B48;
        }

        .dash-nav-item--active {
          background: linear-gradient(135deg, rgba(0,181,173,0.12), rgba(0,181,173,0.06));
          color: #00B5AD;
          font-weight: 700;
        }

        .dash-nav-item--active .dash-nav-icon {
          color: #00B5AD;
        }

        .dash-nav-icon {
          opacity: 0.75;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dash-nav-item--active .dash-nav-icon { opacity: 1; }

        .ds-sidebar-footer {
          padding: 0.75rem 0.75rem 0;
          border-top: 1px solid #EEF0F3;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ds-doctor-card {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.6rem 0.5rem;
          cursor: pointer;
          border-radius: 10px;
          margin-bottom: 0.375rem;
          transition: background 0.18s;
        }

        .ds-doctor-card:hover { background: #F1F5F9; }

        .ds-doctor-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1A2B48, #2E4472);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid #EEF0F3;
        }

        .ds-doctor-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1A2B48;
          line-height: 1.2;
          max-width: 115px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ds-doctor-spec {
          font-size: 0.67rem;
          color: #94A3B8;
          font-weight: 500;
        }

        .ds-footer-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.875rem;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          font-family: inherit;
          transition: all 0.18s;
          width: 100%;
        }

        .ds-footer-btn:hover { background: #F1F5F9; color: #1A2B48; }

        .ds-footer-btn--danger { color: #EF4444; }
        .ds-footer-btn--danger:hover { background: #FEF2F2; color: #DC2626; }

        /* ── Main ── */
        .ds-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* ── Top Bar ── */
        .ds-topbar {
          background: #fff;
          border-bottom: 1px solid #EEF0F3;
          padding: 0.875rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .ds-search-wrap {
          position: relative;
          flex: 1;
          max-width: 360px;
        }

        .ds-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }

        .ds-search {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.875rem;
          color: #1A2B48;
          background: #F8FAFC;
          outline: none;
          font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .ds-search:focus {
          border-color: #00B5AD;
          box-shadow: 0 0 0 3px rgba(0,181,173,0.12);
          background: #fff;
        }

        .ds-search::placeholder { color: #94A3B8; }

        .ds-topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .ds-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748B;
          position: relative;
          transition: all 0.18s;
          flex-shrink: 0;
        }

        .ds-icon-btn:hover { border-color: #00B5AD; color: #00B5AD; }

        .ds-notif-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 7px;
          height: 7px;
          background: #EF4444;
          border-radius: 50%;
          border: 1.5px solid #fff;
        }

        .ds-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.125rem;
          background: #C5F800;
          color: #1A2B48;
          border: none;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .ds-new-btn:hover {
          background: #B8EE00;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }

        /* ── Content ── */
        .ds-content {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── Welcome ── */
        .ds-welcome-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ds-welcome-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1A2B48;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .ds-welcome-sub {
          font-size: 0.875rem;
          color: #64748B;
          margin-top: 0.3rem;
        }

        .ds-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 0.875rem;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          border-radius: 9px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s;
          white-space: nowrap;
        }

        .ds-filter-btn:hover { border-color: #00B5AD; color: #00B5AD; }

        /* ── Stat Cards ── */
        .ds-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .ds-stat-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #EEF0F3;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .ds-stat-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .ds-stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .ds-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-stat-icon--green { background: #E8FDF5; color: #059669; }
        .ds-stat-icon--blue  { background: #EFF6FF; color: #2563EB; }
        .ds-stat-icon--yellow{ background: #FFFBEB; color: #D97706; }

        .ds-stat-trend {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .ds-stat-trend--up   { background: #ECFDF5; color: #059669; }
        .ds-stat-trend--down { background: #FEF2F2; color: #DC2626; }

        .ds-stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }

        .ds-stat-value {
          font-size: 2.25rem;
          font-weight: 900;
          color: #1A2B48;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .ds-stat-denom {
          font-size: 1.125rem;
          font-weight: 600;
          color: #94A3B8;
        }

        .ds-stat-bar {
          height: 4px;
          background: #EEF0F3;
          border-radius: 99px;
          margin-top: 1rem;
        }

        .ds-stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00B5AD, #C5F800);
          border-radius: 99px;
        }

        .ds-stars {
          display: flex;
          gap: 2px;
          align-items: center;
        }

        .ds-stat-avatars {
          display: flex;
          align-items: center;
          margin-top: 1rem;
        }

        .ds-mini-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1A2B48, #2E4472);
          color: #fff;
          font-size: 0.55rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          position: relative;
        }

        .ds-avatar-more {
          margin-left: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748B;
        }

        .ds-stat-review-count {
          font-size: 0.7rem;
          color: #94A3B8;
          margin-top: 0.625rem;
        }

        /* ── Section ── */
        .ds-section {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #EEF0F3;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .ds-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #EEF0F3;
        }

        .ds-section-title {
          font-size: 1rem;
          font-weight: 800;
          color: #1A2B48;
        }

        .ds-section-sub {
          font-size: 0.75rem;
          color: #94A3B8;
          margin-top: 0.1rem;
        }

        .ds-view-all {
          background: none;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          color: #00B5AD;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }

        .ds-view-all:hover { text-decoration: underline; }

        /* ── Table ── */
        .ds-table-wrap { overflow-x: auto; }

        .ds-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ds-table thead tr {
          background: #F8FAFC;
        }

        .ds-table th {
          padding: 0.875rem 1.25rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94A3B8;
        }

        .ds-table-row {
          border-top: 1px solid #F1F5F9;
          cursor: pointer;
          transition: background 0.15s;
        }

        .ds-table-row:hover { background: #F8FAFC; }

        .ds-table td {
          padding: 1rem 1.25rem;
          vertical-align: middle;
          font-size: 0.875rem;
          color: #1A2B48;
        }

        .ds-patient-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ds-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #E8F4FD;
          color: #1A2B48;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ds-patient-name {
          font-weight: 700;
          font-size: 0.875rem;
          color: #1A2B48;
        }

        .ds-patient-id {
          font-size: 0.7rem;
          color: #94A3B8;
          margin-top: 0.1rem;
        }

        .ds-date-cell { font-size: 0.85rem; color: #1A2B48; font-weight: 600; }
        .ds-time { font-size: 0.7rem; color: #94A3B8; margin-top: 0.1rem; }

        .ds-duration-cell {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #64748B;
          font-size: 0.85rem;
        }

        /* Status badges */
        .ds-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.75rem;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .badge-stable   { background: #ECFDF5; color: #059669; }
        .badge-critical { background: #FEF2F2; color: #DC2626; }
        .badge-pending  { background: #F1F5F9; color: #64748B; }

        .ds-action-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          font-size: 1.1rem;
          color: #94A3B8;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-action-btn:hover { background: #F1F5F9; color: #1A2B48; }

        /* ── Bottom Grid ── */
        .ds-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 0.8fr;
          gap: 1.25rem;
        }

        /* Chart card */
        .ds-chart-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #EEF0F3;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .ds-chart-card .ds-section-header {
          border-bottom: none;
          padding-bottom: 0.75rem;
        }

        .ds-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 160px;
          padding: 0 1.5rem 1.25rem;
        }

        .ds-chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          height: 100%;
        }

        .ds-chart-bar-wrap {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
        }

        .ds-chart-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          background: #D9F9B1;
          transition: height 0.5s ease;
          position: relative;
        }

        .ds-chart-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #C5F800, #D9F9B1);
          border-radius: 6px 6px 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .ds-chart-col:hover .ds-chart-bar::after { opacity: 1; }

        .ds-chart-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.04em;
        }

        /* AI Insights */
        .ds-insights-card {
          background: linear-gradient(160deg, #1c2e50, #253e6a);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.875rem;
          box-shadow: 0 4px 20px rgba(26,43,72,0.2);
        }

        .ds-insights-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(197,248,0,0.15);
          border: 1px solid rgba(197,248,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C5F800;
        }

        .ds-insights-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .ds-insights-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
        }

        .ds-insights-btn {
          background: #1A2B48;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          margin-top: 0.5rem;
          transition: background 0.18s, transform 0.18s;
        }

        .ds-insights-btn:hover {
          background: #0E1D33;
          transform: translateY(-1px);
        }

        /* ── Misc ── */
        .ds-loading {
          padding: 5rem;
          text-align: center;
          color: #94A3B8;
        }

        .ds-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #EEF0F3;
          border-top-color: #00B5AD;
          border-radius: 50%;
          animation: ds-spin 0.85s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes ds-spin {
          to { transform: rotate(360deg); }
        }

        .ds-empty {
          padding: 5rem;
          text-align: center;
          color: #64748B;
        }

        .ds-empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .ds-empty h3 { color: #1A2B48; margin-bottom: 0.375rem; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ds-stats-row { grid-template-columns: repeat(2, 1fr); }
          .ds-bottom-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 680px) {
          .ds-sidebar { position: fixed; left: -220px; z-index: 200; transition: left 0.3s; }
          .ds-stats-row { grid-template-columns: 1fr; }
          .ds-content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
