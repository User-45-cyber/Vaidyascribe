import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPostForm, apiPost } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import AudioRecorder from '../components/AudioRecorder';
import SOAPEditor from '../components/SOAPEditor';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NewConsultationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State machine: idle → audioReady → transcribing → transcribed → generating → soapReady → approved
  const [stage, setStage] = useState('idle');
  const [language, setLanguage] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [soap, setSoap] = useState(null);
  const [patientRef, setPatientRef] = useState('');
  const [error, setError] = useState('');
  const [transcribeTime, setTranscribeTime] = useState(0);
  const [soapTime, setSoapTime] = useState(0);

  const handleAudioReady = useCallback((file) => {
    setAudioFile(file);
    setStage('audioReady');
    setError('');
  }, []);

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setStage('transcribing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      if (language) formData.append('language', language);

      const data = await apiPostForm('/api/transcribe', formData);
      setTranscript(data.transcript);
      setDetectedLang(data.language_detected || language || 'auto');
      setSessionId(data.session_id);
      setTranscribeTime(data.transcription_time_ms || 0);
      setStage('transcribed');
    } catch (err) {
      setError(err.message);
      setStage('audioReady');
    }
  };

  const handleGenerateSOAP = async () => {
    if (!transcript) return;
    setStage('generating');
    setError('');

    try {
      const data = await apiPost('/api/generate-soap', {
        session_id: sessionId,
        transcript,
        doctor_specialisation: user?.specialisation || '',
      });
      setSoap(data.soap);
      setSoapTime(data.generation_time_ms || 0);
      setStage('soapReady');
    } catch (err) {
      setError(err.message);
      setStage('transcribed');
    }
  };

  const handleRegenerate = () => {
    setStage('transcribed');
    setSoap(null);
    handleGenerateSOAP();
  };

  const handleApprove = async (editedSoap) => {
    try {
      const userId = localStorage.getItem('vs_user_id') || 'demo_doctor';
      await apiPost('/api/sessions', {
        session_id: sessionId,
        transcript,
        soap: editedSoap || soap,
        language: detectedLang,
        patient_ref: patientRef,
        doctor_id: userId,
      });
      setStage('approved');
    } catch (err) {
      setError('Save failed: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await apiPost('/api/export/pdf', {
        session_id: sessionId,
        clinic_name: user?.clinic_name || 'VaidyaScribe Clinic',
        doctor_name: user?.full_name || 'Dr. Demo',
        registration_number: user?.registration_number || '',
        patient_ref: patientRef,
        soap: soap,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaidyascribe_${sessionId || 'note'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    }
  };

  const showPanel2 = ['transcribing', 'transcribed', 'generating', 'soapReady', 'approved'].includes(stage);
  const showPanel3 = ['generating', 'soapReady', 'approved'].includes(stage);

  return (
    <div className="consultation-root" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Navbar />
      <div style={{ padding: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            New Clinical Consultation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>
            Harnessing AI to capture ultra-precise patient interactions.
          </p>
        </header>

        {error && (
          <div style={{
            padding: '1rem 1.5rem', marginBottom: '2.5rem',
            background: '#FEF2F2', border: '1px solid #FEE2E2',
            borderRadius: '16px', color: '#B91C1C',
            fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ── Panel 1: Record / Upload ──────────────────────────── */}
          <section style={{ 
            background: 'white', border: '1px solid var(--border-light)', borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', background: 'var(--brand-primary)', color: 'white', 
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                }}>1</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Patient Interaction</h3>
              </div>
              {stage !== 'idle' && stage !== 'audioReady' && (
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem' }}>✓ Captured</span>
              )}
            </div>
            <div style={{ padding: '2.5rem 2rem' }}>
              <AudioRecorder
                onAudioReady={handleAudioReady}
                language={language}
                onLanguageChange={setLanguage}
              />

              {(stage === 'audioReady') && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleTranscribe}
                    style={{ padding: '0.9rem 2.5rem', borderRadius: '14px', fontWeight: 800, fontSize: '1rem' }}
                  >
                    🎯 Begin Transcription
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── Panel 2: Transcript ─────────────────────────────── */}
          {showPanel2 && (
            <section style={{ 
              background: 'white', border: '1px solid var(--border-light)', borderRadius: '24px', 
              boxShadow: 'var(--shadow-premium)', overflow: 'hidden', animation: 'slideDown 0.4s cubic-bezier(0, 0, 0.2, 1)'
            }}>
              <div style={{ 
                padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', background: 'var(--brand-primary)', color: 'white', 
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                  }}>2</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Clinical Transcript</h3>
                </div>
                {transcribeTime > 0 && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', background: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                    {(transcribeTime / 1000).toFixed(1)}s Processing
                  </span>
                )}
              </div>
              <div style={{ padding: '2.5rem 2rem' }}>
                {stage === 'transcribing' ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <LoadingSpinner text="Processing Audio Intelligence..." />
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', 
                      border: '1px solid var(--border-light)', lineHeight: 1.8, color: 'var(--text-primary)',
                      fontSize: '1rem', fontStyle: transcript ? 'normal' : 'italic'
                    }}>
                      {transcript || 'Awaiting transcription output...'}
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>🌐 {detectedLang?.toUpperCase() || 'AUTO'} DETECTED</span>
                      {stage === 'transcribed' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={handleGenerateSOAP}
                          style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800 }}
                        >
                          ✨ Generate SOAP Model
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* ── Panel 3: SOAP Editor ─────────────────────────────── */}
          {showPanel3 && (
            <section style={{ 
              background: 'white', border: '1px solid var(--border-light)', borderRadius: '24px', 
              boxShadow: 'var(--shadow-premium)', overflow: 'hidden', animation: 'slideDown 0.4s cubic-bezier(0, 0, 0.2, 1)'
            }}>
              <div style={{ 
                padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', background: 'var(--brand-primary)', color: 'white', 
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                  }}>3</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>SOAP Documentation</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {soapTime > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', background: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                      {(soapTime / 1000).toFixed(1)}s AI Inference
                    </span>
                  )}
                  {stage === 'approved' && (
                    <span style={{ background: '#ECFDF5', color: '#059669', padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800 }}>✓ VERIFIED</span>
                  )}
                </div>
              </div>
              <div style={{ padding: '2.5rem 2rem' }}>
                {stage === 'generating' ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <LoadingSpinner text="Generating Clinical Model..." />
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '2.5rem', maxWidth: '400px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                        Patient Reference Identifier
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                          border: '1px solid var(--border-medium)', background: '#F8FAFC',
                          fontSize: '0.95rem', fontWeight: 600
                        }}
                        placeholder="e.g. PAT-99-XJ"
                        value={patientRef}
                        onChange={(e) => setPatientRef(e.target.value)}
                      />
                    </div>

                    <SOAPEditor
                      soap={soap}
                      onSoapChange={setSoap}
                      onRegenerate={handleRegenerate}
                      onApprove={handleApprove}
                      onExportPDF={handleExportPDF}
                      isApproved={stage === 'approved'}
                    />

                    {stage === 'approved' && (
                      <div style={{
                        marginTop: '3rem', textAlign: 'center', padding: '3rem 2rem',
                        background: '#F0FDF4', borderRadius: '24px',
                        border: '1px solid #DCFCE7',
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ color: '#065F46', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>Documentation Finalized</h3>
                        <p style={{ color: '#065F46', opacity: 0.8, fontSize: '1rem', fontWeight: 500, marginBottom: '2.5rem' }}>
                          This consultation has been securely saved to your clinical history.
                        </p>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.9rem 2.5rem', borderRadius: '12px', fontWeight: 800 }}
                          onClick={() => navigate('/dashboard')}
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
