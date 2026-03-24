import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, Play, Pause, ChevronDown, Check, Globe } from 'lucide-react';
import './App.css';

const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'zh-CN', name: 'Chinese' }
];

const sttLanguageGroups = {
  "Indian Languages": [
    { code: "hi-IN", name: "Hindi" },
    { code: "mr-IN", name: "Marathi" },
    { code: "bn-IN", name: "Bengali" },
    { code: "ta-IN", name: "Tamil" },
    { code: "te-IN", name: "Telugu" },
    { code: "kn-IN", name: "Kannada" },
    { code: "ml-IN", name: "Malayalam" },
    { code: "gu-IN", name: "Gujarati" },
    { code: "pa-IN", name: "Punjabi" }
  ],
  "Global Languages": [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "en-AU", name: "English (Australia)" },
    { code: "en-IN", name: "English (India)" },
    { code: "ur-PK", name: "Urdu" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "es-MX", name: "Spanish (Mexico)" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "pt-PT", name: "Portuguese (Portugal)" },
    { code: "ru-RU", name: "Russian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "ar-SA", name: "Arabic" },
    { code: "tr-TR", name: "Turkish" },
    { code: "nl-NL", name: "Dutch" },
    { code: "pl-PL", name: "Polish" },
    { code: "sv-SE", name: "Swedish" },
    { code: "nb-NO", name: "Norwegian" },
    { code: "da-DK", name: "Danish" },
    { code: "fi-FI", name: "Finnish" },
    { code: "el-GR", name: "Greek" },
    { code: "he-IL", name: "Hebrew" },
    { code: "id-ID", name: "Indonesian" },
    { code: "ms-MY", name: "Malay" },
    { code: "th-TH", name: "Thai" },
    { code: "vi-VN", name: "Vietnamese" },
    { code: "uk-UA", name: "Ukrainian" },
    { code: "cs-CZ", name: "Czech" },
    { code: "ro-RO", name: "Romanian" },
    { code: "hu-HU", name: "Hungarian" },
    { code: "sk-SK", name: "Slovak" }
  ]
};

// Reusable Hook for Scroll Reveal
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
};

// Custom Audio Player Component for TTS
const CustomAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.play().catch(e => console.error("Autoplay prevented:", e));
      setIsPlaying(true);
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  return (
    <div className="custom-audio-player fade-in-up">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        onTimeUpdate={handleTimeUpdate}
      />
      <button className="play-pause-btn" onClick={togglePlay}>
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '4px' }} />}
      </button>
      <div className="audio-track">
        <div className="audio-progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

// Hero Canvas Visualizer
const AudioVisualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      
      for (let i = 0; i < width; i++) {
        // Create a gentle wave effect
        const y = height / 2 + Math.sin(i * 0.02 + time) * 30 * Math.sin(time * 0.5) + Math.cos(i * 0.01 - time * 1.2) * 15;
        ctx.lineTo(i, y);
      }

      ctx.strokeStyle = 'rgba(94, 92, 230, 0.4)'; // soft violet/blue
      ctx.lineWidth = 2;
      ctx.stroke();

      time += 0.05;
      animationId = requestAnimationFrame(render);
    };
    
    // Set internal resolution
    canvas.width = window.innerWidth * 0.8;
    canvas.height = 150;
    
    render();

    const handleResize = () => {
      canvas.width = window.innerWidth * 0.8;
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-visualizer" />;
};

