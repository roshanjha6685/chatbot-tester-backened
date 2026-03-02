"use client";

import { useState, useRef, useEffect, FC, KeyboardEvent, DragEvent, ChangeEvent } from "react";
import BotMessage from "./components/RenderBotMessage";


interface Preset {
  name: string;
  primary: string;
  bg: string;
}

interface BubbleOption {
  val: "circle" | "soft" | "square";
  emoji: string;
  label: string;
}

interface BotInfo {
  name: string;
  school: string;
  tagline: string;
  welcome: string;
  instructions: string;
  topics: string;
}

interface Theme {
  primary: string;
  headerBg: string;
  font: string;
  bubble: "circle" | "soft" | "square";
  position: "right" | "left";
  avatar: string;
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

interface PdfData {
  name: string;
  size: string;
}

interface MiniPreviewProps {
  theme: Theme;
  botInfo: BotInfo;
}

interface StepDef {
  label: string;
}

interface PositionOption {
  v: "right" | "left";
  l: string;
}



const PRESETS: Preset[] = [
  { name: "Ocean", primary: "#00d4aa", bg: "#0a1628" },
  { name: "Sunset", primary: "#f97316", bg: "#1e0e05" },
  { name: "Royal", primary: "#7c3aed", bg: "#0f0720" },
  { name: "Cherry", primary: "#e11d48", bg: "#1e0510" },
  { name: "Forest", primary: "#22c55e", bg: "#061510" },
  { name: "Gold", primary: "#eab308", bg: "#1a1504" },
];

const FONTS: string[] = ["Plus Jakarta Sans", "Syne", "Georgia", "Courier New"];

const BUBBLES: BubbleOption[] = [
  { val: "circle", emoji: "⭕", label: "Round" },
  { val: "soft", emoji: "💬", label: "Soft" },
  { val: "square", emoji: "⬛", label: "Square" },
];

const AVATARS: string[] = ["🤖", "🧑‍🏫", "🦉", "🐼", "🚀", "🌟", "💡", "🎓", "🏫", "🦊"];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const STEP_DEFS: StepDef[] = [
  { label: "Upload PDF" },
  { label: "Bot Info" },
  { label: "Theme" },
  { label: "Get Script" },
];

const POSITION_OPTIONS: PositionOption[] = [
  { v: "right", l: "↘ Bottom Right" },
  { v: "left", l: "↙ Bottom Left" },
];



const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f1f5f9;color:#1e293b;min-height:100vh}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#f1f5f9}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes typing{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes popIn{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
.wrap{max-width:680px;margin:0 auto;padding:40px 20px 80px}
.top-logo{font-size:18px;font-weight:800;margin-bottom:30px;display:flex;align-items:center;gap:8px}
.top-logo span{font-size:13px;font-weight:500;}
.stepper{display:flex;align-items:flex-start;gap:0;margin-bottom:36px;position:relative}
.stepper::before{content:'';position:absolute;top:18px;left:18px;right:18px;height:2px;background:#e2e8f0;z-index:0}
.step-track{background:#00d4aa;position:absolute;top:18px;left:18px;height:2px;z-index:1;transition:width .5s ease}
.step-node{flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;position:relative;z-index:2}
.step-circle{width:36px;height:36px;border-radius:50%;border:2.5px solid #e2e8f0;background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .3s;font-weight:700;color:#94a3b8}
.step-node.active .step-circle{border-color:#00d4aa;background:#00d4aa;color:#fff;box-shadow:0 0 0 4px rgba(0,212,170,.15)}
.step-node.done .step-circle{border-color:#00d4aa;background:#00d4aa;color:#fff;font-size:13px}
.step-lbl{font-size:11px;font-weight:600;color:black;text-align:center;letter-spacing:.01em}
.step-node.active .step-lbl{color:#00d4aa}
.step-node.done .step-lbl{color:#64748b}
.step-card{background:#fff;border-radius:18px;border:1px solid #e8ecf0;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.04);animation:fadeDown .35s ease}
.step-card-head{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.step-card-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.step-card-title{font-size:17px;font-weight:800;color:#0f172a}
.step-card-sub{font-size:12px;color:#94a3b8;margin-top:2px}
.badge-ok{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:3px 9px;border-radius:100px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;margin-left:auto}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:12.5px;font-weight:600;color:#475569;margin-bottom:5px}
.form-input{width:100%;padding:10px 13px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;color:#0f172a;font-size:13px;outline:none;transition:all .2s}
.form-input:focus{border-color:#00d4aa;background:#fff;box-shadow:0 0 0 3px rgba(0,212,170,.08)}
.form-input::placeholder{color:#cbd5e1}
textarea.form-input{resize:vertical;min-height:85px;line-height:1.6}
.form-hint{font-size:11px;color:#94a3b8;margin-top:4px}
.upload-zone{border:2px dashed #e2e8f0;border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .2s;background:#fafbfc}
.upload-zone:hover,.upload-zone.drag{border-color:#00d4aa;background:rgba(0,212,170,.03)}
.upload-icon{font-size:36px;margin-bottom:10px}
.upload-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 3px;
}


.status-badge {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 100px;
  padding: 4px 13px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
}

@media (max-width: 768px) {
  .status-badge {
    font-size: 6px;
  }
}

@media (max-width: 768px) {
  .upload-title {
    font-size: 6px;
  }
}
.upload-hint{font-size:12px;color:#94a3b8}
.prog-wrap{height:4px;background:#e2e8f0;border-radius:2px;margin-top:10px;overflow:hidden;max-width:200px;margin-left:auto;margin-right:auto}
.prog-fill{height:100%;background:#00d4aa;border-radius:2px;transition:width .4s ease}
.presets-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.preset{border:2px solid #e2e8f0;border-radius:10px;padding:10px;cursor:pointer;transition:all .2s;background:#fff}
.preset:hover,.preset.sel{border-color:#00d4aa;background:#f0fdf4}
.preset-dots{display:flex;gap:5px;margin-bottom:5px}
.preset-dot{width:14px;height:14px;border-radius:50%}
.preset-name{font-size:11px;font-weight:700;color:#64748b}
.preset.sel .preset-name{color:#00d4aa}
.color-row{display:flex;align-items:center;gap:8px}
.color-preview{width:34px;height:34px;border-radius:8px;border:1.5px solid #e2e8f0;flex-shrink:0}
.font-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.font-opt{border:2px solid #e2e8f0;border-radius:8px;padding:8px 6px;cursor:pointer;font-size:12px;color:#64748b;background:#fff;text-align:center;transition:all .2s}
.font-opt:hover,.font-opt.sel{border-color:#00d4aa;color:#0f172a;background:#f0fdf4}
.avatar-grid{display:flex;flex-wrap:wrap;gap:7px}
.avatar-opt{width:38px;height:38px;border-radius:9px;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;transition:all .2s;background:#fafbfc}
.avatar-opt:hover,.avatar-opt.sel{border-color:#00d4aa;background:#f0fdf4}
.bubble-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.bubble-opt{border:2px solid #e2e8f0;border-radius:9px;padding:12px 6px;cursor:pointer;text-align:center;transition:all .2s;background:#fff}
.bubble-opt:hover,.bubble-opt.sel{border-color:#00d4aa;background:#f0fdf4}
.bubble-emoji{font-size:18px;margin-bottom:3px}
.bubble-label{font-size:11px;color:#64748b}
.pos-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pos-opt{border:2px solid #e2e8f0;border-radius:9px;padding:11px 14px;cursor:pointer;font-size:13px;color:#64748b;font-weight:500;transition:all .2s;background:#fff}
.pos-opt:hover,.pos-opt.sel{border-color:#00d4aa;color:#00d4aa;background:#f0fdf4}
.sec-title{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px}
.divider{height:1px;background:#f1f5f9;margin:16px 0}
.preview-strip{background:#0a1220;border-radius:14px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px}
.mini-window{flex:1;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.3)}
.mini-header{padding:10px 12px;display:flex;align-items:center;gap:8px}
.mini-av{width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px}
.mini-hname{font-size:11px;font-weight:700;color:#fff}
.mini-hsub{font-size:9px;color:rgba(255,255,255,.6);margin-top:1px}
.mini-body{background:#fff;padding:10px;min-height:50px}
.mini-msg{background:#f1f5f9;border-radius:3px 8px 8px 8px;padding:6px 9px;font-size:10px;color:#334155;max-width:90%;line-height:1.5}
.mini-inp{background:#fff;padding:7px 10px;border-top:1px solid #e2e8f0;display:flex;gap:6px;align-items:center}
.mini-fake{flex:1;font-size:9px;color:#94a3b8}
.mini-send{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;flex-shrink:0}
.float-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,.3);flex-shrink:0}
.success-banner{background:linear-gradient(135deg,#f0fdf4,#eff6ff);border:1.5px solid #bbf7d0;border-radius:16px;padding:24px;text-align:center;margin-bottom:16px}
.code-block{background:#0d1117;border-radius:12px;padding:18px;font-family:'Courier New',monospace;font-size:12px;color:#00d4aa;position:relative;overflow-x:auto;line-height:1.9;white-space:pre-wrap;word-break:break-all;border:1px solid rgba(255,255,255,.06)}
.copy-btn{position:absolute;top:10px;right:10px;background:#1e2a3a;border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 12px;font-size:11px;font-weight:600;color:#94a3b8;cursor:pointer;transition:all .2s;}
.copy-btn:hover{color:#00d4aa;border-color:#00d4aa}
.chat-box{border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-top:12px}
.chat-head{background:#0f172a;padding:11px 16px;display:flex;align-items:center;gap:8px}
.chat-dot{width:7px;height:7px;border-radius:50%;background:#00d4aa;animation:pulse 2s infinite}
.chat-msgs{padding:14px;background:#fafbfc;min-height:180px;max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
.msg-bot{background:#fff;border:1px solid #e2e8f0;border-radius:4px 12px 12px 12px;padding:9px 12px;font-size:13px;color:#334155;max-width:85%;align-self:flex-start;line-height:1.5;animation:popIn .3s ease}
.msg-user{background:#00d4aa;border-radius:12px 4px 12px 12px;padding:9px 12px;font-size:13px;color:#0f172a;font-weight:600;max-width:85%;align-self:flex-end;animation:popIn .3s ease}
.msg-thinking{display:flex;gap:4px;align-items:center;padding:9px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:4px 12px 12px 12px;align-self:flex-start}
.dp{width:6px;height:6px;border-radius:50%;background:#00d4aa;animation:typing 1.2s ease infinite}
.dp:nth-child(2){animation-delay:.2s}.dp:nth-child(3){animation-delay:.4s}
.chat-footer{display:flex;gap:8px;padding:10px 14px;background:#fff;border-top:1.5px solid #e2e8f0}
.chat-in{flex:1;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:9px 12px;color:#0f172a;font-size:13px;outline:none;transition:all .2s}
.chat-in:focus{border-color:#00d4aa;background:#fff}
.send-btn{background:#00d4aa;color:#0f172a;border:none;border-radius:8px;padding:9px 16px;font-weight:700;font-size:12px;cursor:pointer;transition:all .2s}
.send-btn:hover{background:#00b894}
.send-btn:disabled{opacity:.4;cursor:default}
.bottom-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 0 0;margin-top:22px;border-top:1.5px solid #f1f5f9}
.btn-back{background:transparent;color:#64748b;font-weight:600;font-size:13px;padding:10px 20px;border-radius:9px;border:1.5px solid #e2e8f0;cursor:pointer;transition:all .2s}
.btn-back:hover{border-color:#00d4aa;color:#00d4aa}
.btn-next{background:#0f172a;color:#fff;font-weight:700;font-size:13px;padding:10px 24px;border-radius:9px;border:none;cursor:pointer;transition:all .2s}
.btn-next:hover{background:#1e293b;transform:translateY(-1px);box-shadow:0 6px 18px rgba(15,23,42,.2)}
.btn-next:disabled{opacity:.35;cursor:default;transform:none;box-shadow:none}
.btn-next.hi{background:#00d4aa;color:#0f172a}
.btn-next.hi:hover{background:#00b894;box-shadow:0 6px 18px rgba(0,212,170,.25)}
.step-count{font-size:12px;color:#94a3b8;font-weight:600}
`;



const MiniPreview: FC<MiniPreviewProps> = ({ theme, botInfo }) => {
  const br =
    theme.bubble === "circle" ? "50%"
      : theme.bubble === "square" ? "8px"
        : "32%";

  const msgBr =
    theme.bubble === "square"
      ? "3px 8px 8px 8px"
      : "3px 10px 10px 10px";

  return (
    <div className="preview-strip">
      <div className="mini-window">
        <div className="mini-header" style={{ background: theme.headerBg }}>
          <div className="mini-av">{theme.avatar}</div>
          <div>
            <div className="mini-hname" style={{ fontFamily: theme.font }}>
              {botInfo.name || "School Bot"}
            </div>
            <div className="mini-hsub">● {botInfo.tagline || "Here to help"}</div>
          </div>
        </div>
        <div className="mini-body">
          <div className="mini-msg" style={{ borderRadius: msgBr, fontFamily: theme.font }}>
            {botInfo.welcome || "Hi! 👋 How can I help?"}
          </div>
        </div>
        <div className="mini-inp">
          <div className="mini-fake">Type a message...</div>
          <div className="mini-send" style={{ background: theme.primary }}>→</div>
        </div>
      </div>
      <div className="float-btn" style={{ background: theme.primary, borderRadius: br }}>
        {theme.avatar}
      </div>
    </div>
  );
};



const defaultBotInfo = (): BotInfo => ({
  name: "", school: "", tagline: "", welcome: "", instructions: "", topics: "",
});

const defaultTheme = (): Theme => ({
  primary: "#00d4aa", headerBg: "#0a1628",
  font: "Plus Jakarta Sans", bubble: "soft",
  position: "right", avatar: "🤖",
});


export default function ChatbotBuilder() {
  const [step, setStep] = useState<number>(0);
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [prog, setProg] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [drag, setDrag] = useState<boolean>(false);
  const [botInfo, setBotInfo] = useState<BotInfo>(defaultBotInfo);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [msgs, setMsgs] = useState<ChatMessage[] | null>(null);
  const [chatIn, setChatIn] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);


  const setB =
    <K extends keyof BotInfo>(key: K) =>
      (value: BotInfo[K]): void =>
        setBotInfo(prev => ({ ...prev, [key]: value }));


  const setT = (patch: Partial<Theme>): void =>
    setTheme(prev => ({ ...prev, ...patch }));

  const canNext = step === 1 ? !!botInfo.name : true;


  useEffect(() => {

    fetch(`${API_BASE}/api/bot/${botId}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId, ...botInfo, theme }),
    });

    if (step === 3 && !msgs) {
      setMsgs([{ role: "bot", text: botInfo.welcome || "Hi there! 👋 How can I help?" }]);
    }
  }, [step]);



  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);


  const handleFile = (file: File | null | undefined): void => {
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { alert("PDF only please!"); return; }

    setBusy(true);
    setProg(10);
    setPdfData({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB" });

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("config", JSON.stringify({ botId }));

    let p = 10;
    const iv = setInterval(() => { p = Math.min(p + 8, 85); setProg(p); }, 150);

    fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData })
      .then((r) => r.json())
      .then((data) => {
        clearInterval(iv);
        setProg(100);
        setBusy(false);
        console.log(`✅ ${data.chunks} chunks indexed`);
      })
      .catch((err) => {
        clearInterval(iv);
        setBusy(false);
        alert("Upload error: " + err.message);
      });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void => {
    handleFile(e.target.files?.[0]);
  };


  const sendChat = async (): Promise<void> => {
    if (!chatIn.trim() || thinking) return;

    const msg = chatIn.trim();
    setChatIn("");
    setMsgs(prev => [...(prev ?? []), { role: "user", text: msg }]);
    setThinking(true);

    const history = (msgs ?? []).slice(-8).map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, message: msg, history }),
      });
      const data = await res.json();
      const reply = data.reply ?? "Sorry, couldn't respond.";
      setMsgs(prev => [...(prev ?? []), { role: "bot", text: reply }]);
    } catch {
      setMsgs(prev => [...(prev ?? []), { role: "bot", text: "⚠️ Backend se connect nahi hua." }]);
    }

    setThinking(false);
  };
  const handleChatKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") void sendChat();
  };



  const botId = useRef<string>(`bot_${Math.random().toString(36).substring(2, 10)}`).current;

  // const scriptStr =
  //   `<script src="https://cdn.yourdomain.com/chatbot.js"` +
  //   ` data-bot-id="${botId}"` +
  //   ` data-primary="${theme.primary}"` +
  //   ` data-header-bg="${theme.headerBg}"` +
  //   ` data-avatar="${theme.avatar}"` +
  //   ` data-name="${botInfo.name || "Assistant"}"` +
  //   ` data-position="${theme.position}" defer></script>`;


  const scriptStr = `<script src="${API_BASE}/widget.js?botId=${botId}" defer><\/script>`;


  const handleCopy = (): void => {
    void navigator.clipboard.writeText(scriptStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const handleReset = (): void => {
    setStep(0);
    setPdfData(null);
    setProg(0);
    setMsgs(null);
    setBotInfo(defaultBotInfo());
    setTheme(defaultTheme());
  };







  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="wrap">
        <div className="top-logo">🤖 Chatbot-Builder <span>Create AI bots in minutes</span></div>


        <div className="stepper">
          <div
            className="step-track"
            style={{
              width: step === 0
                ? "0%"
                : `${(step / (STEP_DEFS.length - 1)) * 88}%`,
            }}
          />
          {STEP_DEFS.map((s, i) => (
            <div
              key={i}
              className={`step-node ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
              onClick={() => { if (i < step) setStep(i); }}
              style={{ cursor: i < step ? "pointer" : "default" }}
            >
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <div className="step-lbl" style={{ color: "black" }}>{s.label}</div>
            </div>
          ))}
        </div>


        <div className="step-card" key={step}>

          {step === 0 && (
            <>
              <div className="step-card-head">
                <div className="step-card-icon" style={{ background: "#f0fdf4" }}>📄</div>
                <div>
                  <div className="step-card-title">Upload PDF</div>
                  <div className="step-card-sub">Train your bot on any document</div>
                </div>
                {pdfData && prog >= 100 && <div className="badge-ok"> Uploaded</div>}
              </div>

              <div
                className={`upload-zone ${drag ? "drag" : ""}`}
                onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
                <div className="upload-icon">☁️</div>
                <div className="upload-title">
                  {pdfData ? pdfData.name : "Drop PDF here or click to browse"}
                </div>
                <div className="upload-hint">
                  {pdfData ? pdfData.size : "Syllabus, FAQ, Handbook · max 10 MB"}
                </div>

                {pdfData && busy && (
                  <div className="prog-wrap">
                    <div className="prog-fill" style={{ width: prog + "%" }} />
                  </div>
                )}

                {pdfData && prog >= 100 && !busy && (
                  <div className="status-badge">
                    ✅ {pdfData.name}
                    <span
                      style={{ marginLeft: 4, color: "#94a3b8", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfData(null);
                        setProg(0);
                      }}
                    >✕</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
                💡 No PDF? Your bot still works with general knowledge. Skip for now.
              </p>
            </>
          )}


          {step === 1 && (
            <>
              <div className="step-card-head">
                <div className="step-card-icon" style={{ background: "#eff6ff" }}>🤖</div>
                <div>
                  <div className="step-card-title">Bot Info</div>
                  <div className="step-card-sub">Give your chatbot a personality</div>
                </div>
                {botInfo.name && <div className="badge-ok">✅ Configured</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bot Name *</label>
                  <input
                    className="form-input"
                    placeholder="Vidya Assistant"
                    value={botInfo.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setB("name")(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">School / Website</label>
                  <input
                    className="form-input"
                    placeholder="DPS Noida"
                    value={botInfo.school}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setB("school")(e.target.value)}
                  />
                </div>
              </div>

              {/* <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  className="form-input"
                  placeholder="Here to help 24/7"
                  value={botInfo.tagline}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setB("tagline")(e.target.value)}
                />
              </div> */}

              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <input
                  className="form-input"
                  placeholder="Hi there! 👋 How can I help you today?"
                  value={botInfo.welcome}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setB("welcome")(e.target.value)}
                />
              </div>

              {/* <div className="form-group">
                <label className="form-label">Personality / Instructions</label>
                <textarea
                  className="form-input"
                  placeholder="You are a helpful assistant for [School]. Answer questions about admissions, fees, syllabus. Be friendly and concise."
                  value={botInfo.instructions}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setB("instructions")(e.target.value)}
                />
                <div className="form-hint">Internal instructions shaping how your bot responds</div>
              </div> */}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Topics to focus on</label>
                <input
                  className="form-input"
                  placeholder="Admissions, Fees, Syllabus, Events..."
                  value={botInfo.topics}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setB("topics")(e.target.value)}
                />
              </div>
            </>
          )}


          {step === 2 && (
            <>
              <div className="step-card-head">
                <div className="step-card-icon" style={{ background: "#fdf4ff" }}>🎨</div>
                <div>
                  <div className="step-card-title">Theme &amp; Design</div>
                  <div className="step-card-sub">Match your school brand perfectly</div>
                </div>
              </div>

              <MiniPreview theme={theme} botInfo={botInfo} />

              <div className="sec-title">Quick Presets</div>
              <div className="presets-grid">
                {PRESETS.map(p => (
                  <div
                    key={p.name}
                    className={`preset ${theme.primary === p.primary ? "sel" : ""}`}
                    onClick={() => setT({ primary: p.primary, headerBg: p.bg })}
                  >
                    <div className="preset-dots">
                      <div className="preset-dot" style={{ background: p.primary }} />
                      <div className="preset-dot" style={{ background: p.bg }} />
                    </div>
                    <div className="preset-name">{p.name}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-row">
                    <div className="color-preview" style={{ background: theme.primary }} />
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setT({ primary: e.target.value })}
                      style={{ width: 34, height: 34, border: "none", background: "transparent", cursor: "pointer" }}
                    />
                    <input
                      className="form-input"
                      value={theme.primary}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setT({ primary: e.target.value })}
                      style={{ maxWidth: 110 }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Header Color</label>
                  <div className="color-row">
                    <div className="color-preview" style={{ background: theme.headerBg }} />
                    <input
                      type="color"
                      value={theme.headerBg}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setT({ headerBg: e.target.value })}
                      style={{ width: 34, height: 34, border: "none", background: "transparent", cursor: "pointer" }}
                    />
                    <input
                      className="form-input"
                      value={theme.headerBg}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setT({ headerBg: e.target.value })}
                      style={{ maxWidth: 110 }}
                    />
                  </div>
                </div>
              </div>

              <div className="divider" />
              <div className="sec-title">Bot Avatar</div>
              <div className="avatar-grid" style={{ marginBottom: 16 }}>
                {AVATARS.map(a => (
                  <div
                    key={a}
                    className={`avatar-opt ${theme.avatar === a ? "sel" : ""}`}
                    onClick={() => setT({ avatar: a })}
                  >{a}</div>
                ))}
              </div>

              <div className="divider" />
              <div className="sec-title">Font Family</div>
              <div className="font-grid" style={{ marginBottom: 16 }}>
                {FONTS.map(f => (
                  <div
                    key={f}
                    className={`font-opt ${theme.font === f ? "sel" : ""}`}
                    style={{ fontFamily: f }}
                    onClick={() => setT({ font: f })}
                  >{f}</div>
                ))}
              </div>

              <div className="divider" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div className="sec-title">Bubble Style</div>
                  <div className="bubble-grid">
                    {BUBBLES.map(b => (
                      <div
                        key={b.val}
                        className={`bubble-opt ${theme.bubble === b.val ? "sel" : ""}`}
                        onClick={() => setT({ bubble: b.val })}
                      >
                        <div className="bubble-emoji">{b.emoji}</div>
                        <div className="bubble-label">{b.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="sec-title">Button Position</div>
                  <div className="pos-grid">
                    {POSITION_OPTIONS.map(p => (
                      <div
                        key={p.v}
                        className={`pos-opt ${theme.position === p.v ? "sel" : ""}`}
                        onClick={() => setT({ position: p.v })}
                      >{p.l}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}


          {step === 3 && (
            <>
              <div className="step-card-head">
                <div className="step-card-icon" style={{ background: "#fefce8" }}>⚡</div>
                <div>
                  <div className="step-card-title">Get Your Script</div>
                  <div className="step-card-sub">Embed &amp; go live in 30 seconds</div>
                </div>
              </div>

              <div className="success-banner">
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 800, color: "#0f172a", marginBottom: 4,
                }}>
                  {botInfo.name || "Your Chatbot"} is ready!
                </div>
                <p style={{ fontSize: 12, color: "#64748b" }}>
                  {pdfData ? `📎 ${pdfData.name} · ` : ""}
                  Theme: {PRESETS.find(p => p.primary === theme.primary)?.name ?? "Custom"}
                  {" · "}Avatar: {theme.avatar}
                </p>
              </div>

              <div className="sec-title">Embed Code</div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                Paste before{" "}
                <code style={{ color: "#f97316", background: "#fff7ed", padding: "1px 5px", borderRadius: 4 }}>
                  &lt;/body&gt;
                </code>{" "}
                on your website:
              </p>

              <div className="code-block">
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                {scriptStr}
              </div>
              <div className="divider" style={{ margin: "20px 0" }} />
              <div className="sec-title">🧪 Test Your Bot Live</div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Chat with your configured bot right now:
              </p>

              <div className="chat-box">
                <div className="chat-head">
                  <div className="chat-dot" />
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    {botInfo.name || "Assistant"}
                  </span>
                  <span style={{ fontSize: 11, color: "#334155", marginLeft: 6 }}>· Live Test</span>
                </div>
                <div className="chat-msgs">
                  {(msgs ?? []).map((m, i) => (
                    <div key={i} className={m.role === "user" ? "msg-user" : "msg-bot"}>
                      {m.role === "bot"
                        ? <BotMessage text={m.text} accentColor={theme.primary} />
                        : m.text
                      }
                    </div>
                  ))}
                  {thinking && (
                    <div className="msg-thinking">
                      <div className="dp" /><div className="dp" /><div className="dp" />
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
                <div className="chat-footer">
                  <input
                    className="chat-in"
                    value={chatIn}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setChatIn(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder={`Ask ${botInfo.name || "the bot"} something...`}
                    disabled={thinking}
                  />
                  <button
                    className="send-btn"
                    onClick={() => void sendChat()}
                    disabled={thinking || !chatIn.trim()}
                  >
                    {thinking ? "···" : "Send →"}
                  </button>
                </div>
              </div>
            </>
          )}


          <div className="bottom-nav">
            {step > 0
              ? <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
              : <div />}

            <div className="step-count">Step {step + 1} of {STEP_DEFS.length}</div>

            {step < STEP_DEFS.length - 1 ? (
              <button
                className={`btn-next ${canNext ? "hi" : ""}`}
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
              >
                {step === 2 ? "Generate Script ⚡" : "Continue →"}
              </button>
            ) : (
              <button className="btn-next hi" onClick={handleReset}>
                + New Bot
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}