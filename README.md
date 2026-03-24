# 🎙️ WordWave

> **Bidirectional Speech-Language Conversion Platform**  
> A full-stack web application enabling real-time Speech-to-Text (STT) and Text-to-Speech (TTS) across 6+ languages, built with FastAPI and React.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Supported Languages](#supported-languages)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Overview

**WordWave** is a full-stack, browser-based application that provides seamless bidirectional audio-language conversion. The system integrates a Python-powered **FastAPI** backend for audio processing and speech synthesis with a **React.js** frontend for an intuitive, responsive user interface.

The platform supports two core functionalities:
- **Speech-to-Text (STT):** Captures spoken input via the browser microphone and transcribes it into text in the user's selected language.
- **Text-to-Speech (TTS):** Accepts text input and synthesizes it into natural-sounding audio output in the chosen language.

This project demonstrates the practical integration of modern web technologies, RESTful API design, and multilingual natural language processing (NLP) in a production-oriented full-stack architecture.

---

## Features

- 🎤 **Real-time Voice Recording** – Captures audio directly from the browser microphone
- 📝 **Speech-to-Text Transcription** – Converts spoken audio to readable text
- 🔊 **Text-to-Speech Synthesis** – Generates natural speech from plain text input
- 🌍 **Multilingual Support** – Supports 6+ languages including English, Hindi, Spanish, French, German, and more
- ⚡ **FastAPI Backend** – Asynchronous, high-performance Python API server
- ⚛️ **React Frontend** – Component-based, responsive UI built with React.js
- 🔄 **Bidirectional Conversion** – Full STT ↔ TTS workflow in a single interface
- 📁 **Audio File Download** – Download synthesized speech as audio files

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, JavaScript (ES6+), HTML5, CSS3 |
| **Backend** | Python 3.x, FastAPI, Uvicorn |
| **Speech Processing** | SpeechRecognition / Whisper (STT), gTTS / pyttsx3 (TTS) |
| **API Communication** | REST API, Axios / Fetch API |
| **Audio Handling** | Web Audio API, MediaRecorder API |
| **Package Management** | pip (backend), npm (frontend) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │              React.js Frontend                   │  │
│   │   ┌──────────────┐     ┌──────────────────────┐  │  │
│   │   │  STT Module  │     │     TTS Module       │  │  │
│   │   │ (Microphone) │     │   (Text Input)       │  │  │
│   │   └──────┬───────┘     └──────────┬───────────┘  │  │
│   └──────────┼──────────────────────────┼─────────────┘  │
└──────────────┼──────────────────────────┼────────────────┘
               │  REST API (HTTP/JSON)     │
               ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Backend (Python)                 │
│                                                         │
│   ┌─────────────────┐     ┌──────────────────────────┐  │
│   │  /transcribe    │     │      /synthesize          │  │
│   │  STT Endpoint   │     │      TTS Endpoint         │  │
│   └────────┬────────┘     └───────────┬──────────────┘  │
│            │                          │                  │
│   ┌────────▼──────────────────────────▼──────────────┐  │
│   │         Speech Processing Layer                  │  │
│   │    (SpeechRecognition / Whisper / gTTS)          │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
WordWave/
├── backend/
│   ├── main.py               # FastAPI application entry point
│   ├── routes/
│   │   ├── stt.py            # Speech-to-Text route handlers
│   │   └── tts.py            # Text-to-Speech route handlers
│   ├── services/
│   │   ├── transcription.py  # Audio transcription logic
│   │   └── synthesis.py      # Speech synthesis logic
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (not committed)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpeechToText.jsx
│   │   │   └── TextToSpeech.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env                  # Frontend environment variables
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system:

- **Python** 3.8 or higher
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **pip** (Python package manager)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment (recommended)
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start the FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`  
Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start the React development server
npm start
```

The frontend application will be available at: `http://localhost:3000`

> **Note:** Ensure the backend server is running before launching the frontend. Configure the backend API base URL in `frontend/.env` if needed.

---

## API Reference

### `POST /transcribe`

Accepts an audio file and returns the transcribed text.

| Field | Type | Description |
|---|---|---|
| `audio` | `File` | Audio file (WAV, MP3, WebM) |
| `language` | `string` | Target language code (e.g., `en-US`, `hi-IN`) |

**Response:**
```json
{
  "transcription": "Hello, how are you?",
  "language": "en-US",
  "confidence": 0.97
}
```

---

### `POST /synthesize`

Accepts text input and returns a synthesized audio file.

| Field | Type | Description |
|---|---|---|
| `text` | `string` | Text to be converted to speech |
| `language` | `string` | Target language code (e.g., `fr-FR`, `es-ES`) |

**Response:**  
Returns an audio stream (`audio/mpeg`) with `Content-Disposition: attachment`.

---

## Supported Languages

| Language | Code |
|---|---|
| English | `en-US` |
| Hindi | `hi-IN` |
| Spanish | `es-ES` |
| French | `fr-FR` |
| German | `de-DE` |
| Japanese | `ja-JP` |

> Additional languages may be supported depending on the underlying speech engine configuration.

---

## Future Enhancements

- [ ] Real-time streaming transcription via WebSockets
- [ ] User authentication and session management
- [ ] Conversation history and export functionality
- [ ] Integration with OpenAI Whisper for higher accuracy STT
- [ ] Custom voice profiles for TTS synthesis
- [ ] Mobile-responsive Progressive Web App (PWA) support
- [ ] Docker containerization for streamlined deployment
- [ ] Cloud deployment on platforms such as Render, Railway, or AWS

---

## Author

**Rohan Deo**  
B.Tech Computer Science Engineering  
GitHub: [@rohandeo2609](https://github.com/rohandeo2609)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

> *WordWave — Bridging the gap between voice and text, one language at a time.*
