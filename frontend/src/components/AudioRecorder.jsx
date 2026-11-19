import { useState, useRef, useEffect, useCallback } from 'react';

const LANGUAGES = [
  { code: '', label: 'Auto-detect' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'bn', label: '🇮🇳 Bengali' },
  { code: 'te', label: '🇮🇳 Telugu' },
  { code: 'mr', label: '🇮🇳 Marathi' },
  { code: 'kn', label: '🇮🇳 Kannada' },
  { code: 'ml', label: '🇮🇳 Malayalam' },
  { code: 'gu', label: '🇮🇳 Gujarati' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
];

export default function AudioRecorder({ onAudioReady, language, onLanguageChange }) {
  const [mode, setMode] = useState('record'); // 'record' | 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Waveform drawing
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Gradient stroke
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#6179FA');
    grad.addColorStop(0.5, '#DAFB59');
    grad.addColorStop(1, '#6179FA');

    ctx.lineWidth = 2;
    ctx.strokeStyle = grad;
    ctx.beginPath();

    const sliceWidth = w / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set canvas dimensions
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * 2;
        canvasRef.current.height = canvasRef.current.offsetHeight * 2;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setAudioName(file.name);
        onAudioReady(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= 600) { // 10 min limit
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);

      drawWaveform();
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record audio. Please allow access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['mp3', 'wav', 'm4a', 'ogg', 'webm'];
    if (!allowed.includes(ext)) {
      alert(`Unsupported format .${ext}. Please use: ${allowed.join(', ')}`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File too large. Please trim to under 10 minutes (25MB max).');
      return;
    }
    setAudioFile(file);
    setAudioName(file.name);
    onAudioReady(file);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '0.4rem', borderRadius: '14px', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2.5rem' }}>
        <button
          onClick={() => setMode('record')}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
            background: mode === 'record' ? 'white' : 'transparent',
            color: mode === 'record' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            boxShadow: mode === 'record' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🎙️ Record
        </button>
        <button
          onClick={() => setMode('upload')}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
            background: mode === 'upload' ? 'white' : 'transparent',
            color: mode === 'upload' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            boxShadow: mode === 'upload' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          📁 Upload
        </button>
      </div>

      {mode === 'record' ? (
        <div style={{ textAlign: 'center' }}>
          {/* Timer */}
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(duration)}
          </div>

          {/* Waveform */}
          <div style={{ 
            position: 'relative', height: '80px', background: '#F8FAFC', 
            borderRadius: '16px', border: '1px solid var(--border-light)', 
            marginBottom: '2rem', overflow: 'hidden' 
          }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Record button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: 'none',
              background: isRecording ? '#FEF2F2' : 'var(--brand-primary)',
              color: isRecording ? '#EF4444' : 'white',
              fontSize: '1.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: isRecording ? '0 0 0 8px rgba(239, 68, 68, 0.1)' : '0 12px 24px rgba(0, 181, 173, 0.2)',
              animation: isRecording ? 'pulse-red 2s infinite' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {isRecording ? '⏹' : '🎙️'}
          </button>

          {isRecording && (
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Recording Active
            </p>
          )}
        </div>
      ) : (
        <div
          style={{ 
            border: `2px dashed ${dragOver ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
            background: dragOver ? '#F0FDFA' : '#F8FAFC',
            padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>☁️</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {audioName || 'Deploy Clinical Audio'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Support for MP3, WAV, M4A • Maximum 25MB
          </p>
          <input
            id="file-input"
            type="file"
            accept=".mp3,.wav,.m4a,.ogg,.webm"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {audioFile && (
        <div style={{
          marginTop: '2rem', padding: '1rem 1.5rem',
          background: '#F0FDFA', borderRadius: '16px',
          border: '1px solid #CCFBF1',
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
        }}>
          <span style={{ color: '#0D9488' }}>✓</span>
          <span style={{ fontWeight: 800, color: '#0D9488' }}>{audioName}</span>
          <span style={{ color: '#0D9488', opacity: 0.7 }}>File staged for processing</span>
        </div>
      )}

      {/* Language selector */}
      <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expertize Language:</label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{ 
            padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-medium)',
            background: 'white', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem'
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      ` }} />
    </div>
  );
}
