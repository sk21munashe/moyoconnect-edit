import React, { useState } from "react";
import { ScreenerQuestion, ScreenerResult } from "../types";
import { Shield, ChevronRight, RefreshCw, AlertCircle, PhoneCall, CornerDownRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SCREENER_QUESTIONS: ScreenerQuestion[] = [
  {
    id: "q1",
    text: "Feeling nervous, anxious, or on edge?",
    shonaText: "Kunzwa kutya, kusagadzikana mupfungwa, kana kuzvidya mwoyo zvakanyanya?",
    ndebeleText: "Ukuzwa uvalo, ukungatshiseki emoyeni, loba ukuzihlupha ngemicabango kuphela?"
  },
  {
    id: "q2",
    text: "Not being able to stop or control worrying?",
    shonaText: "Kutadza kumisa kana kudzora mufungo wekuzvidya mwoyo?",
    ndebeleText: "Ukungameli loba ukungayekeli ukuzihlupha kakhulu ngengqondo?"
  },
  {
    id: "q3",
    text: "Little interest or pleasure in doing things?",
    shonaText: "Kurasikirwa nechido kana mufaro wekuita zvinhu zvawaisimbofarira?",
    ndebeleText: "Ukulahlekelwa ngumdlandla loba ukungathokozi ngalokho okwenza nsukuzonke?"
  },
  {
    id: "q4",
    text: "Feeling down, depressed, or hopeless?",
    shonaText: "Kunzwa wakasuruvara mwoyo, wakaora mwoyo, kana usina tariro yeupenyu?",
    ndebeleText: "Ukuzwa udanile, ungela themba loba ufelwe ngumoya?"
  },
  {
    id: "q5",
    text: "Trouble falling or staying asleep, or sleeping too much?",
    shonaText: "Kutadza kurara zvakanaka (ganyavu), kurova hope, kana kurarisa kudarika mwero?",
    ndebeleText: "Uhlupho lokulala, ukungabuthongo obuhle, loba ukulalisa ngokudlulisileyo?"
  },
  {
    id: "q6",
    text: "Feeling tired or having little energy?",
    shonaText: "Kunzwa waneta muviri nguva dzose kana kuve usina simba mupfungwa?",
    ndebeleText: "Ukuzizwa udiniwe kumbe ungela mandla emzimbeni kumbe engqondweni?"
  }
];

const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all", shonaLabel: "Kwete zvachose", ndebeleLabel: "Hatshi nakanye" },
  { value: 1, label: "Several days", shonaLabel: "Mazuva mashoma", ndebeleLabel: "Amalanga athile" },
  { value: 2, label: "More than half the days", shonaLabel: "Mazuva mazhinji", ndebeleLabel: "Amalanga amanengi" },
  { value: 3, label: "Nearly every day", shonaLabel: "Tisingarambidzi mazuva ose", ndebeleLabel: "Phose ngezinsuku zonke" }
];

interface ScreenerProps {
  onBackToHome: () => void;
  onOpenChat: () => void;
}