function App() {
  useScrollReveal();

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('stt'); // 'stt' | 'tts'
  const langDropdownRef = useRef(null);

  // STT Custom Dropdown State
  const [sttLang, setSttLang] = useState("en-US");
  const [sttDropdownOpen, setSttDropdownOpen] = useState(false);
  const sttDropdownRef = useRef(null);

  // STT State
  const [sttRecording, setSttRecording] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttTranscribedText, setSttTranscribedText] = useState('');
  
  // TTS State
  const [ttsText, setTtsText] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (sttDropdownRef.current && !sttDropdownRef.current.contains(e.target)) {
        setSttDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Handlers ---
  const handleToggleRecording = async () => {
    if (sttRecording) {
      mediaRecorderRef.current.stop();
      setSttRecording(false);
    } else {
      setSttTranscribedText('');
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          sendAudioForTranscription(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setSttRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Microphone permission denied or unavailable.');
      }
    }
  };

  const sendAudioForTranscription = async (blob) => {
    setSttLoading(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('language', sttLang);

    try {
      const response = await axios.post('http://localhost:8000/stt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSttTranscribedText(response.data.text || 'No speech detected.');
    } catch (error) {
      console.error('STT Error:', error);
      alert('Failed to transcribe audio. Is the backend running?');
    } finally {
      setSttLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true);
    setTtsAudioUrl(null);
    try {
      const response = await axios.post(
        'http://localhost:8000/tts',
        { text: ttsText, lang: selectedLang.code },
        { responseType: 'blob' }
      );
      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setTtsAudioUrl(url);
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Failed to generate audio.');
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">WordWave</div>
        
        {/* Language Selector Custom Dropdown */}
        <div className="lang-selector-wrapper" ref={langDropdownRef}>
          <button 
            className="lang-selector-btn" 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          >
            <Globe size={16} />
            {selectedLang.name}
            <ChevronDown size={14} style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
          
          <div className={`lang-dropdown-menu ${langDropdownOpen ? 'open' : ''}`}>
            {languages.map((lang) => (
              <button 
                key={lang.code}
                className={`lang-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLang(lang);
                  setLangDropdownOpen(false);
                }}
              >
                {lang.name}
                {selectedLang.code === lang.code && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <AudioVisualizer />
        
        <div className="hero-content">
          <h1 className="hero-headline fade-in-up">Your Voice.<br/>Any Language.</h1>
          <p className="hero-subheadline fade-in-up delay-200">
            Advanced AI models to synthesize natural speech and transcribe your voice in real-time, beautifully integrated.
          </p>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hero-cta fade-in-up delay-400">
            Get Started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="feature-section reveal-on-scroll">
        <div className="feature-header">
          <h2 className="feature-title">Powerful Capabilities</h2>
          <p className="feature-subtitle">Choose your interaction mode.</p>
        </div>

        {/* Toggle Control (Apple Segmented Style) */}
        <div className="mode-toggle-container">
          <div className="mode-toggle">
            <div className="mode-toggle-indicator" style={{ transform: activeMode === 'stt' ? 'translateX(0)' : 'translateX(100%)' }}></div>
            <button 
              className={`mode-toggle-btn ${activeMode === 'stt' ? 'active' : ''}`}
              onClick={() => setActiveMode('stt')}
            >
              Speech-to-Text
            </button>
            <button 
              className={`mode-toggle-btn ${activeMode === 'tts' ? 'active' : ''}`}
              onClick={() => setActiveMode('tts')}
            >
              Text-to-Speech
            </button>
          </div>
        </div>

        {/* Dynamic Context */}
        <div className="glass-card reveal-on-scroll" style={{ minHeight: '400px' }}>
          
          {/* STT View */}
          {activeMode === 'stt' && (
            <div className="fade-in-up">
              <div className="mic-container">

                <div className="lang-selector-wrapper" ref={sttDropdownRef} style={{ marginBottom: '40px', zIndex: 20 }}>
                  <button 
                    className="lang-selector-btn" 
                    onClick={() => setSttDropdownOpen(!sttDropdownOpen)}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '30px' }}
                  >
                    <Globe size={16} />
                    {Object.values(sttLanguageGroups).flat().find(l => l.code === sttLang)?.name || 'English (US)'}
                    <ChevronDown size={14} style={{ transform: sttDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </button>
                  
                  <div className={`lang-dropdown-menu ${sttDropdownOpen ? 'open' : ''}`} style={{ width: '280px', maxHeight: '350px', overflowY: 'auto', left: '50%', transform: sttDropdownOpen ? 'translate(-50%, 0)' : 'translate(-50%, -10px)', zIndex: 30 }}>
                    {Object.entries(sttLanguageGroups).map(([groupName, langs]) => (
                      <div key={groupName} style={{ marginBottom: '8px' }}>
                        <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {groupName}
                        </div>
                        {langs.map((lang) => (
                          <button 
                            key={lang.code}
                            className={`lang-option ${sttLang === lang.code ? 'active' : ''}`}
                            onClick={() => {
                              setSttLang(lang.code);
                              setSttDropdownOpen(false);
                            }}
                          >
                            {lang.name}
                            {sttLang === lang.code && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mic-btn-wrapper">
                  <div className="mic-ring"></div>
                  <button 
                    className={`mic-btn ${sttRecording ? 'recording' : ''}`}
                    onClick={handleToggleRecording}
                  >
                    {sttRecording ? <Square size={32} fill="currentColor" /> : <Mic size={36} />}
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                  {sttRecording ? 'Recording... tap to stop.' : 'Tap to start recording.'}
                </p>

                <div className={`stt-output ${!sttTranscribedText && !sttLoading ? 'empty' : ''}`}>
                  {sttLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Loader2 className="loading-spinner" style={{ marginBottom: '8px' }} size={32} />
                      <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Transcribing...</span>
                    </div>
                  ) : sttTranscribedText ? (
                    sttTranscribedText
                  ) : (
                    "Your transcription will appear here."
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TTS View */}
          {activeMode === 'tts' && (
            <div className="fade-in-up">
              <div className="tts-input-area">
                <textarea
                  className="minimal-textarea"
                  placeholder="Enter text to synthesize..."
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                ></textarea>
                
                <div className="action-row">
                  <button 
                    className="primary-btn"
                    onClick={handleGenerateAudio}
                    disabled={ttsLoading || !ttsText.trim()}
                  >
                    {ttsLoading ? <Loader2 className="loading-spinner" size={20} /> : <Play size={20} fill="currentColor" />}
                    {ttsLoading ? 'Generating...' : 'Generate Audio'}
                  </button>
                </div>

                {ttsAudioUrl && <CustomAudioPlayer src={ttsAudioUrl} />}
              </div>
            </div>
          )}
          
        </div>
      </section>
      
      {/* Footer Buffer */}
      <div style={{ paddingBottom: '100px' }}></div>
      
    </div>
  );
}

export default App;
