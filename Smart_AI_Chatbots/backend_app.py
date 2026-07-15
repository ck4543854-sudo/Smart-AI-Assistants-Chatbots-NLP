# ============================================================
# Smart AI Assistant - Backend API (FastAPI + Python)
# ============================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
import httpx
import os
import re

load_dotenv()

app = FastAPI(title="Smart AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Configuration ----
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in .env file!")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # Free & fast

SYSTEM_PROMPT = """You are NOVA — an intelligent AI assistant. You support:
- General conversation and questions in Hindi and English
- Student help (math, science, history, coding, essays)
- Healthcare info (symptoms, medicines, basic advice — not a replacement for doctors)
- E-commerce guidance (product recommendations, shopping help)
- Web information and current events
- PDF/document analysis when content is provided
Always be friendly, helpful, and educational. Reply in the same language the user writes."""

# ---- Models ----
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7

class IntentRequest(BaseModel):
    text: str

# ---- NLP Utilities ----
def detect_intent(text: str) -> str:
    text_lower = text.lower()
    keywords = {
        "greeting":  ["hello", "hi", "hey", "namaste", "helo", "namaskar"],
        "health":    ["headache", "fever", "medicine", "doctor", "symptom", "beemar", "dard"],
        "shopping":  ["buy", "price", "khareedna", "laptop", "phone", "best", "recommend"],
        "education": ["explain", "what is", "how does", "samjhao", "batao", "kya hai"],
        "coding":    ["python", "java", "code", "program", "function", "error", "debug"],
        "weather":   ["weather", "mausam", "rain", "temperature", "barish"],
    }
    for intent, words in keywords.items():
        if any(w in text_lower for w in words):
            return intent
    return "general"

def detect_language(text: str) -> str:
    hindi_chars = sum(1 for c in text if '\u0900' <= c <= '\u097f')
    return "hindi" if hindi_chars > len(text) * 0.1 else "english"

def extract_entities(text: str) -> dict:
    entities = {
        "emails":  re.findall(r'\b[\w.]+@[\w.]+\.\w+\b', text),
        "phones":  re.findall(r'\b\d{10}\b', text),
        "numbers": re.findall(r'\b\d+\b', text),
    }
    return {k: v for k, v in entities.items() if v}

# ---- Groq API Call ----
async def call_groq(messages: List[Message], temperature: float = 0.7) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "temperature": temperature,
        "max_tokens": 1024,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] +
                    [{"role": m.role, "content": m.content} for m in messages[-10:]]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(GROQ_URL, json=payload, headers=headers)
        data = res.json()

    if "error" in data:
        raise HTTPException(status_code=400, detail=data["error"]["message"])

    return data["choices"][0]["message"]["content"]

# ---- Routes ----
@app.get("/")
def root():
    return {"message": "Smart AI Assistant API is running!", "version": "1.0.0", "model": GROQ_MODEL}

@app.get("/health")
def health():
    return {"status": "ok", "model": GROQ_MODEL}

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        reply = await call_groq(req.messages, req.temperature)
        last_user = req.messages[-1].content if req.messages else ""
        return {
            "reply": reply,
            "intent": detect_intent(last_user),
            "language": detect_language(last_user),
            "entities": extract_entities(last_user)
        }
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Groq API timeout. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-intent")
def analyze_intent(req: IntentRequest):
    return {
        "text": req.text,
        "intent": detect_intent(req.text),
        "language": detect_language(req.text),
        "entities": extract_entities(req.text),
        "word_count": len(req.text.split()),
        "char_count": len(req.text)
    }

@app.post("/analyze-document")
async def analyze_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if file.filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
        else:
            text = f"[Binary file: {file.filename}] — Use a text file for analysis."

        messages = [Message(role="user", content=f"Analyze this document and give a summary:\n\n{text[:3000]}")]
        summary = await call_groq(messages)
        return {"filename": file.filename, "summary": summary, "length": len(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sample-data")
def sample_data():
    return {
        "intents": [
            {"tag": "greeting",  "patterns": ["hello", "hi", "namaste"],       "response": "Hello! Kaise hain aap?"},
            {"tag": "health",    "patterns": ["headache", "fever", "pain"],     "response": "Please consult a doctor."},
            {"tag": "education", "patterns": ["explain", "what is", "batao"],   "response": "Main samjhata hoon..."},
            {"tag": "shopping",  "patterns": ["buy", "price", "best phone"],    "response": "Aapke budget ke hisaab se..."},
            {"tag": "coding",    "patterns": ["python", "code", "error"],       "response": "Let me help debug that..."},
        ],
        "total": 5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    