import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, Play } from 'lucide-react';
const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'zh-CN', name: 'Chinese' }
];

function App() {
  const [selectedLang, setSelectedLang] = useState('en-US');

  // --- TTS State ---
  const [ttsText, setTtsText] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);

  // --- STT State ---
  const [sttRecording, setSttRecording] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttTranscribedText, setSttTranscribedText] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- Handlers ---
  const handleGenerateAudio = async () => {
    if (!ttsText.trim()) return;
    
    setTtsLoading(true);
    setTtsAudioUrl(null);
    try {
      const response = await axios.post(
        'http://localhost:8000/tts',
        { text: ttsText, lang: selectedLang },
        { responseType: 'blob' }
      );
      
      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setTtsAudioUrl(url);
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Failed to generate audio. Is the backend running?');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleToggleRecording = async () => {
    if (sttRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setSttRecording(false);
    } else {
      // Start recording
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
          // Release mic stream
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
    formData.append('lang', selectedLang);

    try {
      const response = await axios.post('http://localhost:8000/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSttTranscribedText(response.data.text || 'No speech detected.');
    } catch (error) {
      console.error('STT Error:', error);
      alert('Failed to transcribe audio. Is the backend running?');
    } finally {
      setSttLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2 gradient-text glow-purple">
          Audio AI Studio
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Synthesize speech from text and transcribe your voice in real-time, beautifully powered by AI.
        </p>
      </header>

      <div className="w-full max-w-6xl flex justify-center mb-8">
        <div className="flex items-center space-x-4 bg-gray-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-gray-800 shadow-xl">
          <label htmlFor="language-select" className="text-gray-300 font-medium">
            Language / Idioma:
          </label>
          <select
            id="language-select"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-neon-purple transition-colors cursor-pointer outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        
        {/* TTS Section */}
        <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-neon-blue/10 rounded-lg">
              <Play className="w-6 h-6 text-neon-blue glow-blue" />
            </div>
            <h2 className="text-2xl font-bold text-white">Text-to-Speech</h2>
          </div>
          
          <textarea
            className="w-full h-40 bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue transition-all resize-none mb-6"
            placeholder="Type some text here to generate audio..."
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
          ></textarea>

          <button
            onClick={handleGenerateAudio}
            disabled={ttsLoading || !ttsText.trim()}
            className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300
              ${ttsLoading || !ttsText.trim() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-gray-950 border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.8)]'
              }`}
          >
            {ttsLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-6 h-6" />
                Generating Audio...
              </>
            ) : (
              'Generate Audio'
            )}
          </button>

          {ttsAudioUrl && (
            <div className="mt-8 p-6 bg-gray-950/50 rounded-2xl border border-gray-800/50 flex flex-col items-center">
              <p className="text-sm text-gray-400 mb-3">Your generated audio</p>
              <audio controls className="w-full custom-audio" src={ttsAudioUrl} autoPlay></audio>
            </div>
          )}
        </section>

        {/* STT Section */}
        <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-neon-purple to-neon-blue opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-neon-purple/10 rounded-lg">
              <Mic className="w-6 h-6 text-neon-purple glow-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white">Speech-to-Text</h2>
          </div>

          <div className="flex flex-col items-center justify-center h-48 mb-6">
            <button
              onClick={handleToggleRecording}
              className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 group
                ${sttRecording 
                  ? 'bg-red-500/20 text-red-500 border border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-pulse-fast' 
                  : 'bg-neon-purple/20 text-neon-purple border border-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.4)] hover:bg-neon-purple/30'
                }`}
            >
              {sttRecording ? (
                <>
                  <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></div>
                  <Square className="w-12 h-12 fill-current" />
                </>
              ) : (
                <Mic className="w-12 h-12 glow-purple" />
              )}
            </button>
            <p className="mt-6 text-gray-400 font-medium">
              {sttRecording ? 'Recording... Tap to Stop' : 'Tap to Start Recording'}
            </p>
          </div>

          <div className="min-h-[160px] bg-gray-950 border border-gray-800 rounded-xl p-6 relative">
            {sttLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neon-purple">
                <Loader2 className="w-10 h-10 animate-spin mb-3 glow-purple" />
                <p className="text-sm font-medium animate-pulse">Transcribing speech...</p>
              </div>
            ) : sttTranscribedText ? (
              <div>
                <p className="text-xs text-neon-purple/70 font-semibold uppercase tracking-wider mb-2">Transcription</p>
                <p className="text-lg text-gray-100 leading-relaxed font-light">"{sttTranscribedText}"</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-600 text-center italic">
                  Your transcribed text will beautifully appear here.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
