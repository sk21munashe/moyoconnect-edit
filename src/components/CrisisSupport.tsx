import React, { useState, useEffect } from "react";
import { PhoneCall, Heart, Wind, Shuffle, ShieldCheck, Sun, Compass, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SENSORY_LEVELS = [
  { step: 5, prompt: "Find 5 things you can SEE around you.", desc: "Focus on details like textures, colors, or objects in the room.", shona: "Tarisai zvinhu zvishanu (5) zviri pedyo nemwi." },
  { step: 4, prompt: "Find 4 things you can TOUCH right now.", desc: "Feel the density of your chair, the surface of your skin, or your desk.", shona: "Batai zvinhu zvina (4) zvakasiyana pane mave." },
  { step: 3, prompt: "Acknowledge 3 things you can HEAR.", desc: "Listen for birds whistling, wind blow, or background cars hum.", shona: "Teererai mitinhimira mitatu (3) yakasiyana." },
  { step: 2, prompt: "Acknowledge 2 things you can SMELL.", desc: "Inhale slowly. Notice coffee scent, fresh rain, or wooden tones.", shona: "Nunhurirai miviri (2) yakasiyana mupfungwa." },
  { step: 1, prompt: "Acknowledge 1 thing you can TASTE.", desc: "Focus on the lingering taste in your mouth, or some cool water.", shona: "Ravira chinhu chimwe chete (1) zvakaenzana." }
];

const EMERGENCY_DIRECTORIES = [
  { name: "Moyo Toll-Free secure line", number: "0808 123 4567", desc: "Available 24/7 in English, Shona, and Ndebele. Anonymous, zero charge.", shona: "Manhamba Moyo 24/7 yemahara." },
  { name: "Friendship Bench National", number: "+263 775 423 355", desc: "Professional and peer counseling benches across Zimbabwe.", shona: "Friendship Bench rekutaurirana mazuva ose." },
  { name: "Childline Zimbabwe Toll-Free", number: "116", desc: "Toll-free youth distress and crisis reporting support line.", shona: "Toll-free yerutsigiro wevana neVachiri vaduku." }
];

export default function CrisisSupport() {
  const [lang, setLang] = useState<"en" | "sn">("en");
  const [breathCycle, setBreathCycle] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [activeSensoryIdx, setActiveSensoryIdx] = useState(0);
  const [completedSensory, setCompletedSensory] = useState(false);

  // Setup breathing pacing simulation
  useEffect(() => {
    let timer: any;
    const runCycle = () => {
      setBreathCycle("inhale");
      timer = setTimeout(() => {
        setBreathCycle("hold");
        timer = setTimeout(() => {
          setBreathCycle("exhale");
          timer = setTimeout(() => {
            setBreathCycle("rest");
            timer = setTimeout(runCycle, 4000); // 4s rest
          }, 4000); // 4s exhale
        }, 4000); // 4s hold
      }, 4000); // 4s inhale
    };

    runCycle();
    return () => clearTimeout(timer);
  }, []);

  const getBreathInstructions = () => {
    switch (breathCycle) {
      case "inhale":
        return { text: "Breathe In / Femera Mukati", desc: "Slowly draw air through your nose, expansion...", bg: "bg-moyo-secondary-container/20 border-moyo-secondary" };
      case "hold":
        return { text: "Hold... / Mira zvishoma", desc: "Rest tranquil in this space. No stress.", bg: "bg-moyo-primary-container/20 border-moyo-primary" };
      case "exhale":
        return { text: "Exhale... / Budisa mweya", desc: "Slowly release all tension through your mouth.", bg: "bg-moyo-error-container/10 border-moyo-error" };
      case "rest":
        return { text: "Hold... / Garikai munaro", desc: "Relax completely before the next inhalation cycle.", bg: "bg-moyo-bg border-moyo-border" };
    }
  };

  const handleNextSensory = () => {
    if (activeSensoryIdx < SENSORY_LEVELS.length - 1) {
      setActiveSensoryIdx(activeSensoryIdx + 1);
    } else {
      setCompletedSensory(true);
    }
  };

  const resetSensory = () => {
    setActiveSensoryIdx(0);
    setCompletedSensory(false);
  };

  const activeSensory = SENSORY_LEVELS[activeSensoryIdx];
  const breathState = getBreathInstructions();

  return (
    <div className="max-w-2xl mx-auto py-4 px-1 space-y-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <div className="flex items-center gap-2 mb-2 text-moyo-error">
            <Heart className="w-5 h-5 fill-moyo-error animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[10.5px]">Rapid Grounding Center</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-moyo-primary mb-1">
            Crisis &amp; Emergency Support
          </h2>
          <p className="text-sm text-moyo-muted">
            Instant, safe physical and mental grounding tools to reduce panic and anxiety in Zimbabwe.
          </p>
        </div>

        <div className="flex border border-moyo-border/60 rounded-lg p-0.5 bg-white shadow-sm shrink-0">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              lang === "en" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("sn")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              lang === "sn" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            Shona
          </button>
        </div>
      </div>

      {/* EMERGENCY DIRECTORY PANEL */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-md font-display font-black text-moyo-primary mb-1 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-red-600 animate-bounce" />
          {lang === "en" ? "Zimbabwe Emergency Lines" : "Manhamba ezveMatambudziko muZimbabwe"}
        </h3>
        <p className="text-xs text-moyo-muted mb-4 leading-relaxed">
          If you or someone else is in immediate deep danger, please dial a secure helpline. These are fully private, free, and available 24/7.
        </p>

        <div className="space-y-4 divide-y divide-red-200">
          {EMERGENCY_DIRECTORIES.map((dir, idx) => (
            <div key={dir.number} className={`pt-4 ${idx === 0 ? "pt-0 border-0" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-moyo-primary">{dir.name}</h4>
                  <p className="text-xs text-moyo-muted leading-relaxed">
                    {lang === "sn" && dir.shona ? dir.shona : dir.desc}
                  </p>
                </div>
                <a
                  href={`tel:${dir.number}`}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {dir.number}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE BOX BREATHING CARD */}
      <div className="bg-white rounded-2xl border border-moyo-border/40 p-6 shadow-sm flex flex-col items-center text-center">
        <span className="text-[10px] font-extrabold uppercase text-moyo-secondary tracking-widest mb-2">
          BOX BREATHING PRACTICE (4-4-4-4 Technique)
        </span>
        <h3 className="text-lg font-display font-bold text-moyo-primary mb-6">
          Calm your heart rate in real time. Follow the circle:
        </h3>

        {/* Dynamic visual bubble */}
        <div className="mb-6 relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-moyo-secondary-container/10 rounded-full scale-110 opacity-30 animate-pulse" />
          
          {/* Animated shrinking/expanding indicator */}
          <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center p-4 transition-all duration-[4000ms] ease-in-out ${breathState.bg} ${
            breathCycle === "inhale" ? "scale-110" : breathCycle === "exhale" ? "scale-90" : "scale-100"
          }`}>
            <Wind className="w-6 h-6 text-moyo-secondary mb-1" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-moyo-primary">4 Secs</span>
          </div>
        </div>

        {/* Instruction copy */}
        <div className="max-w-xs mb-2">
          <h4 className="font-display font-black text-lg text-moyo-primary leading-tight">
            {breathState.text}
          </h4>
          <p className="text-xs text-moyo-muted mt-1 underline decoration-moyo-secondary/30 decoration-2">
            {breathState.desc}
          </p>
        </div>
      </div>

      {/* 5-4-3-2-1 SENSORY GROUNDING GUIDE */}
      <div className="bg-white rounded-2xl border border-moyo-border/40 p-6 shadow-sm">
        <span className="text-[10px] font-extrabold uppercase text-moyo-secondary tracking-widest block mb-1">
          {lang === "en" ? "5-4-3-2-1 SENSORY CHECKLIST" : "KUNZWISISA ZVINOKA POTEREREI"}
        </span>
        <h3 className="text-lg font-display font-bold text-moyo-primary mb-4">
          Mindfulness Grounding Worksheet
        </h3>

        <AnimatePresence mode="wait">
          {!completedSensory ? (
            <motion.div
              key="active-sensory"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-moyo-bg/70 border border-moyo-border/20 rounded-2xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="w-8 h-8 rounded-full bg-moyo-primary text-white text-xs font-black flex items-center justify-center">
                  {activeSensory.step}
                </span>
                <span className="text-[10px] font-bold text-moyo-muted uppercase tracking-wider">
                  Step {SENSORY_LEVELS.length - activeSensoryIdx} of {SENSORY_LEVELS.length}
                </span>
              </div>

              <h4 className="text-sm font-display font-bold text-moyo-primary mb-1">
                {lang === "sn" ? activeSensory.shona : activeSensory.prompt}
              </h4>
              <p className="text-xs text-moyo-muted leading-relaxed mb-4">
                {activeSensory.desc}
              </p>

              <button
                onClick={handleNextSensory}
                className="py-2 px-5 bg-moyo-secondary text-white font-bold text-xs rounded-xl hover:bg-moyo-on-secondary-container transition ml-auto flex items-center gap-1 cursor-pointer"
              >
                {activeSensoryIdx < SENSORY_LEVELS.length - 1 ? "Next Step / Matanho Mutsa" : "Complete Challenge"}
                <Check className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="complete-sensory"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-moyo-secondary-container/10 border border-moyo-secondary rounded-2xl p-5 text-center flex flex-col items-center"
            >
              <Sun className="w-8 h-8 text-moyo-secondary mb-2 animate-spin-slow" />
              <h4 className="text-sm font-display font-bold text-moyo-primary mb-1">
                Sensory grounding complete. Excellent!
              </h4>
              <p className="text-xs text-moyo-muted leading-relaxed max-w-sm mb-4">
                By focusing on physical sensations, you successfully cooled down your neurological system's threat responses. How do you feel? You are safe.
              </p>
              <button
                onClick={resetSensory}
                className="text-xs font-bold text-moyo-primary hover:underline cursor-pointer"
              >
                Practice sensory checklist again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
