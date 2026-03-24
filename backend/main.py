from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from gtts import gTTS
import io
import whisper
import tempfile
import os
from pydub import AudioSegment

app = FastAPI()

whisper_model = whisper.load_model("base")

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


GTTS_LANG_MAP = {
    "en-US": "en", "en-GB": "en", "en-AU": "en", "en-IN": "en",
    "hi-IN": "hi",
    "bn-IN": "bn",
    "ta-IN": "ta",
    "te-IN": "te",
    "kn-IN": "kn",
    "gu-IN": "gu",
    "ml-IN": "ml",
    "mr-IN": "mr",
    "ur-PK": "ur",
    "es-ES": "es", "es-MX": "es",
    "fr-FR": "fr",
    "de-DE": "de",
    "it-IT": "it",
    "pt-BR": "pt", "pt-PT": "pt",
    "ru-RU": "ru",
    "ja-JP": "ja",
    "ko-KR": "ko",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    "ar-SA": "ar",
    "tr-TR": "tr",
    "nl-NL": "nl",
    "pl-PL": "pl",
    "sv-SE": "sv",
    "nb-NO": "no",
    "da-DK": "da",
    "fi-FI": "fi",
    "el-GR": "el",
    "he-IL": "iw",
    "id-ID": "id",
    "ms-MY": "ms",
    "th-TH": "th",
    "vi-VN": "vi",
    "uk-UA": "uk",
    "cs-CZ": "cs",
    "ro-RO": "ro",
    "hu-HU": "hu",
    "sk-SK": "sk",
    "pa-IN": "pa",
}

GTTS_UNSUPPORTED = {"mr-IN", "kn-IN", "te-IN", "gu-IN", "pa-IN"}

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        if request.lang in GTTS_UNSUPPORTED:
            raise HTTPException(
                status_code=400,
                detail=f"TTS is not supported for {request.lang}. STT still works."
            )
        lang_code = GTTS_LANG_MAP.get(request.lang, request.lang[:2])
        tts = gTTS(text=request.text, lang=lang_code)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        print(f"TTS Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}", flush=True)
        audio_bytes = await file.read()

        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(wav_io.read())
            tmp_path = tmp.name

        result = whisper_model.transcribe(tmp_path)
        os.remove(tmp_path)

        detected_lang = result.get("language", "unknown")
        transcribed_text = result.get("text", "").strip()

        print(f"Detected language: {detected_lang}", flush=True)
        print(f"Transcribed: {transcribed_text}", flush=True)

        if not transcribed_text:
            return {
                "text": "[Could not understand the audio]",
                "detected_language": detected_lang
            }

        return {
            "text": transcribed_text,
            "detected_language": detected_lang
        }

    except Exception as e:
        print(f"STT Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))