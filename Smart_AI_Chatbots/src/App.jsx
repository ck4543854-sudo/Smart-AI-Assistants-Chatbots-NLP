import { useState, useRef, useEffect, useCallback } from "react";

// ─── AUTH HELPERS ──────────────────────────────────────────────────────────────
const getUsers = () => JSON.parse(localStorage.getItem("nova_users") || "[]");
const saveUsers = (users) => localStorage.setItem("nova_users", JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem("nova_session") || "null");
const saveSession = (user) => localStorage.setItem("nova_session", JSON.stringify(user));
const clearSession = () => localStorage.removeItem("nova_session");
// ──────────────────────────────────────────────────────────────────────────────

// ─── AUTH SCREEN (Login + Signup) ─────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please enter both email and password!"); return; }
    const users = getUsers();
    const user = users.find(u => u.email === form.email.toLowerCase());
    if (!user) { setError("Account not found. Please sign up first!"); return; }
    if (user.password !== btoa(form.password)) { setError("Incorrect password!"); return; }
    saveSession(user);
    onLogin(user);
  };

  const handleSignup = () => {
    setError("");
    if (!form.name.trim()) { setError("Please enter your name!"); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email!"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters!"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match!"); return; }
    const users = getUsers();
    if (users.find(u => u.email === form.email.toLowerCase())) {
      setError("This email is already registered. Please log in."); return;
    }
    const newUser = {
      id: Date.now().toString(),
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      password: btoa(form.password),
      avatar: "👤",
      createdAt: new Date().toLocaleDateString()
    };
    saveUsers([...users, newUser]);
    saveSession(newUser);
    setSuccess("Account created successfully! 🎉");
    setTimeout(() => onLogin(newUser), 800);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10,
    padding: "13px 16px", color: "#e2e8f0", fontSize: 12,
    boxSizing: "border-box", outline: "none", fontFamily: "inherit"
  };
  const labelStyle = { fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 0.8, marginBottom: 6, display: "block" };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0c0c18", fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 20, position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .auth-input:focus { border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
        .auth-tab:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.03)", borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.09)",
        padding: "36px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.5s cubic-bezier(.4,0,.2,1)",
        maxHeight: "95vh", overflowY: "auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 8px 28px rgba(124,58,237,0.45)"
          }}>🤖</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.5px" }}>NOVA AI</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Smart AI Assistant</div>
        </div>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid rgba(255,255,255,0.07)" }}>
          {["login", "signup"].map(tab => (
            <button key={tab} className="auth-tab" onClick={() => { setMode(tab); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14, transition: "all 0.2s",
              background: mode === tab ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "transparent",
              color: mode === tab ? "#fff" : "#64748b"
            }}>{tab === "login" ? "🔐 Login" : "✨ Sign Up"}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f87171", animation: "slideInRight 0.2s ease" }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#4ade80", animation: "slideInRight 0.2s ease" }}>
            ✅ {success}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>FULL NAME</label>
              <input className="auth-input" style={inputStyle} placeholder="Enter your full name" value={form.name}
                onChange={e => set("name", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} />
            </div>
          )}
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input className="auth-input" style={inputStyle} type="email" placeholder="email@example.com" value={form.email}
              onChange={e => set("email", e.target.value)} onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
          </div>
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input className="auth-input" style={{ ...inputStyle, paddingRight: 44 }}
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "Min 8 characters" : "Password"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
              <button onClick={() => setShowPass(!showPass)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748b"
              }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>CONFIRM PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input className="auth-input" style={{ ...inputStyle, paddingRight: 44 }}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password" value={form.confirm}
                  onChange={e => set("confirm", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignup()} />
                <button onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748b"
                }}>{showConfirm ? "🙈" : "👁️"}</button>
              </div>
              {form.confirm.length > 0 && (
                <div style={{ fontSize: 11, marginTop: 5, color: form.password === form.confirm ? "#4ade80" : "#f87171" }}>
                  {form.password === form.confirm ? "✅ Passwords match!" : "❌ Passwords do not match"}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          style={{
            width: "100%", marginTop: 24,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            border: "none", borderRadius: 14, padding: "14px",
            color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(124,58,237,0.4)", transition: "all 0.2s"
          }}
        >
          {mode === "login" ? "Login →" : "Create Account →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#64748b" }}>
          {mode === "login" ? (
            <>New here?{" "}
              <span onClick={() => { setMode("signup"); setError(""); }} style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}>Sign Up</span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span onClick={() => { setMode("login"); setError(""); }} style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}>Log in</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ─── OLLAMA CONSTANTS ──────────────────────────────────────────────────────────
const OLLAMA_DEFAULT_MODEL = "phi3:mini.2";
// ──────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are NOVA — an intelligent AI assistant built as a college project. You support:
- General conversation and questions
- Student help (math, science, history, coding, essays)
- Healthcare info (symptoms, medicines, basic advice)
- E-commerce guidance (product recommendations, shopping help)
- Web searches (provide up-to-date info when asked)
- Image analysis (describe what you see when images are shared)
- Always respond in English.
Always be helpful, friendly, and educational.`;

const QUICK_PROMPTS = [
  { icon: "🎓", label: "College Help", text: "Explain machine learning concepts to me" },
  { icon: "🏥", label: "Health FAQ", text: "What should I do for a headache?" },
  { icon: "🛒", label: "Shopping Bot", text: "What is the best laptop on a budget?" },
  { icon: "💻", label: "Code Help", text: "Explain sorting algorithms in Python" },
  { icon: "🌐", label: "Current Info", text: "What are the latest AI trends in 2024?" },
  { icon: "📝", label: "Essay Writer", text: "Write a short essay on climate change" },
];

const AVATARS = ["👤", "🧑", "👩", "🧑‍💻", "👨‍🎓", "👩‍🔬", "🧙", "🦸"];

function TypingIndicator({ theme }) {
  const c = theme === "dark" ? "#a78bfa" : "#7c3aed";
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: c,
          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const colors = { success: "#22c55e", error: "#ef4444", info: "#6366f1" };
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 999,
      background: colors[type] || "#6366f1",
      color: "#fff", borderRadius: 12, padding: "12px 20px",
      fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      animation: "slideInRight 0.3s ease", display: "flex", alignItems: "center", gap: 8
    }}>
      {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} {msg}
      <span onClick={onClose} style={{ cursor: "pointer", opacity: 0.7, marginLeft: 8 }}>✕</span>
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>;
  });
}

function Message({ msg, theme, userAvatar }) {
  const isUser = msg.role === "user";
  const isDark = theme === "dark";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 20, animation: "fadeSlideIn 0.35s cubic-bezier(.4,0,.2,1)",
      padding: "0 4px"
    }}>
      {!isUser && (
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0, marginRight: 10, marginTop: 2,
          boxShadow: isDark ? "0 2px 12px rgba(124,58,237,0.4)" : "0 2px 12px rgba(124,58,237,0.25)"
        }}>🤖</div>
      )}
      <div style={{ maxWidth: "76%" }}>
        <div style={{
          background: isUser
            ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
            : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          color: isUser ? "#fff" : isDark ? "#e2e8f0" : "#1e293b",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          padding: "13px 17px", fontSize: 14, lineHeight: 1.65,
          border: isUser ? "none" : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          whiteSpace: "normal", wordBreak: "break-word",
          boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.08)"
        }}>
          {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 8, display: "block" }} />}
          {msg.video && <video src={msg.video} controls style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 8, display: "block" }} />}
          {renderMarkdown(msg.content)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.45, marginTop: 5, textAlign: isUser ? "right" : "left", paddingLeft: isUser ? 0 : 4 }}>
          {msg.time}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 19, flexShrink: 0, marginLeft: 10, marginTop: 2,
          border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)"
        }}>{userAvatar}</div>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(getSession());
  const [theme, setTheme] = useState(localStorage.getItem("nova_theme") || "dark");
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("nova_avatar") || "👤");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! 🙏 I'm NOVA — your Smart AI Assistant.\n\nI can help you with:\n• 🎓 Studies & Coding\n• 🏥 Health Questions\n• 🛒 Shopping Guidance\n• 🌐 Current Information\n• 🖼️ Image & Video Analysis\n• 🎤 Voice Input & Output\n\nAsk me anything! 😊",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem("groq_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modeLabel, setModeLabel] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Gemini key state
  const [geminiKeyInput, setGeminiKeyInput] = useState(localStorage.getItem("gemini_key") || "");

  // ─── OLLAMA STATE ────────────────────────────────────────────────────────────
  const [aiProvider, setAiProvider] = useState(localStorage.getItem("nova_provider") || "groq");
  const [ollamaUrl, setOllamaUrl] = useState(localStorage.getItem("ollama_url") || "http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState(localStorage.getItem("ollama_model") || OLLAMA_DEFAULT_MODEL);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState("unknown"); // "unknown" | "connected" | "error"
  // ─── OLLAMA VISION MODEL ─────────────────────────────────────────────────────
  const [ollamaVisionModel, setOllamaVisionModel] = useState(
    localStorage.getItem("ollama_vision_model") || "llava"
  );
  // ────────────────────────────────────────────────────────────────────────────

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoFileRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const dropdownRef = useRef(null);

  const isDark = theme === "dark";

  const T = {
    bg: isDark ? "#0c0c18" : "#f0f0f8",
    sidebar: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
    sidebarBorder: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
    border: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)",
    text: isDark ? "#e2e8f0" : "#1e293b",
    subtext: isDark ? "#64748b" : "#94a3b8",
    input: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)",
    inputBorder: isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.13)",
    hover: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
    accent: "#7c3aed",
    accentLight: "#a78bfa",
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (!showCamera && cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }, [showCamera]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showSettings) {
      setGeminiKeyInput(localStorage.getItem("gemini_key") || "");
      if (aiProvider === "ollama") {
        fetchOllamaModels(ollamaUrl, false);
      }
    }
  }, [showSettings]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("nova_theme", next);
    showToast(`${next === "dark" ? "🌙 Dark" : "☀️ Light"} mode activated!`, "info");
  };

  const showToast = (msg, type = "info") => setToast({ msg, type });

  const saveKey = () => {
    localStorage.setItem("groq_key", apiKey);
    setShowKeyInput(false);
    showToast("Groq API Key saved!", "success");
  };

  const saveGeminiKey = () => {
    localStorage.setItem("gemini_key", geminiKeyInput);
    showToast("Gemini API Key saved! 🖼️", "success");
  };

  // ─── OLLAMA HELPERS ──────────────────────────────────────────────────────────
  const fetchOllamaModels = async (baseUrl, showSuccessToast = true) => {
    try {
      const res = await fetch(`${baseUrl}/api/tags`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const names = (data.models || []).map(m => m.name);
      setOllamaModels(names);
      setOllamaStatus("connected");
      if (names.length > 0) {
        const saved = localStorage.getItem("ollama_model");
        if (!saved || !names.includes(saved)) {
          setOllamaModel(names[0]);
          localStorage.setItem("ollama_model", names[0]);
        }
      }
      if (showSuccessToast) {
        showToast(names.length > 0 ? `✅ ${names.length} model(s) found!` : "✅ Ollama connected (no models installed)", "success");
      }
      return names;
    } catch (err) {
      setOllamaStatus("error");
      setOllamaModels([]);
      if (showSuccessToast) {
        showToast("❌ Ollama connect nahi hua. kya 'ollama serve' run hai?", "error");
      }
      return [];
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  const speakText = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "hi-IN";
    utter.rate = 0.95;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes("hi")) || voices[0];
    if (hindiVoice) utter.voice = hindiVoice;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("Please use Chrome for voice input!", "error"); return; }
    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); showToast("🎤 Listening...", "info"); };
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); showToast("Voice error!", "error"); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  // ─── IMAGE UPLOAD (Groq + Ollama vision support) ──────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      const imageUrl = ev.target.result;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, { role: "user", content: "📷 Image sent — analyzing...", image: imageUrl, time }]);
      setLoading(true);
      showToast("Analyzing image...", "info");

      try {
        let reply = "";

        if (aiProvider === "ollama") {
          // ── Ollama Vision (llava) ────────────────────────────────────────
          const visionModel = localStorage.getItem("ollama_vision_model") || "llava";
          const res = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: visionModel,
              prompt: "Analyze this image and describe it in detail.",
              images: [base64],
              stream: false
            })
          });
          if (!res.ok) throw new Error(`Ollama error ${res.status}`);
          const data = await res.json();
          reply = data.response || "Ollama se koi response nahi mila.";
          // ────────────────────────────────────────────────────────────────

        } else {
          // ── Gemini Vision ────────────────────────────────────────────────
          const key = localStorage.getItem("gemini_key") || "";
          if (!key) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "⚠️ Gemini API key required for image analysis!\n\n👉 Settings → 🖼️ GEMINI KEY mein key daalo aur Save karo.\n\nFree key: https://aistudio.google.com/app/apikey",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }]);
            setLoading(false);
            return;
          }
          const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [
                { text: "Analyze this image and describe it in detail." },
                { inline_data: { mime_type: file.type, data: base64 } }
              ]}]
            })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze image.";
          // ────────────────────────────────────────────────────────────────
        }

        setMessages(prev => [...prev, {
          role: "assistant", content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        speakText(reply.slice(0, 200));
        showToast("Image analyzed!", "success");

      } catch (err) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `❌ Image analysis failed: ${err.message}\n\n${
            aiProvider === "ollama"
              ? `Check karo:\n• ollama serve chal raha hai?\n• llava model installed hai? Run: ollama pull llava\n• URL sahi hai: ${ollamaUrl}\n• CORS allowed hai (OLLAMA_ORIGINS=*)`
              : "Check your Gemini API key in Settings."
          }`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        showToast("Image error!", "error");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev,
      { role: "user", content: "🎥 Video uploaded", video: url, time },
      { role: "assistant", content: "✅ Video uploaded successfully! You can play it now.", time }
    ]);
    showToast("Video uploaded!", "success");
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch { showToast("Please allow camera access!", "error"); }
  };

  // ─── CAPTURE PHOTO (Groq + Ollama vision support) ────────────────────────
  const capturePhoto = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const imageUrl = canvas.toDataURL("image/jpeg");
    const base64 = imageUrl.split(",")[1];
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setShowCamera(false);
    setMessages(prev => [...prev, { role: "user", content: "📸 Photo captured from camera", image: imageUrl, time }]);
    setLoading(true);

    try {
      let reply = "";

      if (aiProvider === "ollama") {
        // ── Ollama Vision ──────────────────────────────────────────────────
        const visionModel = localStorage.getItem("ollama_vision_model") || "llava";
        const res = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: visionModel,
            prompt: "Analyze this image in detail. Describe what you see.",
            images: [base64],
            stream: false
          })
        });
        if (!res.ok) throw new Error(`Ollama error ${res.status}`);
        const data = await res.json();
        reply = data.response || "Ollama se koi response nahi mila.";
        // ──────────────────────────────────────────────────────────────────

      } else {
        // ── Gemini Vision ──────────────────────────────────────────────────
        const key = localStorage.getItem("gemini_key") || "";
        if (!key) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "⚠️ Gemini API key required for camera photo analysis.\n\n👉 Settings → 🖼️ GEMINI KEY mein key daalo aur Save button dabao.\n\nFree key: https://aistudio.google.com/app/apikey",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setLoading(false);
          return;
        }
        const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: "Analyze this image in detail. Describe what you see." },
              { inline_data: { mime_type: "image/jpeg", data: base64 } }
            ]}]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze photo.";
        // ──────────────────────────────────────────────────────────────────
      }

      setMessages(prev => [...prev, {
        role: "assistant", content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      speakText(reply.slice(0, 200));

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Camera analysis failed: ${err.message}\n\n${
          aiProvider === "ollama"
            ? `Check karo:\n• ollama serve chal raha hai?\n• llava installed hai? Run: ollama pull llava\n• URL: ${ollamaUrl}`
            : "Check your Gemini API key in Settings."
        }`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    }
    setLoading(false);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const exportChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}] ${m.time}\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nova_chat.txt"; a.click();
    showToast("Chat exported!", "success");
  };

  // ─── SEND MESSAGE (Groq + Ollama support) ────────────────────────────────────
  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    if (aiProvider === "groq") {
      const key = localStorage.getItem("groq_key") || apiKey;
      if (!key) { setShowKeyInput(true); return; }
    }

    let finalText = userText;
    if (modeLabel === "web") finalText = `[Web Search Mode] ${userText}`;
    if (modeLabel === "study") finalText = `[Study Mode - detailed explanation] ${userText}`;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content: userText, time };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setMsgCount(c => c + 1);

    try {
      const conversationHistory = newMessages.slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));
      if (conversationHistory.length > 0) {
        conversationHistory[conversationHistory.length - 1].content = finalText;
      }

      let reply = "";

      if (aiProvider === "ollama") {
        const res = await fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...conversationHistory
            ],
            stream: false
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Ollama error ${res.status}: ${errText}`);
        }
        const data = await res.json();
        reply = data.message?.content || "Ollama se koi response nahi mila.";

      } else {
        const key = localStorage.getItem("groq_key") || apiKey;
        const res = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversationHistory],
            temperature: 0.7,
            max_tokens: 1024
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        reply = data.choices?.[0]?.message?.content || "Something went wrong.";
      }

      setMessages(prev => [...prev, {
        role: "assistant", content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      speakText(reply.slice(0, 300));
      if (!history.includes(userText.slice(0, 40)))
        setHistory(prev => [userText.slice(0, 40), ...prev.slice(0, 9)]);

    } catch (e) {
      let errMsg = e.message;
      if (aiProvider === "ollama" && (e.message.includes("fetch") || e.message.includes("Failed"))) {
        errMsg = `Ollama connect nahi hua!\n\nCheck karo:\n• ollama serve chal raha hai?\n• URL sahi hai: ${ollamaUrl}\n• CORS allowed hai (OLLAMA_ORIGINS=*)`;
      }
      setMessages(prev => [...prev, {
        role: "assistant", content: `❌ Error: ${errMsg}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      showToast("An error occurred!", "error");
    }
    setLoading(false);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sessionTime = Math.floor((Date.now() - sessionStart) / 60000);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    showToast("Logged out successfully!", "info");
  };

  if (!currentUser) {
    return <AuthScreen onLogin={(user) => { setCurrentUser(user); setUserAvatar(user.avatar || "👤"); }} />;
  }

  const providerLabel = aiProvider === "ollama"
    ? `🖥️ Ollama (${ollamaModel})`
    : "☁️ Groq AI (Llama 3.3)";

  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: T.bg, color: T.text, overflow: "hidden",
      transition: "background 0.3s ease, color 0.3s ease"
    }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes dropIn { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.35);border-radius:4px}
        textarea:focus{outline:none!important}
        button{transition: all 0.18s ease !important;}
        button:hover{opacity:0.88;transform:translateY(-1px)}
        button:active{transform:scale(0.96) !important}
        .dd-item:hover{background:rgba(124,58,237,0.14) !important; color: #a78bfa !important;}
        @media(max-width:768px){
          .sidebar-desktop{display:none!important}
          .chat-padding{padding: 16px 16px !important}
          .input-padding{padding: 12px 16px 16px !important}
        }
      `}</style>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
      <input ref={videoFileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoUpload} />

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* CAMERA MODAL */}
      {showCamera && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div style={{
            background: isDark ? "#1a1a2e" : "#fff",
            borderRadius: 20, padding: 28,
            border: `1px solid ${T.border}`, textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: T.text }}>📷 Live Camera</div>
            <video ref={videoRef} autoPlay playsInline
              style={{ width: Math.min(400, window.innerWidth - 80), borderRadius: 12, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
              <button onClick={capturePhoto} style={{
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                border: "none", borderRadius: 12, padding: "12px 28px",
                color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15
              }}>📸 Capture Photo</button>
              <button onClick={() => setShowCamera(false)} style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 28px",
                color: T.subtext, cursor: "pointer", fontSize: 15
              }}>✕ Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150
        }}>
          <div style={{
            background: isDark ? "#1a1a2e" : "#fff", borderRadius: 20, padding: 32, width: 420,
            border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: T.text }}>⚙️ Settings</div>

            {/* Theme */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>THEME</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["dark", "light"].map(t => (
                  <button key={t} onClick={() => { setTheme(t); localStorage.setItem("nova_theme", t); }} style={{
                    flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
                    background: theme === t ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    color: theme === t ? "#fff" : T.subtext,
                    border: `1px solid ${theme === t ? "transparent" : T.border}`
                  }}>{t === "dark" ? "🌙 Dark" : "☀️ Light"}</button>
                ))}
              </div>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>YOUR AVATAR</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AVATARS.map(av => (
                  <button key={av} onClick={() => { setUserAvatar(av); localStorage.setItem("nova_avatar", av); }} style={{
                    width: 44, height: 44, borderRadius: "50%", fontSize: 22, cursor: "pointer",
                    background: userAvatar === av ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    border: `2px solid ${userAvatar === av ? "#a78bfa" : T.border}`
                  }}>{av}</button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 24, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SESSION STATS</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.accent }}>{msgCount}</div>
                  <div style={{ fontSize: 11, color: T.subtext }}>Messages</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.accent }}>{sessionTime}m</div>
                  <div style={{ fontSize: 11, color: T.subtext }}>Session</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.accent }}>{history.length}</div>
                  <div style={{ fontSize: 11, color: T.subtext }}>Chats</div>
                </div>
              </div>
            </div>

            {/* ─── AI PROVIDER SECTION ───────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                AI PROVIDER
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["groq", "ollama"].map(p => (
                  <button key={p} onClick={() => {
                    setAiProvider(p);
                    localStorage.setItem("nova_provider", p);
                    if (p === "ollama") fetchOllamaModels(ollamaUrl, true);
                  }} style={{
                    flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
                    background: aiProvider === p ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    color: aiProvider === p ? "#fff" : T.subtext,
                    border: `1px solid ${aiProvider === p ? "transparent" : T.border}`
                  }}>{p === "groq" ? "☁️ Groq" : "🖥️ Ollama"}</button>
                ))}
              </div>
            </div>

            {/* Ollama Config */}
            {aiProvider === "ollama" && (
              <div style={{
                marginBottom: 24,
                background: isDark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)",
                borderRadius: 14, padding: 16,
                border: `1px solid ${isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.2)"}`
              }}>
                <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  🖥️ OLLAMA CONFIG
                </div>

                {/* Connection status */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: ollamaStatus === "connected" ? "#22c55e" : ollamaStatus === "error" ? "#ef4444" : "#64748b"
                  }} />
                  <span style={{ fontSize: 12, color: T.subtext }}>
                    {ollamaStatus === "connected" ? `Connected • ${ollamaModels.length} model(s)` : ollamaStatus === "error" ? "Not connected" : "Unknown status"}
                  </span>
                </div>

                {/* Base URL */}
                <label style={{ fontSize: 12, color: T.subtext, display: "block", marginBottom: 5 }}>Base URL</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input
                    value={ollamaUrl}
                    onChange={e => setOllamaUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { localStorage.setItem("ollama_url", ollamaUrl); fetchOllamaModels(ollamaUrl, true); }}}
                    placeholder="http://localhost:11434"
                    style={{
                      flex: 1, background: T.input, border: `1px solid ${T.inputBorder}`,
                      borderRadius: 10, padding: "9px 13px", color: T.text, fontSize: 13,
                      boxSizing: "border-box", outline: "none"
                    }}
                  />
                  <button onClick={() => { localStorage.setItem("ollama_url", ollamaUrl); fetchOllamaModels(ollamaUrl, true); }} style={{
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    border: "none", borderRadius: 10, padding: "9px 14px",
                    color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
                  }}>🔗 Test</button>
                </div>

                {/* Chat Model selector */}
                <label style={{ fontSize: 12, color: T.subtext, display: "block", marginBottom: 5 }}>
                  Chat Model
                </label>
                {ollamaModels.length > 0 ? (
                  <select
                    value={ollamaModel}
                    onChange={e => { setOllamaModel(e.target.value); localStorage.setItem("ollama_model", e.target.value); }}
                    style={{
                      width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
                      borderRadius: 10, padding: "9px 13px", color: T.text, fontSize: 13,
                      cursor: "pointer", outline: "none", boxSizing: "border-box"
                    }}
                  >
                    {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <input
                    value={ollamaModel}
                    onChange={e => { setOllamaModel(e.target.value); localStorage.setItem("ollama_model", e.target.value); }}
                    placeholder="phi3:mini.2"
                    style={{
                      width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
                      borderRadius: 10, padding: "9px 13px", color: T.text, fontSize: 13,
                      boxSizing: "border-box", outline: "none"
                    }}
                  />
                )}

                {/* ─── VISION MODEL (NEW) ──────────────────────────────────── */}
                <label style={{ fontSize: 12, color: T.subtext, display: "block", marginBottom: 5, marginTop: 14 }}>
                  Vision Model <span style={{ fontWeight: 400, color: isDark ? "#475569" : "#cbd5e1" }}>(image & camera analysis)</span>
                </label>
                <input
                  value={ollamaVisionModel}
                  onChange={e => {
                    setOllamaVisionModel(e.target.value);
                    localStorage.setItem("ollama_vision_model", e.target.value);
                  }}
                  placeholder="llava"
                  style={{
                    width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
                    borderRadius: 10, padding: "9px 13px", color: T.text, fontSize: 13,
                    boxSizing: "border-box", outline: "none"
                  }}
                />
                {/* ──────────────────────────────────────────────────────────── */}

                {/* Help text */}
                <div style={{ fontSize: 11, color: T.subtext, marginTop: 10, lineHeight: 1.8 }}>
                  <div>📦 Chat model: <code style={{ color: "#a78bfa", background: isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.08)", padding: "1px 6px", borderRadius: 4 }}>ollama pull phi3:mini.2</code></div>
                  <div>🖼️ Vision model: <code style={{ color: "#a78bfa", background: isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.08)", padding: "1px 6px", borderRadius: 4 }}>ollama pull llava</code></div>
                  <div style={{ marginTop: 2 }}>🔓 CORS fix: <code style={{ color: "#a78bfa", background: isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.08)", padding: "1px 6px", borderRadius: 4 }}>OLLAMA_ORIGINS=* ollama serve</code></div>
                </div>
              </div>
            )}
            {/* ──────────────────────────────────────────────────────────────── */}

            {/* Gemini Key — sirf Groq provider mein dikhao */}
            {aiProvider === "groq" && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: T.subtext, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                  🖼️ GEMINI KEY <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(camera & image analysis)</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="password"
                    value={geminiKeyInput}
                    onChange={e => setGeminiKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveGeminiKey()}
                    placeholder="AIza..."
                    style={{
                      flex: 1, background: T.input, border: `1px solid ${T.inputBorder}`,
                      borderRadius: 10, padding: "9px 13px", color: T.text, fontSize: 13,
                      boxSizing: "border-box", outline: "none"
                    }}
                  />
                  <button onClick={saveGeminiKey} style={{
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    border: "none", borderRadius: 10, padding: "9px 16px",
                    color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
                  }}>💾 Save</button>
                </div>
                <div style={{ fontSize: 11, marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: localStorage.getItem("gemini_key") ? "#4ade80" : "#f87171" }}>
                    {localStorage.getItem("gemini_key") ? "✅ Key saved" : "❌ No key saved"}
                  </span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>
                    Get free key →
                  </a>
                </div>
              </div>
            )}

            {/* Ollama provider mein info banner dikhao */}
            {aiProvider === "ollama" && (
              <div style={{
                marginBottom: 24,
                background: isDark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)",
                border: `1px solid ${isDark ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.2)"}`,
                borderRadius: 12, padding: "12px 14px"
              }}>
                <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, marginBottom: 4 }}>✅ No API Key Needed!</div>
                <div style={{ fontSize: 12, color: T.subtext, lineHeight: 1.6 }}>
                  Ollama locally run hota hai. Chat ke liye chat model use hoga, images ke liye vision model (llava) use hoga — koi external key nahi chahiye.
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={exportChat} style={{
                flex: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${T.border}`, borderRadius: 12, padding: 12,
                color: T.subtext, cursor: "pointer", fontSize: 13, fontWeight: 600
              }}>📥 Export Chat</button>
              <button onClick={() => setShowSettings(false)} style={{
                flex: 1, background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                border: "none", borderRadius: 12, padding: 12, color: "#fff", fontWeight: 700, cursor: "pointer"
              }}>Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="sidebar-desktop" style={{
          width: isMobile ? "100vw" : 265,
          position: isMobile ? "fixed" : "relative",
          inset: isMobile ? 0 : "auto",
          zIndex: isMobile ? 100 : "auto",
          background: T.sidebar,
          borderRight: `1px solid ${T.sidebarBorder}`,
          display: "flex", flexDirection: "column", padding: "20px 16px",
          backdropFilter: "blur(20px)",
          transition: "background 0.3s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 4px 16px rgba(124,58,237,0.35)"
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px", color: T.text }}>NOVA AI</div>
              <div style={{ fontSize: 11, color: T.subtext }}>Smart Assistant</div>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} style={{
                marginLeft: "auto", background: "transparent", border: "none",
                color: T.subtext, cursor: "pointer", fontSize: 20
              }}>✕</button>
            )}
          </div>

          <button onClick={() => { setMessages([]); setHistory([]); setModeLabel(null); showToast("New chat started!", "success"); }} style={{
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            border: "none", borderRadius: 12, padding: "11px 16px",
            color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 20, fontSize: 13,
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)"
          }}>+ New Chat</button>

          <div style={{ fontSize: 11, color: T.subtext, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>QUICK PROMPTS</div>
          {QUICK_PROMPTS.map((qp, i) => (
            <button key={i} onClick={() => { sendMessage(qp.text); if (isMobile) setSidebarOpen(false); }} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "9px 13px", color: T.text,
              cursor: "pointer", textAlign: "left", marginBottom: 4, fontSize: 13,
              backdropFilter: "blur(10px)"
            }}>{qp.icon} {qp.label}</button>
          ))}

          {history.length > 0 && <>
            <div style={{ fontSize: 11, color: T.subtext, fontWeight: 700, letterSpacing: 1.2, margin: "16px 0 8px" }}>HISTORY</div>
            {history.map((h, i) => (
              <div key={i} style={{
                fontSize: 12, color: T.subtext, padding: "7px 10px", borderRadius: 8,
                cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                background: "transparent", transition: "background 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >💬 {h}...</div>
            ))}
          </>}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              background: isDark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)",
              border: `1px solid ${isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.15)"}`,
              borderRadius: 12, padding: "10px 13px", marginBottom: 4,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", fontSize: 18,
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>{userAvatar}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: T.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.email}</div>
              </div>
            </div>

            <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
              background: voiceEnabled ? "rgba(124,58,237,0.18)" : T.card,
              border: `1px solid ${voiceEnabled ? "rgba(124,58,237,0.45)" : T.border}`,
              borderRadius: 10, padding: "9px 13px",
              color: voiceEnabled ? "#a78bfa" : T.subtext,
              cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 600
            }}>{voiceEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}</button>
            <button onClick={() => setShowSettings(true)} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "9px 13px", color: T.subtext,
              cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 600
            }}>⚙️ Settings</button>
            <button onClick={() => setShowKeyInput(true)} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "9px 13px", color: T.subtext,
              cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 600
            }}>🔑 Groq API Key</button>
            <button onClick={handleLogout} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10, padding: "9px 13px", color: "#f87171",
              cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 600
            }}>🚪 Logout</button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 14,
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)"
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "transparent", border: "none", color: T.subtext,
            cursor: "pointer", fontSize: 20, padding: 4
          }}>☰</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text, letterSpacing: "-0.3px" }}>Smart AI Assistant</div>
            <div style={{ fontSize: 11, color: T.subtext }}>
              <span style={{
                color: aiProvider === "ollama"
                  ? (ollamaStatus === "connected" ? "#22c55e" : ollamaStatus === "error" ? "#ef4444" : "#f59e0b")
                  : "#22c55e",
                marginRight: 5
              }}>●</span>
              {providerLabel} • {currentUser.name}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isSpeaking && (
              <button onClick={stopSpeaking} style={{
                background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: 20, padding: "6px 14px", color: "#f87171",
                cursor: "pointer", fontSize: 12, fontWeight: 600
              }}>⏹ Stop</button>
            )}
            <button onClick={toggleTheme} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 10, width: 36, height: 36,
              color: T.text, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{isDark ? "☀️" : "🌙"}</button>
            <button onClick={() => setShowSettings(true)} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 10, width: 36, height: 36,
              color: T.text, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>⚙️</button>
          </div>
        </div>

        {/* Groq API Key Modal */}
        {showKeyInput && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
          }}>
            <div style={{
              background: isDark ? "#1a1a2e" : "#fff", borderRadius: 20, padding: 32,
              width: Math.min(420, window.innerWidth - 40),
              border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: T.text }}>🔑 Groq API Key</div>
              <div style={{ fontSize: 13, color: T.subtext, marginBottom: 20 }}>
                Free key: <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#a78bfa", fontWeight: 600 }}>console.groq.com/keys</a>
              </div>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveKey()}
                placeholder="gsk_..." style={{
                  width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
                  borderRadius: 12, padding: "13px 16px", color: T.text, fontSize: 14,
                  marginBottom: 16, boxSizing: "border-box", outline: "none"
                }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveKey} style={{
                  flex: 1, background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  border: "none", borderRadius: 12, padding: 13, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14
                }}>Save & Continue</button>
                <button onClick={() => setShowKeyInput(false)} style={{
                  flex: 1, background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: 13, color: T.subtext, cursor: "pointer", fontSize: 14
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chat-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} theme={theme} userAvatar={userAvatar} />)}
          {loading && (
            <div style={{ display: "flex", marginBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginRight: 10
              }}>🤖</div>
              <div style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)", borderRadius: "18px 18px 18px 4px", border: `1px solid ${T.border}` }}>
                <TypingIndicator theme={theme} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="input-padding" style={{ padding: "14px 28px 20px", borderTop: `1px solid ${T.border}`, background: isDark ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)" }}>
          {modeLabel && (
            <div style={{ marginBottom: 10 }}>
              <span style={{
                background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.4)",
                borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#a78bfa",
                display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600
              }}>
                {modeLabel === "web" ? "🌐 Web Search Mode" : "📚 Study Mode"}
                <span onClick={() => setModeLabel(null)} style={{ cursor: "pointer", opacity: 0.7 }}>✕</span>
              </span>
            </div>
          )}

          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: T.input, border: `1px solid ${T.inputBorder}`,
            borderRadius: 26, padding: "10px 12px 10px 10px",
            position: "relative", boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.08)",
          }}>
            <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={{
                width: 38, height: 38, borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)",
                border: `1px solid ${T.border}`, color: T.text,
                cursor: "pointer", fontSize: 22,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>+</button>

              {showDropdown && (
                <div style={{
                  position: "absolute", bottom: 50, left: 0,
                  background: isDark ? "#1e1e30" : "#fff",
                  border: `1px solid ${T.border}`, borderRadius: 18, padding: "6px 0",
                  minWidth: 210, zIndex: 50,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                  animation: "dropIn 0.2s cubic-bezier(.4,0,.2,1)"
                }}>
                  {[
                    { icon: "🖼️", label: "Add photos", action: () => { fileInputRef.current.click(); setShowDropdown(false); } },
                    { icon: "🎥", label: "Add video", action: () => { videoFileRef.current.click(); setShowDropdown(false); } },
                    { icon: "📷", label: "Live camera", action: () => { openCamera(); setShowDropdown(false); }, divider: true },
                    { icon: "🌐", label: "Web search", action: () => { setModeLabel("web"); setShowDropdown(false); inputRef.current?.focus(); } },
                    { icon: "📚", label: "Study and learn", action: () => { setModeLabel("study"); setShowDropdown(false); inputRef.current?.focus(); } },
                  ].map((item, i) => (
                    <div key={i}>
                      {item.divider && <div style={{ height: 1, background: T.border, margin: "4px 0" }} />}
                      <div className="dd-item" onClick={item.action} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "11px 18px", cursor: "pointer", fontSize: 14,
                        color: T.text, transition: "all 0.15s", borderRadius: 8, margin: "0 4px"
                      }}>
                        <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Nova anything..."
              style={{
                flex: 1, background: "transparent", border: "none",
                color: T.text, fontSize: 15, resize: "none",
                minHeight: 26, maxHeight: 120, lineHeight: 1.6,
                fontFamily: "inherit", padding: "5px 0"
              }} rows={1} />

            <button onClick={isListening ? stopListening : startListening} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isListening ? "rgba(239,68,68,0.25)" : isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)",
              border: `1px solid ${isListening ? "rgba(239,68,68,0.5)" : T.border}`,
              borderRadius: 20, padding: "7px 14px",
              color: isListening ? "#f87171" : T.subtext,
              cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0,
              animation: isListening ? "pulse 1s infinite" : "none"
            }}>
              <span style={{ fontSize: 15 }}>🎤</span>
              {!isMobile && (isListening ? "Listening..." : "Voice")}
            </button>

            {input.trim() && (
              <button onClick={() => sendMessage()} disabled={loading} style={{
                background: loading ? "rgba(124,58,237,0.35)" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                border: "none", borderRadius: "50%", width: 40, height: 40,
                color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 17,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)"
              }}>➤</button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, flexWrap: "wrap", gap: 4 }}>
            <div style={{ fontSize: 11, color: isDark ? "#475569" : "#cbd5e1" }}>
              Smart AI Assistant • Final Year Project • {aiProvider === "ollama" ? `Ollama (${ollamaModel})` : "Powered by Groq (Llama 3.3)"}
            </div>
            <div style={{ fontSize: 11, display: "flex", gap: 10 }}>
              {isListening && <span style={{ color: "#f87171", animation: "pulse 1s infinite" }}>🎤 Listening...</span>}
              {isSpeaking && <span style={{ color: "#a78bfa", animation: "pulse 1s infinite" }}>🔊 Speaking...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
