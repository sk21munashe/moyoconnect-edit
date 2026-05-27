import React, { useState, useEffect } from "react";
import { JournalEntry } from "../types";
import { BookOpen, Calendar, Clock, Smile, Sparkles, Trash2, Check, ArrowDownCircle, Heart, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WRITING_PROMPTS = {
  en: [
    "What are three things you are genuinely grateful for in your life today?",
    "Describe a small victory you achieved, or an obstacle you overcame recently.",
    "What is currently heavy on your mind, and how can you gently let a bit of it go?",
    "Write a kind, compassionate message to yourself as if you were encouraging a dear friend."
  ],
  sn: [
    "Ndezvipi zvinhu zvitatu zvaunotenda nazvo muhupenyu hwako nhasi?",
    "Tsanangura chinhu chidiki chawakakunda kana mhinganidzo yawak преодолеть ?",
    "Chii chiri kunyanya kuremera mupfungwa dzako, uye ungaedze sei kurerutsa moyo mucheche?",
    "Nyorera mwoyo wako tsamba inodziya yerudo seunonyora kune hushamwari hwakanaka huda."
  ],
  nd: [
    "Zviphi izinto ezintathu ozibongayo empilweni yakho namhla?",
    "Chaza into encane oyinqobileyo, loba ubunzima obunqobileyo duku du.",
    "Kuyini okusindayo emcabangweni wakho namhla, njalo unga kwenza njani ukuthi kukhulu?"
  ]
};

const MOODS = [
  { emoji: "😊", label: "Joyful", shona: "Kufara", ndebele: "Ukuthokoza", colorClass: "text-green-500 bg-green-50 border-green-200" },
  { emoji: "🍃", label: "Calm", shona: "Rugare", ndebele: "Kuzola", colorClass: "text-teal-500 bg-teal-50 border-teal-200" },
  { emoji: "😰", label: "Anxious", shona: "Kutya", ndebele: "Uvalo", colorClass: "text-amber-500 bg-amber-50 border-amber-200" },
  { emoji: "😔", label: "Sad", shona: "Kusuwa", ndebele: "Ukudana", colorClass: "text-blue-500 bg-blue-50 border-blue-200" },
  { emoji: "😡", label: "Angry", shona: "Kutsamwa", ndebele: "Ukunyanya", colorClass: "text-red-500 bg-red-50 border-red-200" }
];

interface JournalProps {
  onBackToHome: () => void;
}

export default function Journal({ onBackToHome }: JournalProps) {
  const [lang, setLang] = useState<"en" | "sn" | "nd">("en");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [thoughts, setThoughts] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[1]); // Default to Calm
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load historical entries
    const stored = localStorage.getItem("moyo_journal_entries");
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
    // Set an initial prompt
    const prompts = WRITING_PROMPTS[lang];
    setSelectedPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  const changeLanguage = (newLang: "en" | "sn" | "nd") => {
    setLang(newLang);
    const prompts = WRITING_PROMPTS[newLang];
    // Find if current prompt can be matchable or just assign new
    setSelectedPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const handleRandomizePrompt = () => {
    const prompts = WRITING_PROMPTS[lang];
    const otherPrompts = prompts.filter(p => p !== selectedPrompt);
    const chosen = otherPrompts.length > 0 
      ? otherPrompts[Math.floor(Math.random() * otherPrompts.length)]
      : prompts[0];
    setSelectedPrompt(chosen);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughts.trim()) return;

    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedTime = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    });

    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: formattedDate,
      time: formattedTime,
      mood: `${selectedMood.emoji} ${selectedMood.label} (${lang === "sn" ? selectedMood.shona : lang === "nd" ? selectedMood.ndebele : selectedMood.label})`,
      thoughts: thoughts.trim(),
      prompt: selectedPrompt
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("moyo_journal_entries", JSON.stringify(updated));

    // Clear form & animate success
    setThoughts("");
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleDeleteEntry = (id: string) => {
    const filtered = entries.filter((item) => item.id !== id);
    setEntries(filtered);
    localStorage.setItem("moyo_journal_entries", JSON.stringify(filtered));
  };

  const getTranslatedText = (key: string) => {
    const dict = {
      title: { en: "Guided Reflection Journal", sn: "Bhuku reZvakavanzika neKufunga", nd: "Ugwadlo Lokuchaza Imizwa" },
      subtitle: { en: "Writing promotes stress release. Feel secure expressing anything here—completely safely.", sn: "Kunyora kunorerutsa mufungo wakadzvinyiririka. Nyorai zvese zvakasununguka--zvakavanzika zvachose.", nd: "Ukubhala kwehlisa uvalo lobunzima bengqondo. Khululeka ubhale konke okukumicabango yakho." },
      placeholder: { en: "Write your thoughts here freely...", sn: "Nyorai zvamuri kufunga pano zvakasununguka...", nd: "Bhala imicabango yakho lapha ukhululekile..." },
      moodTitle: { en: "How is your mood right now?", sn: "Mwari/Rugare rwemwoyo wako rwakadii?", nd: "Uzizwa njani namhla?" },
      save: { en: "Save Reflection Log", sn: "Chengetedza Gwaro", nd: "Bulungisela isikhathi log" },
      history: { en: "Your Secure Reflections", sn: "Zvamakanyora Zvakachengetedka", nd: "Amagwadlo ako aphephileyo" },
      noEntries: { en: "No saved journal entries yet. Your secure thoughts will appear here.", sn: "Hauna zvawakanyora zvati zvakachengetwa. Zvese zvauchanyora zvicharatidzwa pano.", nd: "Awulagwadlo olulondolozileyo okwamanje. Emva kokubhala, azavela lapha." },
      promptAction: { en: "Try Another Writing Prompt", sn: "Edza mumwe mubvunzo", nd: "Linga omunye umbuzo" },
      successMsg: { en: "Saved anonymously to your secure browser storage!", sn: "Zvakachengetwa zvakavanzika mubrowser menyu!", nd: "Kulondolozwe endaweni eyimfihlo yebrowser yakho!" }
    } as any;
    return dict[key]?.[lang] || dict[key]?.["en"] || "";
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-1">
      {/* Header Language Toggles */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="text-label-md text-moyo-muted flex items-center gap-1 hover:text-moyo-primary transition-colors cursor-pointer"
        >
          &larr; {lang === "en" ? "Back to Home" : "Dzokera"}
        </button>

        <div className="flex border border-moyo-border/60 rounded-lg p-0.5 bg-white shadow-sm">
          <button
            onClick={() => changeLanguage("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "en" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("sn")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "sn" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            Shona
          </button>
          <button
            onClick={() => changeLanguage("nd")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "nd" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            Ndebele
          </button>
        </div>
      </div>

      {/* Primary Workspace */}
      <div className="bg-white rounded-2xl border border-moyo-border/50 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-2 text-moyo-secondary">
          <PenTool className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === "en" ? "Guided Writing Space" : "Zvekunyora"}
          </span>
        </div>
        <h2 className="text-2xl font-display font-bold text-moyo-primary mb-2">
          {getTranslatedText("title")}
        </h2>
        <p className="text-sm text-moyo-muted mb-6">
          {getTranslatedText("subtitle")}
        </p>

        <form onSubmit={handleSaveEntry}>
          {/* Active Prompt Card */}
          <div className="bg-moyo-bg border border-moyo-border/40 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-extrabold text-moyo-secondary tracking-wider block">
                {lang === "en" ? "Recommended Journal Prompt" : "Zano reKufunga richakubatsira"}
              </span>
              <button
                type="button"
                onClick={handleRandomizePrompt}
                className="text-xs font-semibold text-moyo-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-moyo-on-tertiary-container" />
                {getTranslatedText("promptAction")}
              </button>
            </div>
            <p className="text-sm font-semibold text-moyo-primary leading-relaxed italic">
              &ldquo;{selectedPrompt}&rdquo;
            </p>
          </div>

          {/* Mood Selector Grid */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase text-moyo-primary block mb-3 tracking-widest">
              {getTranslatedText("moodTitle")}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood.label === m.label;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-moyo-secondary-container/30 border-moyo-secondary shadow-sm scale-105"
                        : "bg-white border-moyo-border/50 hover:border-moyo-secondary/50 grayscale opacity-80"
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-moyo-primary text-center leading-tight">
                      {lang === "sn" ? m.shona : lang === "nd" ? m.ndebele : m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thoughts TextArea */}
          <div className="mb-5">
            <textarea
              rows={5}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder={getTranslatedText("placeholder")}
              className="w-full text-sm p-4 border border-moyo-border/70 rounded-xl focus:border-moyo-primary focus:ring-1 focus:ring-moyo-primary bg-moyo-bg/30 text-moyo-primary max-h-96"
            />
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!thoughts.trim()}
              className={`py-3 px-6 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                thoughts.trim()
                  ? "bg-moyo-primary text-white hover:bg-moyo-primary-container"
                  : "bg-moyo-border/30 text-moyo-muted cursor-not-allowed border border-moyo-border/30"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {getTranslatedText("save")}
            </button>

            <AnimatePresence>
              {savedSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-moyo-secondary font-bold"
                >
                  <Check className="w-4 h-4 text-moyo-secondary" />
                  <span>{getTranslatedText("successMsg")}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Historical Logs List */}
      <div className="bg-white rounded-2xl border border-moyo-border/50 shadow-sm p-6">
        <h3 className="text-lg font-display font-bold text-moyo-primary mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-moyo-secondary" />
          {getTranslatedText("history")}
          <span className="text-xs bg-moyo-bg text-moyo-primary px-2.5 py-0.5 rounded-full font-mono">
            {entries.length}
          </span>
        </h3>

        {entries.length === 0 ? (
          <div className="text-center py-10 text-moyo-muted">
            <Smile className="w-10 h-10 mx-auto text-moyo-border mb-3" />
            <p className="text-xs max-w-sm mx-auto">
              {getTranslatedText("noEntries")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-moyo-bg spacing-y-4">
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  className="py-5 flex items-start gap-4 justify-between"
                >
                  <div className="flex-1">
                    {/* Timestamp & Mood badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-moyo-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-moyo-secondary" />
                        {entry.date}
                      </span>
                      <span className="text-[11px] font-bold text-moyo-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-moyo-secondary" />
                        {entry.time}
                      </span>
                      <span className="text-[10px] font-bold bg-moyo-bg text-moyo-primary px-2 py-0.5 rounded-full">
                        {entry.mood}
                      </span>
                    </div>

                    {/* Historical Prompt Context */}
                    {entry.prompt && (
                      <p className="text-[11px] font-semibold text-moyo-muted italic mb-2 border-l-2 border-moyo-border/40 pl-2 leading-tight">
                        &ldquo;{entry.prompt}&rdquo;
                      </p>
                    )}

                    {/* Content text */}
                    <p className="text-sm text-moyo-primary leading-relaxed whitespace-pre-wrap">
                      {entry.thoughts}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 border border-moyo-border/40 text-moyo-muted hover:text-moyo-error hover:bg-red-50 hover:border-red-100 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Delete anonymously"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
