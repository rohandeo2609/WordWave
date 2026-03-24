from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from gtts import gTTS
import io
import speech_recognition as sr
from pydub import AudioSegment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    lang: str = "en"

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        tts = gTTS(text=request.text, lang=request.lang[:2])
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stt")
async def speech_to_text(file: UploadFile = File(...), lang: str = Form("en-US")):
    try:
        print(f"Received file: {file.filename} for lang: {lang}", flush=True)
        audio_bytes = await file.read()
        
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            
        try:
            text = recognizer.recognize_google(audio_data, language=lang)
            print(f"Transcribed: {text}", flush=True)
            return {"text": text}
        except sr.UnknownValueError:
            print("Speech not recognized", flush=True)
            return {"text": "[Could not understand the audio]"}
            
    except Exception as e:
        print(f"STT Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))