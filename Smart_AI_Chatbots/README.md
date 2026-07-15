# 🤖 Smart AI Assistant — Final Year College Project

## Project Overview
A production-grade AI Chatbot using NLP and LLM (Google Gemini) that supports:
- Multi-domain chat (Education, Health, Shopping, Coding)
- Multilingual (Hindi + English)
- Voice Input/Output (Speech-to-Text + TTS)
- PDF/Document Analysis
- Web Search Capability
- Image Analysis

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Python FastAPI |
| AI Model | Google Gemini 1.5 Flash (Free) |
| NLP | scikit-learn, NLTK, spaCy |
| Database | MongoDB (optional) |

## Quick Setup

### 1. Get Free API Key
Visit: https://aistudio.google.com/app/apikey

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
GEMINI_API_KEY=your_key python app.py
# API runs at http://localhost:8000
```

### 4. Train ML Model (Optional)
```bash
pip install scikit-learn
python training/train_model.py
```

## Project Structure
```
smart-ai-assistant/
├── frontend/
│   └── src/App.jsx          ← React UI
├── backend/
│   ├── app.py               ← FastAPI server
│   ├── nlp/                 ← NLP utilities
│   └── models/              ← Saved ML models
├── training/
│   └── train_model.py       ← ML training script
├── dataset/
│   └── intents.json         ← Training data
└── README.md
```

## Features
- ✅ Real-time AI chat with Gemini
- ✅ Intent detection (15 intents)
- ✅ Hindi/English multilingual
- ✅ Context memory (last 10 messages)
- ✅ Document analysis
- ✅ Quick prompt buttons
- ✅ Chat history
- ✅ Beautiful dark UI

## College Project Details
- **Topic**: Smart AI Assistant using NLP and LLM
- **Domain**: Artificial Intelligence / NLP
- **Technology**: Python, React.js, Google Gemini API
- **Features**: 8+ (Chat, Voice, Multilingual, Multi-domain)
