import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, Shield, RefreshCw, PhoneCall, Bot, User, CornerDownRight, Frown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SUGGESTED_PROMPTS = [
  { text: "I am feeling extremely stressed right now.", label: "Stressed", shona: "Ndiri kunzwa kuremerwa mupfungwa." },
  { text: "Help me practice a quick anxiety grounding exercise.", label: "Grounding", shona: "Ndiratidze zvekuita kuti ndive nerugare." },
  { text: "What is CBT and how can it help my thoughts?", label: "CBT Help", shona: "Dzidziso yeCBT inondibatsira sei?" }
];

interface ChatProps {
  onBackToHome: () => void;
}

export default function Chat({ onBackToHome }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<"en" | "sn" | "nd">("en");
  const [showCrisisBox, setShowCrisisBox] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Load initial welcome message
  useEffect(() => {
    const fetchWelcome = () => {
      const welcomeMsg: ChatMessage = {
        id: "w1",
        role: "assistant",
        content: getWelcomeMessage(lang),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([welcomeMsg]);
    };
    fetchWelcome();
  }, [lang]);

  // Keep scrolled to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getWelcomeMessage = (l: "en" | "sn" | "nd") => {
    if (l === "sn") {
      return "Mhoro vanangu. Ndiri Moyo Support Bot, ndiri peer AI diki yemumiriri yako yemufaro. Pano takachengetedzwa, hapana anoziva zita renyu uye muchat dzedu dzinogara dzakavandika (anonymous). Muri kunzwa sei nhasi? Ndipo pekugovana zvose zviri mumwoyo zvinonetesa.";
    }
    if (l === "nd") {
      return "Sabona mngane. NginguMoyo Support Bot, ngilapha ukukulalela lokukusiza. Endaweni le kuyimfihlo, amabizo enu kawaziwa ngumuntu njalo konke esikuxoxayo kuvikelekile. Linjani namhla? Khululeka ungitshele okukuhluphayo.";
    }
    return "Hello. I am Moyo Support Bot, your anonymous AI peer supporter. Here, your identity is completely shielded and your conversations are strictly private. How can I support you today? Please feel free to share whatever is weighing on your mind.";
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Trigger crisis analysis locally first
    analyzeCrisisSignals(textToSend);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build discussion log for the context of Gemini API
      // Server-side expectation: list of messages { role: 'user' | 'assistant', content: string }
      const chatLogs = [...messages.slice(-6), userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatLogs })
      });

      if (!res.ok) {
        throw new Error("Chat service communication error.");
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      // Construct a safe offline fallback reply
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: "I'm experiencing a tiny connection issue, but please know that I am still standing with you. Remember that you are safe here. If things are extremely heavy, please dial our anonymous hotline at 0808 123 4567.",
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeCrisisSignals = (text: string) => {
    const normalized = text.toLowerCase();
    const flags = [
      "suicide", "kill myself", "die", "kufa", "kuzviuraya", "cheka", "loza",
      "hupenyu hwakaoma handichagone", "cutting", "self harm", "unenyaya yekufa"
    ];
    
    const hasTrigger = flags.some(flag => normalized.includes(flag));
    if (hasTrigger) {
      setShowCrisisBox(true);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "w1",
        role: "assistant",
        content: getWelcomeMessage(lang),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setShowCrisisBox(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-2 px-1 flex flex-col h-[calc(100vh-170px)]">
      {/* Top action bar */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <button
          onClick={onBackToHome}
          className="text-label-md text-moyo-muted flex items-center gap-1 hover:text-moyo-primary transition-colors cursor-pointer"
        >
          &larr; {lang === "en" ? "Home" : "Dzokera"}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={resetChat}
            className="p-1.5 rounded-lg border border-moyo-border/40 text-moyo-muted hover:text-moyo-primary hover:bg-white transition-all cursor-pointer"
            title="Clean chat logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Core Language Selection */}
          <div className="flex border border-moyo-border/60 rounded-lg p-0.5 bg-white shadow-sm">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                lang === "en" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("sn")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                lang === "sn" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
              }`}
            >
              Shona
            </button>
            <button
              onClick={() => setLang("nd")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                lang === "nd" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
              }`}
            >
              Ndebele
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Crisis Trigger Box */}
      {showCrisisBox && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 shrink-0"
        >
          <div className="flex gap-3">
            <Frown className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-moyo-primary text-xs uppercase tracking-wider">
                {lang === "en" ? "Immediate Supportive Assistance" : "Moyo Emergency Helpline"}
              </h4>
              <p className="text-xs text-moyo-muted leading-relaxed mt-1">
                {lang === "en"
                  ? "We hear you, and we want you to be safe. Because this is an AI supporter, it is critical that you connect with real crisis specialists. Moyo hotline is anonymous, 100% secure, and free in Zimbabwe."
                  : "Mwoyo wangu unorwadziwa nekunzwa izvi. Nemhaka yekuti ini ndiri AI support bot, ndapota fona nekukurumidza panhamba dzedu panhamba idzi kuitira kutaura nemunhu wechokwadi izvozvo."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <a
                  href="tel:08081234567"
                  className="py-2.5 px-4 bg-red-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Dial: 0808 123 4567
                </a>
                <button
                  onClick={() => setShowCrisisBox(false)}
                  className="py-2 px-3 border border-moyo-border text-moyo-primary text-xs font-bold rounded-lg hover:bg-white"
                >
                  {lang === "en" ? "I am safe and want to continue chatting" : "Ndiri nani, rambai tichitaura"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Messages Log Area */}
      <div className="flex-1 bg-white rounded-2xl border border-moyo-border/40 shadow-sm overflow-y-auto mb-4 p-4 min-h-0 space-y-4">
        <div className="flex items-center justify-center gap-2 text-[11px] text-moyo-muted bg-moyo-bg py-2 px-4 rounded-xl border border-moyo-border/30 max-w-md mx-auto">
          <Shield className="w-3.5 h-3.5 text-moyo-secondary shrink-0" />
          <span>{lang === "en" ? "Private, anonymous chat. Messages are never saved." : "Inotarisirwa uye yakavandika zvachose. Hapana zita renyu."}</span>
        </div>

        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUser ? "bg-moyo-secondary-container/30 text-moyo-secondary" : "bg-moyo-primary-container text-white"}`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message block */}
              <div>
                <div className={`p-3.5 rounded-2xl text-sm ${
                  isUser
                    ? "bg-moyo-primary text-white rounded-tr-none"
                    : "bg-moyo-bg text-moyo-primary rounded-tl-none border border-moyo-border/30"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                <span className={`text-[9px] font-bold text-moyo-muted block mt-1 ${isUser ? "text-right" : "text-left"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2.5 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-moyo-primary-container text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-moyo-bg/50 border border-moyo-border/20 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-moyo-secondary animate-bounce delay-0" />
              <span className="w-2 h-2 rounded-full bg-moyo-secondary animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-moyo-secondary animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Suggested prompts list */}
      {messages.length === 1 && (
        <div className="mb-3 shrink-0">
          <span className="text-[10px] font-bold text-moyo-secondary uppercase tracking-widest block mb-1.5">
            {lang === "en" ? "Common Discussion starters" : "Mibvunzo yaungatanga nayo"}
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSendMessage(lang === "sn" ? p.shona : p.text)}
                type="button"
                className="text-xs bg-white hover:bg-moyo-bg border border-moyo-border/60 text-moyo-primary py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-moyo-on-tertiary-container" />
                <span>{lang === "sn" ? p.shona : p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Writing footer input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex gap-2 shrink-0 bg-white p-2 rounded-xl border border-moyo-border/40 shadow-sm"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={lang === "en" ? "Type anonymous message..." : "Nyorai pano zvakavanzika..."}
          className="flex-1 text-sm bg-transparent border-0 focus:ring-0 text-moyo-primary px-2"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            inputValue.trim()
              ? "bg-moyo-primary text-white hover:bg-moyo-primary-container"
              : "bg-moyo-bg text-moyo-muted"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
