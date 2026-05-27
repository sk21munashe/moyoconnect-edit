import React, { useState } from "react";
import { TrendingUp, Users, Clock, AlertTriangle, ShieldCheck, HelpCircle, Heart, Globe, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const REGIONAL_METRICS = [
  { city: "Harare Core", sessions: "18,420", benchCount: 42, responseTime: "12m" },
  { city: "Bulawayo Hub", sessions: "12,110", benchCount: 28, responseTime: "15m" },
  { city: "Manicaland Reach", sessions: "7,250", benchCount: 15, responseTime: "18m" },
  { city: "Midlands & West", sessions: "4,570", benchCount: 10, responseTime: "22m" }
];

const HISTORIAL_OUTREACH = [
  { month: "Jan", users: 15000 },
  { month: "Feb", users: 21000 },
  { month: "Mar", users: 28000 },
  { month: "Apr", users: 35000 },
  { month: "May", users: 42350 }
];

const TRIAGE_RESOLUTIONS = [
  { category: "Mild Distress", count: 24700, pct: 58, color: "bg-moyo-secondary" },
  { category: "Moderate Core", count: 14200, pct: 34, color: "bg-moyo-on-tertiary-container" },
  { category: "Severe High Risk", count: 3450, pct: 8, color: "bg-moyo-error" }
];

export default function Dashboard() {
  const [activeSegment, setActiveSegment] = useState<"outreach" | "regions">("outreach");

  return (
    <div className="max-w-2xl mx-auto py-4 px-1 space-y-6">
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2 text-moyo-secondary">
          <Globe className="w-5 h-5 animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider">National Live Insights</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-moyo-primary mb-1">
          Active Community Impact
        </h2>
        <p className="text-sm text-moyo-muted">
          Transparent clinical and operational statistics demonstrating real-time mental health triage across Zimbabwe.
        </p>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stat 1 */}
        <div className="bg-white rounded-2xl p-5 border border-moyo-border/40 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-extrabold text-moyo-muted uppercase tracking-widest text-[10.5px]">
              Active Community Impact
            </span>
            <span className="p-2 rounded-xl bg-moyo-secondary-container/20 text-moyo-secondary">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-2.5">
            <span className="text-3xl md:text-4xl font-display font-black text-moyo-primary">
              42,350
            </span>
            <span className="text-moyo-secondary font-bold text-xs mb-1.5 flex items-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +12%
            </span>
          </div>
          <p className="text-xs text-moyo-muted mt-2">
            Monthly active users seeking secure peer support and clinically backed screens.
          </p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-2xl p-5 border border-moyo-border/40 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-extrabold text-moyo-muted uppercase tracking-widest text-[10.5px]">
              Rapid Crisis Response
            </span>
            <span className="p-2 rounded-xl bg-moyo-error-container/10 text-moyo-error">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl md:text-4xl font-display font-black text-moyo-primary">
              92%
            </span>
            <span className="text-moyo-muted font-bold text-xs mb-1.5 shrink-0">
              Avg. Speed
            </span>
          </div>
          <p className="text-xs text-moyo-muted mt-2">
            High-risk cases responded to and triaged into professional hotlines within 60 minutes.
          </p>
        </div>
      </div>

      {/* SEGMENT TAB SELECTORS */}
      <div className="flex border border-moyo-border/40 rounded-xl p-1 bg-white shadow-sm">
        <button
          onClick={() => setActiveSegment("outreach")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSegment === "outreach" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
          }`}
        >
          Community Care Trends
        </button>
        <button
          onClick={() => setActiveSegment("regions")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSegment === "regions" ? "bg-moyo-primary text-white" : "text-moyo-muted hover:bg-moyo-bg"
          }`}
        >
          Regional Hub Activity
        </button>
      </div>

      {/* RENDER ACTIVE SEGMENT */}
      <AnimatePresence mode="wait">
        {activeSegment === "outreach" ? (
          <motion.div
            key="outreach-seg"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-moyo-border/40 p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-moyo-primary mb-4">
              Monthly Active Outreach (Zimbabwe Overall)
            </h3>

            {/* Custom SVG Bar/Area Chart representing Outreach Growth */}
            <div className="h-44 w-full bg-moyo-bg/50 border border-moyo-border/20 rounded-xl p-4 flex items-end justify-between gap-2.5 relative">
              {HISTORIAL_OUTREACH.map((item, idx) => {
                const maxVal = 45000;
                const pctHeight = (item.users / maxVal) * 100;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group cursor-help">
                    <span className="text-[10px] font-bold text-moyo-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      {item.users.toLocaleString()}
                    </span>
                    <div
                      style={{ height: `${pctHeight}%` }}
                      className="w-full bg-moyo-primary hover:bg-moyo-secondary transition-all rounded-t-lg shadow-sm"
                    ></div>
                    <span className="text-[10px] uppercase font-extrabold text-moyo-muted mt-2">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Symptom categories resolution slider */}
            <div className="mt-6 border-t border-moyo-bg pt-6 space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-moyo-muted mb-2">
                Triage Symptom Split (May 2026 data)
              </h4>

              {TRIAGE_RESOLUTIONS.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-extrabold text-moyo-primary">
                    <span>{item.category}</span>
                    <span className="font-mono">{item.count.toLocaleString()} cases ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-moyo-bg h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className={`${item.color} h-full rounded-full`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-moyo-muted bg-moyo-bg p-3.5 rounded-xl border border-moyo-border/30">
              <ShieldCheck className="w-4 h-4 text-moyo-secondary shrink-0" />
              <span>We audit triage classifications anonymously, referencing WHO guidelines for clinical care.</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="regions-seg"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-moyo-border/40 p-5 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-moyo-primary">
              Regional Active Counseling Hubs
            </h3>

            <div className="divide-y divide-moyo-bg">
              {REGIONAL_METRICS.map((reg) => (
                <div key={reg.city} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-moyo-secondary" />
                    <div>
                      <h4 className="text-sm font-bold text-moyo-primary leading-tight">{reg.city}</h4>
                      <span className="text-[10px] font-bold text-moyo-muted">{reg.benchCount} active clinical benches</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-moyo-primary block">{reg.sessions} sessions</span>
                    <span className="text-[10px] font-bold text-moyo-muted">Response: {reg.responseTime}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-moyo-bg/50 border border-moyo-border/30 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4.5 h-4.5 text-moyo-on-tertiary-container shrink-0 mt-0.5" />
              <p className="text-xs text-moyo-muted leading-relaxed">
                Response speed metrics track how rapidly deep distress or self-harm triggers are converted into safe, anonymous phone-routing sessions with Zimbabwean mental health responders.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
