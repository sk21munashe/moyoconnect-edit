import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Phone, 
  Shield, 
  Grid2X2, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  Home, 
  Heart, 
  Activity, 
  User, 
  AlertTriangle, 
  HelpCircle,
  FolderHeart,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Sub-component imports
import Screener from "./components/Screener";
import Journal from "./components/Journal";
import Chat from "./components/Chat";
import Psychoed from "./components/Psychoed";
import CBT from "./components/CBT";
import Dashboard from "./components/Dashboard";
import CrisisSupport from "./components/CrisisSupport";
import Login from "./components/Login";
import ChwDashboard from "./components/ChwDashboard";
import AdminPortal from "./components/AdminPortal";

import { Screen, ActiveModule } from "./types";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("moyo_authenticated") === "true";
  });
  const [loginRole, setLoginRole] = useState<"patient" | "chw" | "admin">(() => {
    return (localStorage.getItem("moyo_role") || "patient") as "patient" | "chw" | "admin";
  });
  const [loginUser, setLoginUser] = useState<string>(() => {
    return localStorage.getItem("moyo_identifier") || "";
  });
  const [appLang, setAppLang] = useState<"en" | "sn" | "nd">(() => {
    return (localStorage.getItem("moyo_lang") as "en" | "sn" | "nd") || "en";
  });

  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [activeModule, setActiveModule] = useState<ActiveModule>("none");
  const [greeting, setGreeting] = useState("Masikati, Moyo User");
  const [anonymousId] = useState("#8821");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [criticalOverlay, setCriticalOverlay] = useState(false);

  // Compute greetings dynamically based on hour of day and selected language
  useEffect(() => {
    const hour = new Date().getHours();
    const displayName = loginUser ? loginUser : "Moyo User";
    let baseGreet = "";

    if (appLang === "sn") {
      if (hour < 12) {
        baseGreet = "Mangwanani, ";
      } else if (hour < 18) {
        baseGreet = "Masikati, ";
      } else {
        baseGreet = "Manheru, ";
      }
    } else if (appLang === "nd") {
      if (hour < 12) {
        baseGreet = "Livuke njani, ";
      } else if (hour < 18) {
        baseGreet = "Abasulileyo, ";
      } else {
        baseGreet = "Litshonile njani, ";
      }
    } else {
      if (hour < 12) {
        baseGreet = "Good morning, ";
      } else if (hour < 18) {
        baseGreet = "Good afternoon, ";
      } else {
        baseGreet = "Good evening, ";
      }
    }

    setGreeting(`${baseGreet}${displayName}`);
  }, [loginUser, appLang]);

  const handleOpenModule = (modName: ActiveModule) => {
    setActiveModule(modName);
    setActiveScreen("modules");
  };

  const handleBackToHome = () => {
    setActiveModule("none");
    setActiveScreen("home");
  };

  // Mock Notification logs
  const NOTIFICATION_LIST = [
    { id: 1, title: "Anxiety Screen Recommended", desc: "Keep track of your wellbeing regularly. Try our anonymous weekly check.", time: "Just now" },
    { id: 2, title: "New CBT record added", desc: "You successfully reframed a negative belief anonymously.", time: "2 hrs ago" },
    { id: 3, title: "Support hotline is active", desc: "Response speeds are normal (within 60 mins). Help is available.", time: "Today" }
  ];

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(role, identifier) => {
          localStorage.setItem("moyo_authenticated", "true");
          localStorage.setItem("moyo_role", role);
          localStorage.setItem("moyo_identifier", identifier);
          setIsAuthenticated(true);
          setLoginRole(role);
          setLoginUser(identifier);
        }}
        initialLanguage={appLang}
        onLanguageChange={(lang) => {
          localStorage.setItem("moyo_lang", lang);
          setAppLang(lang);
        }}
      />
    );
  }

  if (loginRole === "chw") {
    return (
      <ChwDashboard
        chwId={loginUser}
        onLogout={() => {
          localStorage.removeItem("moyo_authenticated");
          localStorage.removeItem("moyo_role");
          localStorage.removeItem("moyo_identifier");
          setIsAuthenticated(false);
          setLoginRole("patient");
          setLoginUser("");
        }}
      />
    );
  }

  if (loginRole === "admin") {
    return (
      <AdminPortal
        onLogout={() => {
          localStorage.removeItem("moyo_authenticated");
          localStorage.removeItem("moyo_role");
          localStorage.removeItem("moyo_identifier");
          setIsAuthenticated(false);
          setLoginRole("patient");
          setLoginUser("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-moyo-bg text-moyo-dark pb-28 relative">
      
      {/* GLOBAL TOP HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-moyo-border/30 z-30 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <button 
            onClick={handleBackToHome}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
              src="/src/assets/images/moyoconnect_logo_1779856207318.png" 
              alt="MoyoConnect Logo" 
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-xl font-display font-extrabold text-moyo-primary tracking-tight transition-colors group-hover:text-moyo-secondary">
              MoyoConnect
            </h1>
          </button>

          <div className="flex items-center gap-3">
            {/* Quick Support Phone Trigger */}
            <a 
              href="tel:08081234567"
              className="hidden sm:flex items-center gap-2.5 bg-moyo-bg hover:bg-white border border-moyo-border/30 py-1.5 px-3.5 rounded-lg text-xs font-bold text-moyo-primary transition shadow-sm cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-moyo-secondary" />
              <span>0808 123 4567</span>
            </a>

            {/* Profile trigger */}
            <button
              onClick={() => {
                setShowProfile(true);
                setShowNotifications(false);
              }}
              className="w-8 h-8 rounded-xl bg-moyo-primary-container text-moyo-primary/80 hover:text-moyo-primary transition flex items-center justify-center border border-moyo-border/30 cursor-pointer shadow-sm"
              title="View secure profile data"
            >
              <User className="w-4.5 h-4.5" />
            </button>

            {/* Notification bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="w-8 h-8 rounded-xl bg-white border border-moyo-border/40 flex items-center justify-center text-moyo-muted hover:text-moyo-primary transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-moyo-secondary rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATION OVERLAY PANEL */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-4 sm:right-10 w-80 bg-white border border-moyo-border/50 rounded-2xl p-5 shadow-lg z-40 max-h-96 overflow-y-auto"
          >
            <div className="border-b border-moyo-bg pb-3 mb-3 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-moyo-primary">System Notification Alerts</span>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-xs font-bold text-moyo-muted hover:text-moyo-primary"
              >
                Close
              </button>
            </div>
            <div className="space-y-3.5 divide-y divide-moyo-bg">
              {NOTIFICATION_LIST.map((n, idx) => (
                <div key={n.id} className={`pt-3 first:pt-0 ${idx === 0 ? "border-0" : ""}`}>
                  <h4 className="text-xs font-bold text-moyo-primary leading-tight">{n.title}</h4>
                  <p className="text-[11px] text-moyo-muted mt-1 leading-snug">{n.desc}</p>
                  <span className="text-[9px] text-moyo-muted mt-2 block font-medium">{n.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE PROFILE PANEL */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-4 sm:right-10 w-80 bg-white border border-moyo-border/50 rounded-2xl p-6 shadow-lg z-40"
          >
            <div className="border-b border-moyo-bg pb-3 mb-4 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-moyo-primary">Your Secure Profile</span>
              <button 
                onClick={() => setShowProfile(false)}
                className="text-xs font-bold text-moyo-muted hover:text-moyo-primary cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2.5 bg-moyo-bg p-3.5 rounded-xl border border-moyo-border/30">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-moyo-secondary" />
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-moyo-muted block tracking-wider">State Session ID</span>
                    <span className="text-xs font-black text-[#002434]">{anonymousId}</span>
                  </div>
                </div>
                <div className="border-t border-[#c2c7cc]/40 pt-2 flex justify-between items-center text-xs">
                  <span className="text-[#72787c] font-semibold">User ID:</span>
                  <span className="font-extrabold text-[#002434] select-all">{loginUser}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#72787c] font-semibold">Role:</span>
                  <span className="bg-[#b6eeab] text-[#3c6e37] px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest leading-none">
                    {loginRole}
                  </span>
                </div>
              </div>

              <p className="text-xs text-moyo-muted leading-relaxed">
                MoyoConnect protects your privacy completely. We do not store email, phone, or name values. All evaluations and journaling reside strictly inside your local device storage.
              </p>

              <div className="flex flex-col gap-2 pt-1 border-t border-[#c2c7cc]/30">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clean all local journaling and CBT records anonymously?")) {
                      localStorage.clear();
                      alert("Cleared successfully. Logging out.");
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 border border-red-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 transition block text-center cursor-pointer"
                >
                  Clear all local files
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("moyo_authenticated");
                    localStorage.removeItem("moyo_role");
                    localStorage.removeItem("moyo_identifier");
                    window.location.reload();
                  }}
                  className="w-full py-2 bg-[#002434] text-white font-bold text-xs rounded-xl hover:bg-[#1a3a4a] transition block text-center cursor-pointer shadow-sm"
                >
                  Sign Out / Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER (SCREEN CONTROLLER) */}
      <main className="pt-24 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* SCREEN: HOME */}
          {activeScreen === "home" && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* Welcome Section */}
              <section className="bg-moyo-primary-container rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
                
                {/* Visual patterns behind */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute -right-10 -top-10 w-44 h-44 border-4 border-white rounded-full"></div>
                  <div className="absolute -left-5 bottom-0 w-28 h-28 bg-white rounded-full"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3.5xl font-display font-extrabold tracking-tight">
                      {greeting}
                    </h2>
                    <p className="text-sm md:text-md text-moyo-on-primary-container max-w-md leading-relaxed">
                      Your mental health journey is anonymous, accessible, and culturally relevant. How can we support you today?
                    </p>
                    <div className="flex gap-2.5 pt-1.5">
                      <span className="bg-moyo-secondary text-white px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-sm">
                        <FileCheck className="w-3.5 h-3.5" />
                        Anonymous ID: {anonymousId}
                      </span>
                    </div>
                  </div>

                  {/* Hotline widget */}
                  <div className="relative z-10 shrink-0 w-full md:w-auto">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/25 shadow-sm">
                      <p className="text-[11px] font-bold text-moyo-on-primary-container mb-2 uppercase tracking-widest">
                        Support Hotline
                      </p>
                      <div className="flex items-center gap-3">
                        <a 
                          href="tel:08081234567"
                          className="w-10 h-10 rounded-full bg-moyo-error hover:bg-red-700 flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Phone className="w-5 h-5 fill-white text-white" />
                        </a>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg leading-tight">0808 123 4567</span>
                          <span className="text-[10px] text-moyo-on-primary-container">Toll-free • Live 24/7 care</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CORE APP MODULES Bento-Style */}
              <section className="space-y-4">
                <h3 className="text-md font-bold uppercase tracking-widest text-moyo-primary flex items-center gap-2">
                  <Grid2X2 className="w-4.5 h-4.5 text-moyo-secondary" />
                  Core App Modules
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Recommended Screener card (Double width) */}
                  <div className="md:col-span-2 bg-white rounded-2xl border-t-8 border-moyo-secondary p-6 shadow-sm flex flex-col justify-between group h-80 relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    
                    {/* Background faint illustration map representation */}
                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <FolderHeart className="w-52 h-52 text-moyo-secondary" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-moyo-secondary-container/30 text-moyo-secondary rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6" />
                        </div>
                        <span className="bg-moyo-secondary-container text-moyo-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                          Recommended
                        </span>
                      </div>
                      <h4 className="text-xl font-display font-extrabold text-moyo-primary mb-2">
                        Anonymous Screening
                      </h4>
                      <p className="text-xs text-moyo-muted leading-relaxed max-w-md">
                        Take rapid, evidence-based triage tests translated in English, Shona, and Ndebele to check your anxiety and general wellbeing levels privately.
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-moyo-bg text-moyo-primary rounded-md">5-10 Minutes</span>
                      <span className="text-[10px] font-bold px-2 py-1 bg-moyo-bg text-moyo-primary rounded-md">Private Results</span>
                    </div>

                    <button
                      onClick={() => handleOpenModule("screening")}
                      className="w-full py-3 bg-moyo-primary hover:bg-moyo-primary-container text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer shadow relative z-10"
                    >
                      Start Screening 
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Guided Journaling */}
                  <div className="bg-white rounded-2xl border-t-4 border-moyo-primary p-6 shadow-sm flex flex-col justify-between h-80 transition-all duration-300 hover:-translate-y-1 group">
                    <div>
                      <div className="w-10 h-10 bg-moyo-bg text-moyo-primary rounded-xl flex items-center justify-center mb-4">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="text-md font-display font-bold text-moyo-primary mb-2">
                        Guided Journaling
                      </h4>
                      <p className="text-xs text-moyo-muted leading-relaxed">
                        Track your mood, write down your beliefs, and follow guided writing prompt therapy privately.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenModule("journaling")}
                      className="text-xs font-extrabold text-moyo-primary hover:text-moyo-secondary flex items-center gap-1 cursor-pointer"
                    >
                      Open Journal 
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chat Support (Express API peer bot) */}
                  <div className="bg-white rounded-2xl border-t-4 border-moyo-on-tertiary-container p-6 shadow-sm flex flex-col justify-between h-80 transition-all duration-300 hover:-translate-y-1 group">
                    <div>
                      <div className="w-10 h-10 bg-yellow-50 text-moyo-on-tertiary-container rounded-xl flex items-center justify-center mb-4 border border-yellow-100">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h4 className="text-md font-display font-bold text-moyo-primary mb-2">
                        Chat Support
                      </h4>
                      <p className="text-xs text-moyo-muted leading-relaxed">
                        Compassionate peer coaching with our automated, culturally aware support champion.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenModule("chat")}
                      className="text-xs font-extrabold text-moyo-primary hover:text-moyo-secondary flex items-center gap-1 cursor-pointer"
                    >
                      Start Chat 
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Multilingual Psychoeducation (English, Shona, Ndebele) */}
                  <div className="bg-white rounded-2xl border-t-4 border-moyo-secondary p-6 shadow-sm md:col-span-2 flex flex-col sm:flex-row justify-between h-auto sm:h-52 gap-6 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        <div className="w-10 h-10 bg-green-50 text-moyo-secondary rounded-xl flex items-center justify-center mb-4 border border-green-100">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h4 className="text-md font-display font-bold text-moyo-primary mb-2">
                          Psychoeducation
                        </h4>
                        <p className="text-xs text-moyo-muted leading-relaxed">
                          Culturally adapted wellbeing material written in English, Shona, and Ndebele detailing panic regulation strategies and Kufungisisa.
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenModule("psychoed")}
                        className="text-xs font-extrabold text-moyo-primary hover:text-moyo-secondary flex items-center gap-1 cursor-pointer mt-4 sm:mt-0"
                      >
                        Read Articles 
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Faint elegant visual representation */}
                    <div className="w-full sm:w-48 h-32 sm:h-full rounded-xl bg-moyo-bg border border-moyo-border/30 overflow-hidden flex flex-col justify-center items-center text-center p-3 text-moyo-muted">
                      <Shield className="w-6 h-6 text-moyo-secondary mb-1" />
                      <span className="text-[10px] font-bold text-moyo-primary mb-1">Zimbabwean Context</span>
                      <p className="text-[9px] leading-snug">Audited with regional clinical talk structures.</p>
                    </div>
                  </div>

                  {/* Cognitive Self Help CBT */}
                  <div className="bg-white rounded-2xl border-t-4 border-moyo-on-tertiary-container p-6 shadow-sm flex flex-col justify-between h-auto sm:h-52 transition-all duration-300 hover:-translate-y-1 group">
                    <div>
                      <div className="w-10 h-10 bg-yellow-50 text-moyo-on-tertiary-container rounded-xl flex items-center justify-center mb-4 border border-yellow-105">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <h4 className="text-md font-display font-bold text-moyo-primary mb-2">
                        Self-Help CBT
                      </h4>
                      <p className="text-xs text-moyo-muted leading-relaxed">
                        Step-by-step cognitive journals to challenge stressful thinking lines objectively.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenModule("cbt")}
                      className="text-xs font-extrabold text-moyo-primary hover:text-moyo-secondary flex items-center gap-1 cursor-pointer mt-4"
                    >
                      Explore Lessons 
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* OUTREACH IMPACT METRIC SNAPSHOT */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-moyo-border/30 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-moyo-muted tracking-widest block mb-1">
                    Active Community Impact
                  </span>
                  <div className="flex items-end gap-2 text-moyo-primary">
                    <span className="text-2xl font-display font-black leading-none">42,350+</span>
                    <span className="text-moyo-secondary text-xs font-bold flex items-center mb-0.5">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      12%
                    </span>
                  </div>
                  <p className="text-[10.5px] text-moyo-muted mt-2">
                    Monthly active users in Zimbabwe resolving mental wellness questions securely.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-moyo-border/30 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase text-moyo-muted tracking-widest block mb-1">
                    Rapid Crisis Response
                  </span>
                  <div className="flex items-end gap-1 text-moyo-primary">
                    <span className="text-2xl font-display font-black leading-none">92%</span>
                    <span className="text-[10.5px] font-bold text-moyo-muted mb-0.5">Average</span>
                  </div>
                  <p className="text-[10.5px] text-moyo-muted mt-2">
                    High-risk triggers safely transferred into medical hotlines within 60 minutes.
                  </p>
                </div>
              </section>

            </motion.div>
          )}

          {/* SCREEN: MODULES HUB LIST */}
          {activeScreen === "modules" && (
            <motion.div
              key="modules-screen"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeModule === "none" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-display font-bold text-moyo-primary">All App Modules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setActiveModule("screening")} className="w-full text-left bg-white rounded-xl p-5 border border-moyo-border/30 hover:border-moyo-secondary transition cursor-pointer">
                      <h4 className="font-bold text-moyo-primary text-sm mb-1">Anonymous Screening</h4>
                      <p className="text-xs text-moyo-muted">Take private symptoms checkups</p>
                    </button>
                    <button onClick={() => setActiveModule("journaling")} className="w-full text-left bg-white rounded-xl p-5 border border-moyo-border/30 hover:border-moyo-secondary transition cursor-pointer">
                      <h4 className="font-bold text-moyo-primary text-sm mb-1">Guided Journaling</h4>
                      <p className="text-xs text-moyo-muted">Mood logging diaries</p>
                    </button>
                    <button onClick={() => setActiveModule("chat")} className="w-full text-left bg-white rounded-xl p-5 border border-moyo-border/30 hover:border-moyo-secondary transition cursor-pointer">
                      <h4 className="font-bold text-moyo-primary text-sm mb-1">Chat Support</h4>
                      <p className="text-xs text-moyo-muted">Private helper text bot</p>
                    </button>
                    <button onClick={() => setActiveModule("psychoed")} className="w-full text-left bg-white rounded-xl p-5 border border-moyo-border/30 hover:border-moyo-secondary transition cursor-pointer">
                      <h4 className="font-bold text-moyo-primary text-sm mb-1">Psychoeducation</h4>
                      <p className="text-xs text-moyo-muted">Shona and Ndebele articles</p>
                    </button>
                    <button onClick={() => setActiveModule("cbt")} className="w-full text-left bg-white rounded-xl p-5 border border-moyo-border/30 hover:border-moyo-secondary transition cursor-pointer">
                      <h4 className="font-bold text-moyo-primary text-sm mb-1">Self-Help CBT</h4>
                      <p className="text-xs text-moyo-muted">Objective beliefs challengers</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Module Routers */}
              {activeModule === "screening" && (
                <Screener onBackToHome={handleBackToHome} onOpenChat={() => setActiveModule("chat")} />
              )}
              {activeModule === "journaling" && (
                <Journal onBackToHome={handleBackToHome} />
              )}
              {activeModule === "chat" && (
                <Chat onBackToHome={handleBackToHome} />
              )}
              {activeModule === "psychoed" && (
                <Psychoed onBackToHome={handleBackToHome} onOpenScreener={() => setActiveModule("screening")} />
              )}
              {activeModule === "cbt" && (
                <CBT onBackToHome={handleBackToHome} />
              )}
            </motion.div>
          )}

          {/* SCREEN: CRISIS & SUPPORT INFO DIRECTORY */}
          {activeScreen === "support" && (
            <motion.div
              key="support-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CrisisSupport />
            </motion.div>
          )}

          {/* SCREEN: COMMUNITY IMPACT DETAILS */}
          {activeScreen === "impact" && (
            <motion.div
              key="impact-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FLOATING ACTION BUTTON: CRISIS RED HIGHLIGHT asterisk */}
      <div className="fixed bottom-24 right-6 z-20">
        <button
          onClick={() => setCriticalOverlay(true)}
          className="w-14 h-14 bg-moyo-error text-white rounded-2xl shadow-lg hover:shadow-red-600/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group relative"
          title="Emergency Help / Breath Grounding"
        >
          {/* Asterisk / emergency symbol */}
          <span className="text-3xl font-black font-mono leading-none flex items-center justify-center select-none animate-pulse">
            ＊
          </span>
          <span className="absolute right-full mr-3 bg-moyo-dark text-white px-3 py-1.5 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all shadow duration-155 whitespace-nowrap tracking-wider">
            Crisis Breathing &amp; Help
          </span>
        </button>
      </div>

      {/* EMBEDDED REALTIME CRISIS OVERLAY MODAL */}
      <AnimatePresence>
        {criticalOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-moyo-dark/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-moyo-border/40 shadow-2xl relative"
            >
              {/* Escape close button */}
              <button
                onClick={() => setCriticalOverlay(false)}
                className="absolute top-4 right-4 text-xs font-bold text-moyo-muted hover:text-moyo-primary p-2 cursor-pointer bg-moyo-bg rounded-lg"
              >
                Close (Esc)
              </button>

              <div className="p-6">
                <CrisisSupport />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM TABBED NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-moyo-border/20 py-3 px-6 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] focus-within:ring-1 focus-within:ring-moyo-primary">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Tab: Home */}
          <button
            onClick={() => {
              setActiveScreen("home");
              setActiveModule("none");
            }}
            className={`flex flex-col items-center justify-center rounded-2xl py-1.5 px-4 transition-all cursor-pointer ${
              activeScreen === "home"
                ? "bg-moyo-secondary-container text-moyo-on-secondary-container scale-105 font-bold"
                : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10.5px] mt-1">Home</span>
          </button>

          {/* Tab: Modules */}
          <button
            onClick={() => {
              setActiveScreen("modules");
              if (activeModule === "chat" || activeModule === "none") {
                setActiveModule("none");
              }
            }}
            className={`flex flex-col items-center justify-center rounded-2xl py-1.5 px-4 transition-all cursor-pointer ${
              activeScreen === "modules" && activeModule !== "chat"
                ? "bg-moyo-secondary-container text-moyo-on-secondary-container scale-105 font-bold"
                : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            <Grid2X2 className="w-5 h-5" />
            <span className="text-[10.5px] mt-1">Modules</span>
          </button>

          {/* Standout Tab: Chat Support */}
          <div className="relative flex flex-col items-center justify-center px-2">
            <button
              onClick={() => {
                setActiveScreen("modules");
                setActiveModule("chat");
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-md active:scale-95 cursor-pointer z-40 -mt-5 ${
                activeScreen === "modules" && activeModule === "chat"
                  ? "bg-moyo-secondary text-white ring-4 ring-moyo-secondary-container scale-110 shadow-emerald-700/30 shadow-lg"
                  : "bg-moyo-primary text-[#b6eeab] hover:bg-moyo-primary-container ring-2 ring-[#b6eeab]/35 shadow-moyo-primary/20 shadow-lg hover:scale-105"
              }`}
              title="Chat with Moyo Care AI Helper"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className={`text-[9.5px] font-extrabold mt-1 uppercase tracking-wider ${
              activeScreen === "modules" && activeModule === "chat"
                ? "text-moyo-secondary font-black"
                : "text-moyo-muted"
            }`}>
              Chat
            </span>
          </div>

          {/* Tab: Support */}
          <button
            onClick={() => {
              setActiveScreen("support");
              setActiveModule("none");
            }}
            className={`flex flex-col items-center justify-center rounded-2xl py-1.5 px-4 transition-all cursor-pointer ${
              activeScreen === "support"
                ? "bg-moyo-secondary-container text-moyo-on-secondary-container scale-105 font-bold"
                : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10.5px] mt-1">Support</span>
          </button>

          {/* Tab: Impact stats */}
          <button
            onClick={() => {
              setActiveScreen("impact");
              setActiveModule("none");
            }}
            className={`flex flex-col items-center justify-center rounded-2xl py-1.5 px-4 transition-all cursor-pointer ${
              activeScreen === "impact"
                ? "bg-moyo-secondary-container text-moyo-on-secondary-container scale-105 font-bold"
                : "text-moyo-muted hover:bg-moyo-bg"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10.5px] mt-1">Impact</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