export default function Screener({ onBackToHome, onOpenChat }: ScreenerProps) {
  const [lang, setLang] = useState<"en" | "sn" | "nd">(() => {
    return (localStorage.getItem("moyo_lang") as "en" | "sn" | "nd") || "en";
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [id: string]: number }>({});
  const [result, setResult] = useState<ScreenerResult | null>(null);

  const handleSelectAnswer = (val: number) => {
    const qId = SCREENER_QUESTIONS[currentIdx].id;
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);

    if (currentIdx < SCREENER_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1);
      }, 200);
    } else {
      // Complete & analyze!
      calculateResult(updated);
    }
  };

  const calculateResult = (finalAnswers: { [id: string]: number }) => {
    let score = 0;
    SCREENER_QUESTIONS.forEach(q => {
      score += finalAnswers[q.id] || 0;
    });

    let level: "Mild" | "Moderate" | "Severe" = "Mild";
    let colorClass = "text-moyo-secondary";
    let bgClass = "bg-moyo-secondary-container/10";
    let borderClass = "border-moyo-secondary";
    let advice = "You are currently experiencing mild emotional distress. This is quite common. We suggest writing down your feelings in the Guided Journal, practicing breathing, and talking to our supportive peer chat.";
    let shonaAdvice = "Parizvino makachengeteka kuseri kwezvinoratidza kudzvinyiririka kuduku kwepfungwa. Izvi zvakajairika. Tinokukurudzirai kunyora zvinyorwa muGuided Journal, kuedza kufema zvakanaka, kana kutaura nesu pachiri chinyararire.";
    let ndebeleAdvice = "Okwamanje usela kuthinteka okuncane kokuphazamiseka emoyeni. Lokhu kujwayelekile. Sikukhuthaza ukuthi ubhale phansi indlela ozizwa ngayo kuGuided Journal yetu loba uxoxe lathi emoyeni.";

    if (score >= 7 && score <= 12) {
      level = "Moderate";
      colorClass = "text-moyo-on-tertiary-container";
      bgClass = "bg-amber-500/10";
      borderClass = "border-moyo-on-tertiary-container";
      advice = "You show signs of moderate emotional distress. It might feel like things are getting heavy. Participating in our CBT thought challenges and sharing your concerns in Peer Chat would be incredibly beneficial.";
      shonaAdvice = "Mune zviratidzo zvenguva ine kudzvinyiririka kuri pakati nepakati pfungwa dzenyu. Zvinoratidza zvave kuremerera. Tinokukurudzirai kuedza chishandiso chesu cheCBT mupfungwa uye kutaura nesu muchat dzedu.";
      ndebeleAdvice = "Ukhombisa izimpawu zokuphazamiseka okuphakathi emoyeni. Kungalufaneleyo ukuba uphendule kucingo lwethu lobuhle loba ulingise izifundo zeCBT Thought records.";
    } else if (score > 12) {
      level = "Severe";
      colorClass = "text-moyo-error";
      bgClass = "bg-moyo-error-container/10";
      borderClass = "border-moyo-error";
      advice = "Your assessment suggests severe symptoms of distress. Your well-being is exceptionally important. We recommend reaching out to a professional counselor rapidly. Call our free secure hotline at 0808 123 4567, or write in Peer Support.";
      shonaAdvice = "Ongororo yenyu inoratidza kudzvinyiririka kwakanyanya kukuru mupfungwa dzenyu. Upenyu hwenyu nekugwinya kwemoyo zvakakosha kwazvo kwatiri. Tinokukurudzirai kufonera Moyo Hotline panhamba dzedu dzinoti 0808 123 4567 izvozvi kuti mubatsirwe pasina muripo.";
      ndebeleAdvice = "Ukuhlaziya kwakho kukhombisa izimpawu ezinkulu kakhulu zokuphazamiseka emoyeni wako. Sikukhuthaza sibili ukuba ushayele ucingo lwethu mahhala ku-0808 123 4567 ukuze uthole usizo lwesisindo samanje.";
    }

    setResult({
      score,
      level,
      colorClass,
      bgClass,
      borderClass,
      advice,
      shonaAdvice,
      ndebeleAdvice
    });
  };

  const resetScreener = () => {
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
  };

  const getTranslated = (key: "title" | "subtitle" | "privacy" | "back" | "results" | "retake") => {
    const translations = {
      title: {
        en: "Anonymous Wellbeing Screener",
        sn: "Ongororo Yakavanzika yeMufaro",
        nd: "Ukuhlaziya Okuyimfihlo Kwempilo"
      },
      subtitle: {
        en: "Take a fast, private clinical-grade screening to understand your anxiety and wellness levels.",
        sn: "Tora ongororo inoita maminitsi mashoma yakachengeteka unzwisise huremu hwekuzvinetesa mupfungwa.",
        nd: "Thatha isikhathanzo esincane ukuhlola uvalo lwemizwa yakho ngendlela eyimfihlo."
      },
      privacy: {
        en: "Secure & Anonymous. No responses are stored with your identity.",
        sn: "Zvose zvakavandika zvachose. Hapana zita renyu rinonyorwa pane izvi.",
        nd: "Kuyimfihlo njalo kuvikelekile. Amabizo enu kawalotshwa loku."
      },
      back: {
        en: "Back to Home",
        sn: "Dzokera Kumusha",
        nd: "Buyela eKhaya"
      },
      results: {
        en: "Screening Summary",
        sn: "Huremu hweOngororo",
        nd: "Imiphumela YeScreener"
      },
      retake: {
        en: "Retake Screener",
        sn: "Dzokorora Ongororo",
        nd: "Phinda Uhlaziye"
      }
    };
    return translations[key][lang];
  };

  const progressPct = ((currentIdx) / SCREENER_QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-4 px-1">
      {/* Header Language Toggles */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="text-label-md text-moyo-muted flex items-center gap-1 hover:text-moyo-primary transition-colors cursor-pointer"
        >
          &larr; {getTranslated("back")}
        </button>

        <div className="flex border border-moyo-border/60 rounded-lg p-0.5 bg-white">
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
          <button
            onClick={() => setLang("nd")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "nd" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            Ndebele
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="screener-running"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl p-6 md:p-8 border border-moyo-border/50 shadow-sm"
          >
            {/* Introductory Info */}
            <div className="mb-6 pb-6 border-b border-moyo-bg">
              <div className="flex items-center gap-2 mb-2 text-moyo-secondary">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {lang === "en" ? "Private Care Triage" : lang === "sn" ? "Zvakavandika" : "Kuyimfihlo"}
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold text-moyo-primary mb-2">
                {getTranslated("title")}
              </h2>
              <p className="text-sm text-moyo-muted mb-4">
                {getTranslated("subtitle")}
              </p>
              <div className="flex items-center gap-2 text-xs bg-moyo-bg/70 p-3 rounded-xl border border-moyo-border/30 text-moyo-muted">
                <Shield className="w-4 h-4 text-moyo-secondary shrink-0" />
                <span>{getTranslated("privacy")}</span>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-moyo-muted font-bold mb-2">
                <span>
                  {lang === "en"
                    ? `Question ${currentIdx + 1} of ${SCREENER_QUESTIONS.length}`
                    : lang === "sn"
                    ? `Mubvunzo ${currentIdx + 1} pa ${SCREENER_QUESTIONS.length}`
                    : `Umbuzo ${currentIdx + 1} ku ${SCREENER_QUESTIONS.length}`}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="w-full bg-moyo-bg h-2 rounded-full overflow-hidden">
                <div
                  className="bg-moyo-secondary h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            <div className="mb-8">
              <span className="text-xs font-bold text-moyo-secondary uppercase tracking-widest block mb-2">
                {lang === "en" ? "Please answer honestly" : "Ndapota pindurai nemwoyo wose"}
              </span>
              <h3 className="text-lg md:text-xl font-display font-semibold text-moyo-primary leading-snug">
                {lang === "en"
                  ? SCREENER_QUESTIONS[currentIdx].text
                  : lang === "sn"
                  ? SCREENER_QUESTIONS[currentIdx].shonaText
                  : SCREENER_QUESTIONS[currentIdx].ndebeleText}
              </h3>
            </div>

            {/* Answers List */}
            <div className="space-y-3">
              {ANSWER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectAnswer(opt.value)}
                  className="w-full text-left p-4 rounded-xl border border-moyo-border/60 hover:border-moyo-secondary hover:bg-moyo-secondary-container/5 active:bg-moyo-secondary-container/10 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-moyo-border group-hover:border-moyo-secondary group-hover:bg-moyo-secondary flex items-center justify-center text-xs text-moyo-muted group-hover:text-white font-bold transition-all">
                      {opt.value}
                    </span>
                    <span className="text-sm font-semibold text-moyo-primary group-hover:text-moyo-primary transition-colors">
                      {lang === "en" ? opt.label : lang === "sn" ? opt.shonaLabel : opt.ndebeleLabel}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-moyo-border group-hover:text-moyo-secondary transform transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>

            {/* Footer Navigation Backtrack */}
            {currentIdx > 0 && (
              <button
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="mt-6 text-xs text-moyo-muted underline hover:text-moyo-primary cursor-pointer block"
              >
                {lang === "en" ? "Previous Question" : "Mubvunzo Wekutanga"}
              </button>
            )}
          </motion.div>
        ) : (
          /* RESULT CARD */
          <motion.div
            key="screener-results"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`bg-white rounded-2xl border-t-8 border ${result.borderClass} p-6 md:p-8 shadow-md`}
          >
            <div className="flex items-center gap-2 mb-4 text-moyo-secondary">
              <CheckCircle2 className="w-6 h-6 text-moyo-secondary" />
              <span className="text-sm font-bold uppercase tracking-wider">{getTranslated("results")}</span>
            </div>

            <h2 className="text-2xl font-display font-extrabold text-moyo-primary mb-6">
              {lang === "en"
                ? "Your Private Assessment Results"
                : lang === "sn"
                ? "Mhedzisiro yeOngororo Yenyu"
                : "Imiphumela Enguwo Elondoloziweyo"}
            </h2>

            {/* Category Gauge and Score */}
            <div className={`${result.bgClass} border ${result.borderClass} rounded-2xl p-6 mb-6 flex items-center gap-5 justify-between`}>
              <div>
                <span className="text-xs uppercase font-extrabold text-moyo-muted tracking-wider block mb-1">
                  {lang === "en" ? "Current Wellbeing Triage" : "Huremu hweKudzvinyiririka"}
                </span>
                <span className={`text-2xl md:text-3xl font-display font-black uppercase ${result.colorClass}`}>
                  {result.level} {lang === "en" ? "Distress" : lang === "sn" ? "Kudzvinyiririka" : "Ukuphazamiseka"}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-3xl md:text-4xl font-display font-black text-moyo-primary">{result.score}</span>
                <span className="text-xs text-moyo-muted block">/ 18 max</span>
              </div>
            </div>

            {/* Cultural Clinical Interpretation */}
            <div className="prose text-moyo-muted text-sm leading-relaxed mb-8">
              <div className="flex gap-2 items-start bg-moyo-bg p-4 rounded-xl mb-4 border border-moyo-border/30">
                <AlertCircle className="w-5 h-5 text-moyo-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-moyo-primary mb-1">
                    {lang === "en" ? "Empathetic Guidance" : lang === "sn" ? "Mazano Anovaka" : "Icebiso Elilethembayo"}
                  </h4>
                  <p className="text-xs">
                    {lang === "en" ? result.advice : lang === "sn" ? result.shonaAdvice : result.ndebeleAdvice}
                  </p>
                </div>
              </div>

              {/* Secure Hotline Trigger if severe */}
              {result.score >= 7 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start gap-2.5">
                    <PhoneCall className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-moyo-primary text-xs">
                        {lang === "en" ? "Immediate Supportive Support Line" : "Moyo Hotline Yemahara"}
                      </h4>
                      <p className="text-[11px] text-moyo-muted">
                        {lang === "en"
                          ? "Call 0808 123 4567, completely free and safe. Speak with real support champions securely."
                          : "Fonerai mahara uye kusingadhure nhasi panhamba idzi: 0808 123 4567 kuitira mhinduro iri kukurumidza."}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:08081234567"
                    className="py-2 px-4 bg-red-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    0808 123 4567
                  </a>
                </div>
              )}

              {/* General recommendations */}
              <div>
                <h4 className="font-bold text-moyo-primary mb-2 text-xs uppercase tracking-widest">
                  {lang === "en" ? "Recommended Care Actions" : "Zvakarairwa Kuti Muite"}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-moyo-primary font-semibold">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Engage with Guided Journaling to release stress." : "Vhura Guided Journal unyore zviri kukushungurudza."}</span>
                  </div>
                  <div className="flex items-center gap-2 text-moyo-primary font-semibold">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Speak to our AI peer champion anonymously." : "Tanga hurukuro muPeer Chat neMoyo Peer Bot."}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenChat}
                className="flex-1 py-3 bg-moyo-primary text-white font-bold text-sm rounded-xl hover:bg-moyo-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {lang === "en" ? "Start Chat Support" : lang === "sn" ? "Tanga Harukuro" : "Qala ingxoxo"} &rarr;
              </button>
              <button
                onClick={resetScreener}
                className="py-3 px-6 border border-moyo-border text-moyo-primary font-bold text-sm rounded-xl hover:bg-moyo-bg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                {getTranslated("retake")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
