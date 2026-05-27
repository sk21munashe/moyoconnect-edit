import React, { useState, useEffect } from "react";
import { CBTThoughtRecord } from "../types";
import { BrainCircuit, BookCheck, ClipboardList, Info, Trash2, ArrowRight, CornerRightDown, Plus, Smile, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CBTProps {
  onBackToHome: () => void;
}

export default function CBT({ onBackToHome }: CBTProps) {
  const [lang, setLang] = useState<"en" | "sn">("en");
  const [records, setRecords] = useState<CBTThoughtRecord[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [preMoodRating, setPreMoodRating] = useState(70);
  const [evidenceFor, setEvidenceFor] = useState("");
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  const [balancedThought, setBalancedThought] = useState("");
  const [postMoodRating, setPostMoodRating] = useState(40);

  useEffect(() => {
    // Load thoughts records
    const stored = localStorage.getItem("moyo_cbt_records");
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation || !automaticThought || !balancedThought) return;

    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const newRecord: CBTThoughtRecord = {
      id: Math.random().toString(36).substring(2, 9),
      date: dateStr,
      situation,
      automaticThought,
      subconsciousNegative: "",
      evidenceFor,
      evidenceAgainst,
      balancedThought,
      preMoodRating,
      postMoodRating
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem("moyo_cbt_records", JSON.stringify(updated));

    // Reset Form
    setSituation("");
    setAutomaticThought("");
    setPreMoodRating(70);
    setEvidenceFor("");
    setEvidenceAgainst("");
    setBalancedThought("");
    setPostMoodRating(40);
    
    // Animate view
    setActiveStep(1);
    setShowForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    const filtered = records.filter(r => r.id !== id);
    setRecords(filtered);
    localStorage.setItem("moyo_cbt_records", JSON.stringify(filtered));
  };

  const getTranslated = (key: string) => {
    const dictionary = {
      title: { en: "Self-Help CBT Thought Record", sn: "Kurerutsa Pundutso yePfungwa (CBT)" },
      subtitle: { en: "Cognitive Behavioral Therapy (CBT) helps you challenge automatic negative stories. Challenge your thoughts securely.", sn: "Dzidziso yeCBT inokubatsira kuongorora nekugadzirisa mufungo unokurasisa mupfungwa zvakavanzika." },
      addBtn: { en: "Record New Thought Challenge", sn: "Gadzira Challenge Itsva" },
      historyTitle: { en: "Your CBT Thought Records", sn: "Matanho Atorwa neCBT" },
      noLogs: { en: "Your cognitive challenges will appear here. Tap above to challenge a negative belief.", sn: "Hatina mufungo wawakambopikisa nemaitiro aya apo. Dzidza patsva kutaura chokwadi nemufungo izvozvi." },
      step1: { en: "Step 1: The Situation", sn: "Nhanho 1: Zvaitika" },
      step1Desc: { en: "What triggered your distress? Describe what happened objectively.", sn: "Chii chiri kuitika kana chakanyanya kukonzera dambudziko iri?" },
      step2: { en: "Step 2: Negative Belief", sn: "Nhanho 2: Mufungo Unoshungurudza" },
      step2Desc: { en: "What automatic negative story did your brain instantly tell you?", sn: "Mufungo upi wakashata wakabva wauya mupfungwa dzenyu?" },
      step3: { en: "Step 3: Initial Distress", sn: "Nhanho 3: Kudzvinyiririka kweKutanga" },
      step3Desc: { en: "How anxious or distressed does this thought make you feel (0-100%)?", sn: "Huremu hwekushungurudzwa kwasvika papi parizvino (0-100%)?" },
      step4: { en: "Step 4: Evidence For & Against", sn: "Nhanho 4: Humbowo neChokwadi" },
      step4Desc: { en: "What objective facts support the thought? What are facts that prove it wrong?", sn: "Ndezvipi chokwadi chinotsigira mufungo iwoyo? Uye ndezvipi zvinoratidza kuti handizvo?" },
      step5: { en: "Step 5: Balanced Thought", sn: "Nhanho 5: Mufungo Wakaponderwa" },
      step5Desc: { en: "Based on all facts, write a realistic, compassionate alternative perspective.", sn: "Pasi pematunhu aya, nyorai chokwadi chisingakukuvadzei icho chakadzikama." },
      step6: { en: "Step 6: Re-rate Distress", sn: "Nhanho 6: Kudzvinyiririka kweMhedzisiro" },
      step6Desc: { en: "With this balanced thought in mind, rate your distress level now (0-100%).", sn: "Munowana upenyu zvakadiniko nekuda kwemufungo mutsva wakadzikama uyu (0-100%)?" },
      save: { en: "Complete Thought Record", sn: "Ndapedza Ongororo yeCBT" }
    } as any;
    return dictionary[key]?.[lang] || dictionary[key]?.["en"] || "";
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-1">
      {/* Upper header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="text-label-md text-moyo-muted flex items-center gap-1 hover:text-moyo-primary transition-colors cursor-pointer"
        >
          &larr; {lang === "en" ? "Home" : "Musha"}
        </button>

        <div className="flex border border-moyo-border/60 rounded-lg p-0.5 bg-white shadow-sm">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "en" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("sn")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "sn" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            Shona
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-moyo-secondary">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {lang === "en" ? "Cognitive Reframing" : "Dzidziso yePfungwa"}
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-moyo-primary mb-1">
            {getTranslated("title")}
          </h2>
          <p className="text-sm text-moyo-muted">
            {getTranslated("subtitle")}
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="py-2.5 px-4 bg-moyo-primary text-white font-bold text-xs rounded-xl hover:bg-moyo-primary-container transition shadow flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {getTranslated("addBtn")}
          </button>
        )}
      </div>

      {/* CBT Step-by-Step Form Container */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-moyo-border/50 shadow-sm p-6 mb-6">
          <div className="border-b border-moyo-bg pb-4 mb-6 flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase text-moyo-secondary tracking-widest">
              {lang === "en" ? "RECORD IN PROGRESS" : "ONGORORO YE CBT IRI KUITWA"}
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-moyo-muted hover:text-moyo-primary"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveRecord}>
            {/* Step 1 */}
            {activeStep === 1 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step1")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step1Desc")}</p>
                <textarea
                  rows={3}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g., My brother didn't reply to my WhatsApp message all day."
                  className="w-full text-sm p-4 border border-moyo-border/70 rounded-xl focus:border-moyo-primary focus:ring-1 focus:ring-moyo-primary text-moyo-primary bg-moyo-bg/20"
                />
                <button
                  type="button"
                  disabled={!situation.trim()}
                  onClick={() => setActiveStep(2)}
                  className="mt-4 py-2.5 px-5 bg-moyo-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 ml-auto disabled:opacity-50 hover:bg-moyo-primary-container cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            )}

            {/* Step 2 */}
            {activeStep === 2 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step2")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step2Desc")}</p>
                <textarea
                  rows={3}
                  value={automaticThought}
                  onChange={(e) => setAutomaticThought(e.target.value)}
                  placeholder="e.g., He is ignoring me on purpose because he doesn't care about me."
                  className="w-full text-sm p-4 border border-moyo-border/70 rounded-xl focus:border-moyo-primary focus:ring-1 focus:ring-moyo-primary text-moyo-primary bg-moyo-bg/20"
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs text-moyo-muted underline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!automaticThought.trim()}
                    onClick={() => setActiveStep(3)}
                    className="py-2.5 px-5 bg-moyo-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-50 hover:bg-moyo-primary-container cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {activeStep === 3 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step3")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step3Desc")}</p>
                
                <div className="bg-moyo-bg/50 border border-moyo-border/30 rounded-xl p-5 mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-moyo-primary">Initial Anxiety Level:</span>
                  <span className="text-2xl font-display font-black text-moyo-primary">{preMoodRating}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preMoodRating}
                  onChange={(e) => setPreMoodRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-moyo-bg rounded-lg appearance-none cursor-pointer accent-moyo-primary"
                />

                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="text-xs text-moyo-muted underline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="py-2.5 px-5 bg-moyo-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-moyo-primary-container cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {activeStep === 4 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step4")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step4Desc")}</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-moyo-primary block mb-1 uppercase tracking-wider">
                      Facts that support that thought:
                    </label>
                    <textarea
                      rows={2}
                      value={evidenceFor}
                      onChange={(e) => setEvidenceFor(e.target.value)}
                      placeholder="e.g., He was online on WhatsApp in the afternoon but didn't reply."
                      className="w-full text-xs p-3 border border-moyo-border/60 rounded-xl text-moyo-primary bg-moyo-bg/10"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-moyo-primary block mb-1 uppercase tracking-wider">
                      Facts that offer another explanation:
                    </label>
                    <textarea
                      rows={2}
                      value={evidenceAgainst}
                      onChange={(e) => setEvidenceAgainst(e.target.value)}
                      placeholder="e.g., He could be working late or has load shedding and can't charge his battery."
                      className="w-full text-xs p-3 border border-moyo-border/60 rounded-xl text-moyo-primary bg-moyo-bg/10"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="text-xs text-moyo-muted underline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!evidenceFor.trim() || !evidenceAgainst.trim()}
                    onClick={() => setActiveStep(5)}
                    className="py-2.5 px-5 bg-moyo-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-50 hover:bg-moyo-primary-container cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {activeStep === 5 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step5")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step5Desc")}</p>
                <textarea
                  rows={3}
                  value={balancedThought}
                  onChange={(e) => setBalancedThought(e.target.value)}
                  placeholder="e.g., He is likely tired or busy with work or load shedding, and we normally communicate well. He will message when possible."
                  className="w-full text-sm p-4 border border-moyo-border/70 rounded-xl focus:border-moyo-primary focus:ring-1 focus:ring-moyo-primary text-moyo-primary bg-moyo-bg/20"
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="text-xs text-moyo-muted underline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!balancedThought.trim()}
                    onClick={() => setActiveStep(6)}
                    className="py-2.5 px-5 bg-moyo-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-50 hover:bg-moyo-primary-container cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 6 */}
            {activeStep === 6 && (
              <div>
                <h4 className="text-md font-display font-bold text-moyo-primary mb-1">
                  {getTranslated("step6")}
                </h4>
                <p className="text-xs text-moyo-muted mb-4">{getTranslated("step6Desc")}</p>

                <div className="bg-moyo-secondary-container/10 border border-moyo-secondary rounded-xl p-5 mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-moyo-primary">New Anxiety Level:</span>
                  <span className="text-2xl font-display font-black text-moyo-secondary">{postMoodRating}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={postMoodRating}
                  onChange={(e) => setPostMoodRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-moyo-bg rounded-lg appearance-none cursor-pointer accent-moyo-secondary"
                />

                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveStep(5)}
                    className="text-xs text-moyo-muted underline shrink-0 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRecord}
                    className="py-3 px-6 bg-moyo-secondary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-moyo-on-secondary-container transition duration-150 cursor-pointer shadow"
                  >
                    <BookCheck className="w-4 h-4" />
                    {getTranslated("save")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* CBT thought challeneger results listing */}
      <div className="bg-white rounded-2xl border border-moyo-border/50 shadow-sm p-6">
        <h3 className="text-lg font-display font-bold text-moyo-primary mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-moyo-secondary" />
          {getTranslated("historyTitle")}
          <span className="text-xs font-mono bg-moyo-bg text-moyo-primary px-2.5 py-0.5 rounded-full">
            {records.length}
          </span>
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-10 text-moyo-muted">
            <Info className="w-10 h-10 mx-auto text-moyo-border mb-3" />
            <p className="text-xs max-w-sm mx-auto">
              {getTranslated("noLogs")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-moyo-bg">
            {records.map((rec) => (
              <div key={rec.id} className="pt-4 first:pt-0">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-moyo-muted">{rec.date}</span>
                    <h4 className="text-sm font-display font-black text-moyo-primary leading-tight">
                      {rec.situation}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-2 border border-moyo-border/30 text-moyo-muted hover:text-moyo-error rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Cognitive reframing breakdown panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs leading-relaxed">
                  <div className="bg-red-500/5 p-3 rounded-xl border border-red-100">
                    <span className="text-[10px] uppercase font-bold text-red-700 block mb-1">Negative Thought Story</span>
                    <p className="italic text-moyo-muted">&ldquo;{rec.automaticThought}&rdquo;</p>
                  </div>
                  <div className="bg-green-500/5 p-3 rounded-xl border border-green-100">
                    <span className="text-[10px] uppercase font-bold text-green-700 block mb-1">Balanced Objective Reframe</span>
                    <p className="text-moyo-primary font-medium">&ldquo;{rec.balancedThought}&rdquo;</p>
                  </div>
                </div>

                {/* Distress progress reduction gauge */}
                <div className="bg-moyo-bg/60 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-moyo-primary">
                  <span>Anxiety Levels:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-600">{rec.preMoodRating}%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-moyo-muted" />
                    <span className="text-green-600">{rec.postMoodRating}%</span>
                    <span className="text-[10.5px] font-normal text-moyo-muted pl-1">
                      ({rec.preMoodRating - rec.postMoodRating}% reduction!)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
