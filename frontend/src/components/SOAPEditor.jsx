import { useState, useEffect } from 'react';

export default function SOAPEditor({ soap, onSoapChange, onRegenerate, onApprove, onExportPDF, onCopy, isApproved }) {
  const [sections, setSections] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (soap) {
      setSections({
        subjective: soap.subjective || '',
        objective: soap.objective || '',
        assessment: soap.assessment || '',
        plan: soap.plan || '',
      });
    }
  }, [soap]);

  const handleChange = (key, value) => {
    const updated = { ...sections, [key]: value };
    setSections(updated);
    onSoapChange?.(updated);
  };

  const totalWords = Object.values(sections)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const handleCopy = async () => {
    const text = `SUBJECTIVE:\n${sections.subjective}\n\nOBJECTIVE:\n${sections.objective}\n\nASSESSMENT:\n${sections.assessment}\n\nPLAN:\n${sections.plan}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
    onCopy?.();
  };

  const sectionConfig = [
    { key: 'subjective', label: 'Subjective', color: '#3B82F6' },
    { key: 'objective', label: 'Objective', color: '#8B5CF6' },
    { key: 'assessment', label: 'Assessment', color: '#F59E0B' },
    { key: 'plan', label: 'Plan', color: '#10B981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {sectionConfig.map(({ key, label, color }) => (
        <div key={key} style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '3px', height: '14px', background: color, borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              {sections[key].length} CHR
            </span>
          </div>
          <textarea
            style={{
              width: '100%', minHeight: '140px', padding: '1.25rem', borderRadius: '16px',
              border: '1px solid var(--border-medium)', background: '#F8FAFC',
              fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)',
              transition: 'all 0.2s', outline: 'none', resize: 'vertical'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = color;
              e.target.style.background = 'white';
              e.target.style.boxShadow = `0 0 0 4px ${color}10`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-medium)';
              e.target.style.background = '#F8FAFC';
              e.target.style.boxShadow = 'none';
            }}
            value={sections[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            disabled={isApproved}
            placeholder={`Enter clinical ${label.toLowerCase()} details...`}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border-light)', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--brand-primary)', marginRight: '0.5rem' }}>📊</span>
          Aggregate Clinical Depth: <span style={{ color: 'var(--text-primary)' }}>{totalWords} Words</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isApproved && (
            <button 
              onClick={onRegenerate}
              style={{ background: 'white', border: '1px solid var(--border-medium)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            >
              ↻ Refine Analysis
            </button>
          )}
          <button 
            onClick={handleCopy}
            style={{ background: 'white', border: '1px solid var(--border-medium)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
          >
            {copySuccess ? '✓ Copied' : '📋 Copy Draft'}
          </button>
          <button 
            onClick={onExportPDF}
            style={{ background: 'white', border: '1px solid var(--border-medium)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
          >
            📄 PDF Report
          </button>
          {!isApproved && (
            <button 
              onClick={() => onApprove?.(sections)}
              style={{ background: 'var(--brand-primary)', border: 'none', padding: '0.6rem 1.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', color: 'white', boxShadow: '0 4px 12px rgba(0, 181, 173, 0.2)' }}
            >
              ✓ Verify & Commit
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
