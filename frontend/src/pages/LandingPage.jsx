import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      {/* Premium Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="brand">
            <div className="brand-logo">VS</div>
            <span className="brand-name">VaidyaScribe</span>
          </div>
          <div className="nav-links">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <span className="hero-badge">AI-POWERED MEDICAL SCRIBE</span>
          <h1 className="hero-title">
            Focus on Patients, Not <br />
            <span className="text-glow">Paperwork</span>
          </h1>
          <p className="hero-subtitle">
            VaidyaScribe transforms patient conversations into structured medical notes in seconds. 
            Designed for the modern clinic, built for precision.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Free Trial
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              View Demo
            </button>
          </div>
        </div>
        
        {/* Abstract UI Preview */}
        <div className="hero-preview">
          <div className="preview-card glass">
            <div className="preview-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="preview-body">
              <div className="skeleton-line width-60"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line width-40"></div>
              <div className="skeleton-grid">
                <div className="skeleton-rect"></div>
                <div className="skeleton-rect"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="stats-section">
        <div className="stat-card">
          <span className="stat-value">30s</span>
          <span className="stat-label">Seconds per SOAP note</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">98%</span>
          <span className="stat-label">Transcription Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">2h+</span>
          <span className="stat-label">Daily time saved per Doctor</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Built for Clinical Excellence</h2>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">🎙️</div>
            <h3>Multilingual AI</h3>
            <p>Understands Hindi, Tamil, Bengali, and English natively to capture every clinical detail.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">🛡️</div>
            <h3>HIPAA Compliant</h3>
            <p>End-to-end encrypted sessions ensuring patient data privacy and security.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">⚡</div>
            <h3>Instant SOAP</h3>
            <p>Generates Subjective, Objective, Assessment, and Plan sections automatically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 VaidyaScribe. Professional Medical Intelligence.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-root {
          background-color: var(--bg-body);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1rem 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid var(--border-light);
        }

        .landing-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          background: var(--brand-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(0, 181, 173, 0.25);
        }

        .brand-name {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .hero-section {
          padding: 10rem 2rem 6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          background: radial-gradient(circle at 50% 0%, #E6F0FA 0%, transparent 100%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 850px;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: white;
          color: var(--brand-primary);
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 2rem;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-premium);
        }

        .hero-title {
          font-size: 4.25rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 2rem;
        }

        .text-glow {
          color: var(--brand-primary);
          position: relative;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 1.25rem;
        }

        .hero-preview {
          margin-top: 4rem;
          width: 100%;
          max-width: 950px;
        }

        .preview-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid var(--border-light);
          box-shadow: 0 30px 60px rgba(0,0,0,0.08);
        }

        .preview-header {
          display: flex;
          gap: 8px;
          margin-bottom: 2.5rem;
        }

        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #FF5F56; }
        .dot.yellow { background: #FFBD2E; }
        .dot.green { background: #27C93F; }

        .skeleton-line {
          height: 10px;
          background: #F1F5F9;
          border-radius: 5px;
          margin-bottom: 14px;
        }
        .width-60 { width: 60%; }
        .width-40 { width: 40%; }
        
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 40px;
        }
        .skeleton-rect {
          height: 140px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px solid #F1F5F9;
        }

        .stats-section {
          display: flex;
          justify-content: center;
          gap: 6rem;
          padding: 5rem 2rem;
          background: white;
          border-bottom: 1px solid var(--border-light);
        }

        .stat-card {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 3.25rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .stat-label {
          color: var(--text-tertiary);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .features-section {
          padding: 8rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 4rem;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }

        .feature-card {
          padding: 3rem 2rem;
          background: white;
          border-radius: 24px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-premium);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
          border-color: var(--brand-primary);
        }

        .feature-icon {
          font-size: 2rem;
          width: 56px;
          height: 56px;
          background: #F0FDF4;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.75rem;
        }

        h3 { font-size: 1.35rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary); }
        p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }

        .landing-footer {
          padding: 5rem 2rem;
          text-align: center;
          background: #F8FAFC;
          color: var(--text-tertiary);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .btn-primary {
          background: var(--brand-primary);
          box-shadow: 0 10px 25px rgba(0, 181, 173, 0.2);
        }
        .btn-primary:hover {
          background: var(--brand-primary-dark);
          box-shadow: 0 12px 30px rgba(0, 181, 173, 0.35);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.75rem; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-section { flex-direction: column; gap: 3rem; }
          .hero-preview { display: none; }
        }
      ` }} />
    </div>
  );
}
