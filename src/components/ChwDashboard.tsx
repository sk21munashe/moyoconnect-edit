import React, { useState } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  ClipboardCopy, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  TrendingUp, 
  Plus, 
  ArrowLeft, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  Compass, 
  Activity, 
  Settings, 
  Shield, 
  Calendar, 
  FileText, 
  Play, 
  Check, 
  HelpCircle,
  AlertCircle,
  BookOpen,
  Map,
  Sparkles,
  UserCheck,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ZimbabweMap from "./ZimbabweMap";

interface ChwDashboardProps {
  chwId: string;
  onLogout: () => void;
}

interface CareHistoryItem {
  id: string;
  type: "visit" | "screening" | "log" | "note" | "escalation";
  title: string;
  date: string;
  description: string;
  tags?: string[];
  statusColor?: string;
}

interface ClientProfile {
  id: string;
  name: string;
  code: string;
  riskLevel: "Mild" | "Moderate" | "Severe";
  lastVisit: string;
  nextStep: string;
  preferredLanguage: string;
  district: string;
  emotionalDistress: number;
  activeModules: { name: string; progress: number; icon: string; color: string }[];
  referralStatus: { title: string; subtitle: string; status: "Approved" | "Pending" | "None" };
  history: CareHistoryItem[];
  medications?: string[];
}

const INITIAL_CLIENTS: ClientProfile[] = [];

export default function ChwDashboard({ chwId, onLogout }: ChwDashboardProps) {
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem("moyo_chw_clients");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((item: any) => !["1", "2", "3", "4"].includes(item.id));
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Real-time synchronization with Firestore and Local Registered Users
  React.useEffect(() => {
    const path = "moyo_clients";
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const dbItems: ClientProfile[] = [];
      snapshot.forEach((docRef) => {
        dbItems.push(docRef.data() as ClientProfile);
      });

      const cleanedDbItems = dbItems.filter(item => !["1", "2", "3", "4"].includes(item.id));

      setClients((prevClients) => {
        const mergedList = [...prevClients].filter(c => !["1", "2", "3", "4"].includes(c.id));

        // 1. Sync items from Firestore DB
        cleanedDbItems.forEach((dbItem) => {
          const idx = mergedList.findIndex((item) => item.id === dbItem.id);
          if (idx > -1) {
            mergedList[idx] = dbItem;
          } else {
            mergedList.push(dbItem);
          }
        });

        // 2. Scan locally registered users from patient logins
        const savedUsersJSON = localStorage.getItem("registered_moyo_users");
        if (savedUsersJSON) {
          try {
            const localUsers = JSON.parse(savedUsersJSON) as any[];
            localUsers.forEach((u) => {
              const userId = `u-${u.name.toLowerCase().replace(/\s+/g, "-") || Date.now()}`;
              const existsInMerged = mergedList.some((c) => c.name.toLowerCase() === u.name.toLowerCase());
              if (!existsInMerged) {
                let score = 0;
                if (u.assessmentAnswers) {
                  score = (u.assessmentAnswers.mood || 0) + (u.assessmentAnswers.anxiety || 0);
                }
                const riskLevel: "Mild" | "Moderate" | "Severe" = score >= 5 ? "Severe" : score >= 3 ? "Moderate" : "Mild";
                const langMap: Record<string, string> = { en: "English", sn: "Shona", nd: "Ndebele" };
                const newClient: ClientProfile = {
                  id: userId,
                  name: u.name,
                  code: `#MZ-${Math.floor(1000 + Math.random() * 9000)}`,
                  riskLevel,
                  lastVisit: "Registered",
                  nextStep: "Initial Support Contact",
                  preferredLanguage: langMap[u.language] || "English",
                  district: "Seke District, Chitungwiza",
                  emotionalDistress: riskLevel === "Severe" ? 85 : riskLevel === "Moderate" ? 50 : 15,
                  activeModules: [
                    { name: "CBT Fundamentals", progress: 0, icon: "psychology", color: "bg-secondary text-on-secondary" }
                  ],
                  referralStatus: {
                    title: "Registered on patient login portal.",
                    subtitle: "Intake complete",
                    status: "None"
                  },
                  history: [
                    {
                      id: `h-user-${Date.now()}-${userId}`,
                      type: "screening",
                      title: "Digital Intake Completed",
                      date: u.timestamp ? new Date(u.timestamp).toLocaleDateString() : "Today",
                      description: `Form submitted with rating assessment. Mood/Anxiety stress score of ${score}/6.`,
                      tags: ["INTAKE", "NEW"]
                    }
                  ],
                  medications: []
                };

                // Auto write to firebase
                setDoc(doc(db, path, newClient.id), newClient)
                  .catch(err => console.error(err));

                mergedList.push(newClient);
              }
            });
          } catch (e) {
            console.error(e);
          }
        }

        return mergedList;
      });
    }, (error) => {
      console.error(error);
    });

    return () => unsubscribe();
  }, []);

  // Save clients locally to maintain persistent offline fallback
  React.useEffect(() => {
    localStorage.setItem("moyo_chw_clients", JSON.stringify(clients));
  }, [clients]);

  // Searching & Filtering Directory
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "Mild" | "Moderate" | "Severe">("All");

  // Notification Banner
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Controllers
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showRecordVisitModal, setShowRecordVisitModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  // Form Inputs - Add New Client
  const [newClientName, setNewClientName] = useState("");
  const [newClientLang, setNewClientLang] = useState("Shona");
  const [newClientDistrict, setNewClientDistrict] = useState("Seke District, Chitungwiza");
  const [newClientRisk, setNewClientRisk] = useState<"Mild" | "Moderate" | "Severe">("Mild");

  // Form Inputs - Record Home Visit
  const [visitType, setVisitType] = useState("Home Visit");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitStatusTag, setVisitStatusTag] = useState("STABLE");

  // Form Inputs - Escalate Case
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationFacility, setEscalationFacility] = useState("Seke Central Clinic");

  // Form Inputs - Schedule
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // Form Inputs - Medication Log
  const [newMedName, setNewMedName] = useState("");

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 1500);
  };

  // Directory derived computations
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "All" ? true : c.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Perform: Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `c-${Date.now()}`;
    const newClient: ClientProfile = {
      id: newId,
      name: newClientName,
      code: `#MZ-${randomIdNum}`,
      riskLevel: newClientRisk,
      lastVisit: "Just added",
      nextStep: "Initial Assessment",
      preferredLanguage: newClientLang,
      district: newClientDistrict,
      emotionalDistress: newClientRisk === "Severe" ? 85 : newClientRisk === "Moderate" ? 50 : 15,
      activeModules: [
        { name: "CBT Fundamentals", progress: 0, icon: "psychology", color: "bg-secondary text-on-secondary" }
      ],
      referralStatus: {
        title: "Initial setup registered offline.",
        subtitle: "Pending contact",
        status: "None"
      },
      history: [
        {
          id: `h-added-${Date.now()}`,
          type: "note",
          title: "Client Added to Directory",
          date: "Today",
          description: `Registered as peer patient. Preferred language: ${newClientLang}.`,
          tags: ["NEW"]
        }
      ],
      medications: []
    };

    setDoc(doc(db, "moyo_clients", newClient.id), newClient)
      .then(() => {
        setClients([newClient, ...clients.filter(c => c.id !== newClient.id)]);
        triggerManualSync();
      })
      .catch((err) => {
        console.error(err);
        setClients([newClient, ...clients]);
      });

    setNewClientName("");
    setShowAddClientModal(false);
  };

  // Perform: Record Visit
  const handleRecordVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !visitNotes.trim()) return;

    const clientToUpdate = clients.find(c => c.id === selectedClientId);
    if (!clientToUpdate) return;

    const newHistoryItem: CareHistoryItem = {
      id: `h-visit-${Date.now()}`,
      type: "visit",
      title: visitType + " Completed",
      date: "Today",
      description: visitNotes,
      tags: [visitStatusTag, "VISIT"]
    };

    const updatedClient: ClientProfile = {
      ...clientToUpdate,
      lastVisit: "Just now",
      nextStep: "Assess ongoing modules",
      history: [newHistoryItem, ...clientToUpdate.history]
    };

    setDoc(doc(db, "moyo_clients", selectedClientId), updatedClient)
      .then(() => {
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      })
      .catch((err) => {
        console.error(err);
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      });

    setVisitNotes("");
    setShowRecordVisitModal(false);
  };

  // Perform: Escalate Case
  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const clientToUpdate = clients.find(c => c.id === selectedClientId);
    if (!clientToUpdate) return;

    const newHistoryItem: CareHistoryItem = {
      id: `h-esc-${Date.now()}`,
      type: "escalation",
      title: "Urgent Case Escalation Requested",
      date: "Today",
      description: `CHW initiated escalation to ${escalationFacility}. Reason: ${escalationReason || "High risk concerns."}`,
      tags: ["ESCALATED", "CRITICAL"]
    };

    const updatedClient: ClientProfile = {
      ...clientToUpdate,
      riskLevel: "Severe",
      emotionalDistress: Math.max(clientToUpdate.emotionalDistress, 90),
      referralStatus: {
        title: `Referral to ${escalationFacility} has been elevated with medical dispatch.`,
        subtitle: "Urgent Action Required",
        status: "Approved"
      },
      history: [newHistoryItem, ...clientToUpdate.history]
    };

    setDoc(doc(db, "moyo_clients", selectedClientId), updatedClient)
      .then(() => {
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      })
      .catch((err) => {
        console.error(err);
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      });

    setEscalationReason("");
    setShowEscalateModal(false);
  };

  // Perform: Schedule
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !followUpDate) return;

    const clientToUpdate = clients.find(c => c.id === selectedClientId);
    if (!clientToUpdate) return;

    const newHistoryItem: CareHistoryItem = {
      id: `h-schedule-${Date.now()}`,
      type: "note",
      title: "Follow-up Scheduled",
      date: "Scheduled on " + followUpDate,
      description: `Future appointment booked. Agenda notes: ${followUpNotes || "General wellbeing check-in."}`,
      tags: ["BOOKED"]
    };

    const updatedClient: ClientProfile = {
      ...clientToUpdate,
      nextStep: "Home Visit (" + followUpDate + ")",
      history: [newHistoryItem, ...clientToUpdate.history]
    };

    setDoc(doc(db, "moyo_clients", selectedClientId), updatedClient)
      .then(() => {
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      })
      .catch((err) => {
        console.error(err);
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      });

    setFollowUpDate("");
    setFollowUpNotes("");
    setShowScheduleModal(false);
  };

  // Perform: Log Medication
  const handleMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newMedName.trim()) return;

    const clientToUpdate = clients.find(c => c.id === selectedClientId);
    if (!clientToUpdate) return;

    const updatedMeds = clientToUpdate.medications ? [...clientToUpdate.medications, newMedName] : [newMedName];
    const newHistoryItem: CareHistoryItem = {
      id: `h-med-${Date.now()}`,
      type: "log",
      title: "Medication Update Logged",
      date: "Today",
      description: `Added "${newMedName}" to current active medical chart. Tested compliance checks.`,
      tags: ["MED"]
    };

    const updatedClient: ClientProfile = {
      ...clientToUpdate,
      medications: updatedMeds,
      history: [newHistoryItem, ...clientToUpdate.history]
    };

    setDoc(doc(db, "moyo_clients", selectedClientId), updatedClient)
      .then(() => {
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      })
      .catch((err) => {
        console.error(err);
        setClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
      });

    setNewMedName("");
    setShowMedicationModal(false);
  };

  // General counts for dashboard summary stats
  const pendingVisitsCount = clients.filter(c => c.riskLevel !== "Mild").length;
  const highRiskCount = clients.filter(c => c.riskLevel === "Severe").length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] pb-24 font-sans select-none relative">
      
      {/* Dynamic Sync Floating Banner */}
      <AnimatePresence>
        {showSyncSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#3c6e37] text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-xl z-50 text-xs font-bold"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>MoyoConnect synced successfully with central clinic node</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#c2c7cc] sticky top-0 z-40 w-full px-4 md:px-10 h-16 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          {selectedClientId && (
            <button 
              onClick={() => setSelectedClientId(null)}
              aria-label="Go back" 
              className="hover:bg-[#f3f4f5] p-2 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#002434]" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/images/moyoconnect_logo_1779856207318.png" 
              alt="MoyoConnect Logo" 
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-md md:text-lg font-extrabold text-[#002434] tracking-tight leading-none">MoyoConnect</span>
              <span className="text-[10px] text-[#42474b] font-semibold mt-0.5">CHW Operator: {chwId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-[#386934] flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full bg-[#386934] ${isSyncing ? "animate-ping" : ""}`} />
              Synced Offline Node
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#42474b]">Last refresh: Just now</span>
          </div>

          <button 
            onClick={triggerManualSync}
            disabled={isSyncing}
            className={`p-2 rounded-full hover:bg-[#f3f4f5] active:scale-95 transition-all text-[#002434] cursor-pointer ${isSyncing ? "animate-spin" : ""}`}
            title="Force push offline synchronizers"
          >
            <Activity className="w-4.5 h-4.5 text-[#386934]" />
          </button>

          <button 
            type="button" 
            onClick={onLogout}
            className="text-xs bg-[#002434] hover:bg-[#1a3a4a] text-white px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all"
          >
            Exit Portal
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      {!selectedClientId ? (
        /* ==================== VIEW 1: MAIN CLIENT DIRECTORY LIST ==================== */
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-extrabold text-[#002434]">Good Morning, Moyo Health Worker</h1>
              <p className="text-xs md:text-sm text-[#42474b]">Here is an overview of active community health files and safety status inside Seke.</p>
            </div>

            {/* Circular Success Badge Metric */}
            <div className="bg-[#b6eeab] shadow-sm text-[#20511e] p-4 rounded-xl flex items-center gap-3 border border-[#b6eeab]">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="opacity-20 text-[#386934]" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                  <circle cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="15" strokeWidth="4" className="text-[#386934]"></circle>
                </svg>
                <span className="absolute text-xs font-black">88%</span>
              </div>
              <div>
                <span className="text-[10px] block font-extrabold uppercase tracking-wider text-[#3c6e37]">Referral Success Rate</span>
                <span className="text-sm font-black leading-none text-[#20511e]">88% Clinic Linkages Complete</span>
              </div>
            </div>
          </section>

          {/* Bento Grid summary metrics cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cards 1: Pending Visits */}
            <div 
              onClick={() => {
                setRiskFilter("Moderate");
                triggerManualSync();
              }}
              className="bg-white border border-[#c2c7cc] p-5 rounded-2xl flex flex-col justify-between hover:shadow transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1.5 bg-[#1a3a4a] w-full" />
              <div>
                <span className="material-symbols-outlined text-[#002434] text-xl block mb-1">home_health</span>
                <h3 className="text-xs font-extrabold text-[#42474b] uppercase tracking-wider">Pending Home Visits</h3>
                <p className="text-3xl font-display font-black text-[#002434] mt-2">{pendingVisitsCount}</p>
              </div>
              <div className="text-xs text-[#002434] font-bold group-hover:underline mt-4 flex items-center gap-1 select-none">
                View Today's Priority checkups <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Cards 2: High Risk Alert */}
            <div 
              onClick={() => {
                setRiskFilter("Severe");
              }}
              className="bg-[#ffdad6] text-[#93000a] p-5 rounded-2xl flex flex-col justify-between hover:shadow transition-all cursor-pointer group border border-[#ffdad6] relative"
            >
              <div className="absolute top-0 left-0 h-1.5 bg-[#ba1a1a] w-full" />
              <div>
                <span className="material-symbols-outlined text-[#ba1a1a] text-xl block mb-1">emergency_home</span>
                <h3 className="text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider">Severe High-Risk Trigger</h3>
                <p className="text-3xl font-display font-black mt-2">{highRiskCount}</p>
              </div>
              <div className="text-xs font-black group-hover:underline mt-4 flex items-center gap-1 select-none">
                Urgent Action Required <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Action Panel */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowAddClientModal(true)}
                className="flex-1 bg-[#002434] hover:bg-[#1a3a4a] text-white p-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Add New Client Case
              </button>
              <button 
                onClick={() => {
                  if (clients.length > 0) {
                    setSelectedClientId(clients[0].id);
                    setShowRecordVisitModal(true);
                  } else {
                    alert("Please register a patient first.");
                  }
                }}
                className="flex-1 bg-[#386934] hover:bg-[#20511e] text-white p-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <FileText className="w-4 h-4" />
                Record Home Visit Notes
              </button>
            </div>
          </section>

          {/* Searchable Client Directory table card */}
          <section className="bg-white border border-[#c2c7cc] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 md:p-6 border-b border-[#c2c7cc] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#002434]">Client Health Roster</h2>
                <p className="text-xs text-[#42474b]">Choose any record row to drill down into historical care timelines.</p>
              </div>

              {/* Toggles and query inputs */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#72787c] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-[#002434] border border-[#c2c7cc] rounded-lg text-xs outline-none bg-[#f8f9fa] w-full sm:w-48 text-[#191c1d]"
                  />
                </div>

                {/* Risk Segmented Buttons */}
                <div className="flex rounded-lg overflow-hidden border border-[#c2c7cc] bg-white text-xs">
                  {["All", "Mild", "Moderate", "Severe"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r as any)}
                      className={`px-3 py-1.5 font-bold cursor-pointer transition-colors ${
                        riskFilter === r 
                          ? "bg-[#002434] text-white" 
                          : "bg-white text-[#42474b] hover:bg-[#f3f4f5]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#f3f4f5]">
                  <tr className="border-b border-[#c2c7cc]">
                    <th className="text-left p-4 text-[11px] font-black uppercase text-[#42474b]">Client / Code ID</th>
                    <th className="text-left p-4 text-[11px] font-black uppercase text-[#42474b]">Risk Classification</th>
                    <th className="text-left p-4 text-[11px] font-black uppercase text-[#42474b]">Last Home Visit</th>
                    <th className="text-left p-4 text-[11px] font-black uppercase text-[#42474b]">Next Care Instruction</th>
                    <th className="p-4 text-[11px] font-black uppercase text-[#42474b] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c2c7cc]/50">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[#72787c]">
                        No active clients found in index matching these metrics.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((c) => {
                      const isSevere = c.riskLevel === "Severe";
                      const isModerate = c.riskLevel === "Moderate";

                      return (
                        <tr 
                          key={c.id} 
                          onClick={() => setSelectedClientId(c.id)}
                          className={`hover:bg-[#f3f4f5]/60 transition-colors cursor-pointer border-l-4 ${
                            isSevere 
                              ? "border-l-[#ba1a1a]" 
                              : isModerate 
                                ? "border-l-[#dd8d36]" 
                                : "border-l-[#386934]"
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-bold text-sm text-[#002434]">{c.name}</div>
                            <div className="text-xs text-[#72787c] font-semibold">{c.code} • Preferred: {c.preferredLanguage}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isSevere 
                                ? "bg-[#ffdad6] text-[#93000a]" 
                                : isModerate 
                                  ? "bg-[#ffdcbf] text-[#2d1600]" 
                                  : "bg-[#b9f1ad] text-[#002202]"
                            }`}>
                              {c.riskLevel}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-[#42474b] font-medium">{c.lastVisit}</td>
                          <td className="p-4">
                            <div className="text-xs text-[#002434] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#386934] shrink-0" />
                              {c.nextStep}
                            </div>
                            <div className="text-[10px] text-[#72787c]">{c.district}</div>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClientId(c.id);
                              }}
                              className="text-xs font-bold text-[#386934] hover:underline cursor-pointer flex items-center gap-0.5 ml-auto"
                            >
                              Manage <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 text-center border-t border-[#c2c7cc] bg-[#f8f9fa] text-xs font-bold text-[#002434]">
              Showing {filteredClients.length} of {clients.length} peer profiles in current micro-cell directory.
            </div>
          </section>          {/* Live Interactive GIS Map of Zimbabwe Health Centers */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-[#386934]" />
              <h3 className="text-[#002434] text-sm font-black uppercase tracking-wider">
                Zimbabwe Healthcare Clinics & Referral Centers Live GIS Portal
              </h3>
            </div>
            <ZimbabweMap heightClass="h-[420px]" />
          </section>

          {/* Recent Operations log and activity cards section */}
          <section className="grid grid-cols-1 gap-4">
            {/* Recent raw activities feed */}
            <div className="bg-white border border-[#c2c7cc] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-[#002434] text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#386934]" />
                  Cell Work Operations Log
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start text-xs text-[#42474b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#386934] mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-[#191c1d]">Home visit logged successfully</span> for Kudakwashe Moyo. Adherence checks updated.
                      <span className="block text-[10px] text-[#72787c] mt-0.5">30 mins ago</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start text-xs text-[#42474b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dd8d36] mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-[#191c1d]">Severe Risk escalation check</span> requested automatically by machine system rules.
                      <span className="block text-[10px] text-[#72787c] mt-0.5">2 hours ago</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start text-xs text-[#42474b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#002434] mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-[#191c1d]">Offline database dump created</span>. Encrypted state cached locally for fast retrieval.
                      <span className="block text-[10px] text-[#72787c] mt-0.5">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#c2c7cc]/50 mt-4 text-[11px] leading-relaxed text-[#72787c] italic">
                Logs represent real-time changes saved into the browser's persistent state container.
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ==================== VIEW 2: DETAILED CLIENT MANAGEMENT VIEW ==================== */
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {/* Client Identity Brief Widget */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Major Info Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#c2c7cc] flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden shadow-xs">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#326934]" />
              <div className="w-20 h-20 rounded-full bg-[#c7e7fc] flex items-center justify-center text-[#1a3a4a] shrink-0 font-extrabold text-2xl border border-[#abcbdf]">
                {selectedClient?.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-display font-black text-[#002434] tracking-tight">
                    {selectedClient?.name}
                  </h1>
                  <span className="bg-[#1a3a4a] text-[#85a4b7] rounded-md px-2.5 py-0.5 text-[10px] font-extrabold select-all">
                    {selectedClient?.code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1.5 ${
                    selectedClient?.riskLevel === "Severe" 
                      ? "bg-[#ffdad6] text-[#93000a]" 
                      : selectedClient?.riskLevel === "Moderate"
                        ? "bg-[#ffdcbf] text-[#2d1600]"
                        : "bg-[#b9f1ad] text-[#002202]"
                  }`}>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {selectedClient?.riskLevel} Risk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pt-2 text-xs text-[#42474b]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#72787c]" />
                    <span className="font-semibold">{selectedClient?.district}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#72787c]" />
                    <span className="font-semibold">Preferred Interface: {selectedClient?.preferredLanguage}</span>
                  </div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <UserCheck className="w-3.5 h-3.5 text-[#72787c]" />
                    <span className="font-semibold text-[#386934]">Last home contact: {selectedClient?.lastVisit}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#72787c]" />
                    <span className="font-semibold text-[#002434] underline">Next Step: {selectedClient?.nextStep}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Index Gauge Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#c2c7cc] flex flex-col justify-between shadow-xs relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#dd8d36]" />
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-[#42474b] tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#ba1a1a]" />
                  Emotional Distress Level
                </h3>
                <span className="text-lg font-black text-[#002434]">{selectedClient?.emotionalDistress}%</span>
              </div>

              <div className="my-4">
                <div className="w-full bg-[#f3f4f5] h-3 rounded-full overflow-hidden border border-[#c2c7cc]/50">
                  <div 
                    style={{ width: `${selectedClient?.emotionalDistress}%` }}
                    className={`h-full transition-all duration-500 ${
                      (selectedClient?.emotionalDistress || 0) >= 80 
                        ? "bg-[#ba1a1a]" 
                        : (selectedClient?.emotionalDistress || 0) >= 40
                          ? "bg-[#dd8d36]"
                          : "bg-[#386934]"
                    }`}
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#72787c] leading-snug">
                Derived dynamically from private diagnostic survey modules and sleep disturbances flags.
              </p>
            </div>
          </section>

          {/* Quick clinical action triggers */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={() => setShowEscalateModal(true)}
              className="px-4 py-3.5 bg-[#002434] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#1a3a4a] transition-all"
            >
              <AlertCircle className="w-4 h-4 text-[#ffdad6]" />
              Escalate Case Referral
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-3.5 bg-[#386934] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#20511e] transition-all"
            >
              <Calendar className="w-4 h-4" />
              Schedule Follow-up
            </button>
            <button 
              onClick={() => setShowMedicationModal(true)}
              className="px-4 py-3.5 bg-white border border-[#002434] text-[#002434] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#f3f4f5] transition-all"
            >
              <Activity className="w-4 h-4" />
              Update Medication Chart
            </button>
          </section>

          {/* Timeline and Sidebar Details */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Timeline: Care History (Oct 24, Oct 18, Oct 12 represent exact matching designs) */}
            <div className="lg:col-span-8 bg-white border border-[#c2c7cc] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-md font-extrabold uppercase tracking-wide text-[#002434]">
                    Interactive Care Timeline history
                  </h2>
                  <button 
                    onClick={() => setShowRecordVisitModal(true)}
                    className="text-xs bg-[#b6eeab] hover:bg-[#9ed493] text-[#20511e] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add visit notes
                  </button>
                </div>

                <div className="space-y-6 relative border-l-2 border-[#c2c7cc]/50 pl-6 ml-3">
                  {selectedClient?.history.map((h, i) => {
                    const isVisit = h.type === "visit";
                    const isScreen = h.type === "screening";
                    const isEscalation = h.type === "escalation";

                    return (
                      <div key={h.id} className="relative">
                        {/* Timeline Bullet Indicator Icon */}
                        <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs select-none shadow-sm ${
                          isVisit 
                            ? "bg-[#386934] text-white" 
                            : isScreen 
                              ? "bg-[#dd8d36] text-white" 
                              : isEscalation
                                ? "bg-[#ba1a1a] text-white"
                                : "bg-[#c7e7fc] text-[#001e2c]"
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">{
                            isVisit ? "home" : isScreen ? "assignment" : isEscalation ? "priority_high" : "edit_note"
                          }</span>
                        </div>

                        {/* Event details card box */}
                        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-[#c2c7cc]/50 hover:border-[#72787c]/40 transition duration-150">
                          <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                            <span className="text-sm font-extrabold text-[#191c1d]">{h.title}</span>
                            <span className="text-[10px] font-semibold text-[#72787c]">{h.date}</span>
                          </div>
                          <p className="text-xs text-[#42474b] leading-relaxed">{h.description}</p>
                          
                          {h.tags && (
                            <div className="flex gap-1.5 mt-3 flex-wrap">
                              {h.tags.map(t => (
                                <span key={t} className="bg-white border border-[#c2c7cc]/60 text-[#42474b] rounded text-[9px] font-black tracking-widest px-2 py-0.5 leading-none shadow-xs">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#c2c7cc]/40 flex justify-between items-center text-xs text-[#72787c]">
                <span>Registered in Chitungwiza Ward Cell</span>
                <span className="font-extrabold text-[#386934]">Encrypted Local Offline State</span>
              </div>
            </div>

            {/* Sidebar metadata columns */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Seke Hub Locator Waypoint Component */}
              <div className="bg-white border border-[#c2c7cc] rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3 bg-neutral-50 border-b border-[#c2c7cc]/50 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-[#72787c] tracking-wider">Referral GPS Context</span>
                  <span className="text-[10px] font-black text-[#386934]">Live GIS</span>
                </div>
                <ZimbabweMap 
                  heightClass="h-44" 
                  singleClinicFocus={(() => {
                    if (!selectedClient) return null;
                    const d = selectedClient.district.toLowerCase();
                    if (d.includes("bulawayo")) {
                      return { id: "c-mpilo-central", name: "Mpilo Central Hospital", lat: -20.1264, lng: 28.5684, city: "Bulawayo", type: "National Referral Hospital", contacts: "+263 292 212011" };
                    }
                    return { id: "c-seke-north", name: "Seke North Clinic", lat: -18.0069, lng: 31.0772, city: "Chitungwiza", type: "District Clinic", contacts: "+263 270 31055" };
                  })()} 
                />
                <div className="p-4">
                  <button 
                    onClick={() => {
                      const lat = selectedClient?.district.toLowerCase().includes("bulawayo") ? -20.1264 : -18.0069;
                      const lng = selectedClient?.district.toLowerCase().includes("bulawayo") ? 28.5684 : 31.0772;
                      alert(`Opening secure navigation vector in Zimbabwe coordinates: [${lat}, ${lng}]. Dispatch ready!`);
                    }}
                    className="w-full py-2 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#c2c7cc] rounded-lg text-xs font-bold text-[#002434] flex items-center justify-center gap-2 cursor-pointer transition select-none"
                  >
                    <Compass className="w-4 h-4" />
                    Open Route GPS Navigator
                  </button>
                </div>
              </div>

              {/* Active CBT lesson progress modules */}
              <div className="bg-white border border-[#c2c7cc] rounded-2xl p-4 shadow-xs">
                <h3 className="text-[#002434] text-xs font-black uppercase tracking-wider mb-3">Active Self-Help Modules</h3>
                <div className="space-y-3">
                  {selectedClient?.activeModules && selectedClient.activeModules.length > 0 ? (
                    selectedClient.activeModules.map((m, idx) => (
                      <div key={idx} className="p-3 bg-[#b6eeab]/10 rounded-xl border border-[#b6eeab]/20">
                        <div className="flex justify-between items-center text-xs font-extrabold mb-1">
                          <span className="text-[#002434]">{m.name}</span>
                          <span className="text-[#386934]">{m.progress}%</span>
                        </div>
                        <div className="w-full bg-[#f3f4f5] h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${m.progress}%` }}
                            className="bg-[#386934] h-full"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[#72787c] block italic">No self-help modules initialized yet. Use psychoeducation to dispatch.</span>
                  )}
                </div>
              </div>

              {/* Verified active medication list tracking */}
              <div className="bg-white border border-[#c2c7cc] rounded-2xl p-4 shadow-xs">
                <h3 className="text-[#002434] text-xs font-black uppercase tracking-wider mb-2">Prescribed Active Medications</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedClient?.medications && selectedClient.medications.length > 0 ? (
                    selectedClient.medications.map(m => (
                      <span key={m} className="bg-[#f3f4f5] text-[#002434] px-2.5 py-1 rounded-md text-xs font-bold border border-[#c2c7cc]/40 select-all">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#72787c] italic block">No medication prescribed in current local profile.</span>
                  )}
                </div>
              </div>

              {/* Referral Status panel */}
              {selectedClient?.referralStatus.status !== "None" && (
                <div className="bg-[#2e3132] text-white rounded-2xl p-5 relative shadow-sm">
                  <span className="absolute top-4 right-4 material-symbols-outlined text-[#b9f1ad] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#abcbdf] mb-2.5">Clinic Referral Status</h3>
                  <p className="text-xs leading-normal opacity-90">{selectedClient?.referralStatus.title}</p>
                  <div className="flex items-center gap-2 mt-4 text-[10px] uppercase font-black text-[#b9f1ad]">
                    <span>{selectedClient?.referralStatus.status}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="opacity-75">{selectedClient?.referralStatus.subtitle}</span>
                  </div>
                </div>
              )}

            </div>
          </section>

        </main>
      )}

      {/* ==================== MODALS INJECTIONS ==================== */}

      {/* MODAL 1: ADD NEW CLIENT */}
      <AnimatePresence>
        {showAddClientModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-[#c2c7cc]"
            >
              <div className="bg-[#002434] p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Register New Community Peer</span>
                <button onClick={() => setShowAddClientModal(false)} className="text-xs font-bold hover:underline cursor-pointer">Cancel</button>
              </div>

              <form onSubmit={handleAddClient} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Full Patient Alias Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tendai Chitepo"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3.5 text-sm bg-white focus:ring-1 focus:ring-[#002434]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#191c1d] block">Dialect Preference</label>
                    <select
                      value={newClientLang}
                      onChange={(e) => setNewClientLang(e.target.value)}
                      className="w-full h-11 border border-[#c2c7cc] rounded-lg px-2 text-xs bg-white focus:ring-1 focus:ring-[#002434]"
                    >
                      <option value="Shona">Shona (sn)</option>
                      <option value="Ndebele">Ndebele (nd)</option>
                      <option value="English">English (en)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#191c1d] block">Risk Level Assumed</label>
                    <select
                      value={newClientRisk}
                      onChange={(e) => setNewClientRisk(e.target.value as any)}
                      className="w-full h-11 border border-[#c2c7cc] rounded-lg px-2 text-xs bg-white focus:ring-1 focus:ring-[#002434]"
                    >
                      <option value="Mild">Mild Risk</option>
                      <option value="Moderate">Moderate Risk</option>
                      <option value="Severe">Severe Risk</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Village / Hub Territory District</label>
                  <input
                    type="text"
                    required
                    value={newClientDistrict}
                    onChange={(e) => setNewClientDistrict(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3.5 text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#002434] text-white rounded-lg font-bold text-xs hover:bg-[#1a3a4a] transition-all cursor-pointer shadow-sm"
                >
                  Create Client Profile
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: RECORD VISIT NOTES */}
      <AnimatePresence>
        {showRecordVisitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-[#c2c7cc]"
            >
              <div className="bg-[#386934] p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Record Home Visit Report</span>
                <button onClick={() => setShowRecordVisitModal(false)} className="text-xs font-bold hover:underline cursor-pointer">Cancel</button>
              </div>

              <form onSubmit={handleRecordVisitSubmit} className="p-6 space-y-4">
                <div className="text-xs text-[#72787c] font-semibold">
                  Writing to: <strong className="text-[#002434]">{selectedClient?.name}</strong> active ledger.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Visit Activity Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-2 text-xs bg-white"
                  >
                    <option value="Home Visit">Home Visit Check-in</option>
                    <option value="Counseling Session">Counseling Session (Kufungisisa Bench)</option>
                    <option value="Symptom Screening Session">Symptom Screening Checkpoint</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Wellness Status Classification</label>
                  <select
                    value={visitStatusTag}
                    onChange={(e) => setVisitStatusTag(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-2 text-xs bg-white"
                  >
                    <option value="STABLE">STABLE WELLNESS</option>
                    <option value="IMPROVING">IMPROVING ON CBT</option>
                    <option value="STRESSED">STRESSED / DISTRESSED</option>
                    <option value="MED_COMPLIANT">MEDICALLY COMPLIANT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Clinical Notes &amp; Observation Details</label>
                  <textarea
                    required
                    placeholder="Describe patient's cognitive state, compliance, and living adjustments..."
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    className="w-full h-24 border border-[#c2c7cc] rounded-lg p-3 text-xs bg-white outline-none resize-none focus:ring-1 focus:ring-[#3c6e37]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#386934] text-white rounded-lg font-bold text-xs hover:bg-[#20511e] transition-all cursor-pointer shadow-sm"
                >
                  Save Visit Entry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ESCALATE REFERRAL */}
      <AnimatePresence>
        {showEscalateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-[#c2c7cc]"
            >
              <div className="bg-[#ba1a1a] p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Escalate Case to Clinic</span>
                <button onClick={() => setShowEscalateModal(false)} className="text-xs font-bold hover:underline cursor-pointer">Cancel</button>
              </div>

              <form onSubmit={handleEscalateSubmit} className="p-6 space-y-4">
                <p className="text-xs text-[#72787c]">
                  This will change <strong className="text-[#002434]">{selectedClient?.name}</strong>'s risk classification automatically to <strong>Severe</strong> and push immediate dispatch notifications to nearby clinics.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Select Target Medical Facility</label>
                  <select
                    value={escalationFacility}
                    onChange={(e) => setEscalationFacility(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-2 text-xs bg-white"
                  >
                    <option value="Seke Central Clinic">Seke Central Clinic</option>
                    <option value="Bulawayo General Hospital">Bulawayo General Hospital</option>
                    <option value="Harare Psychiatric Board Unit">Harare Psychiatric Board Unit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Reason for dispatch</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suicidal thoughts checklist flags"
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3 text-xs bg-white focus:ring-1 focus:ring-red-650"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#ba1a1a] text-white rounded-lg font-bold text-xs hover:bg-red-750 transition-all cursor-pointer shadow-sm"
                >
                  Elevate and dispatch case
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: SCHEDULE FOLLOWUP */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-[#c2c7cc]"
            >
              <div className="bg-[#386934] p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Schedule Client Check-In</span>
                <button onClick={() => setShowScheduleModal(false)} className="text-xs font-bold hover:underline cursor-pointer">Cancel</button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">New Check-In Date Target</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Agenda context</label>
                  <input
                    type="text"
                    placeholder="e.g. Deliver weekly hygiene pack"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3 text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#3c6e37] text-white rounded-lg font-bold text-xs hover:bg-[#20511e] transition-all cursor-pointer shadow-sm"
                >
                  Book Follow-up Appointment
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 5: MEDICATIONS UPDATER */}
      <AnimatePresence>
        {showMedicationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-[#c2c7cc]"
            >
              <div className="bg-[#002434] p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Prescribe / Log Medications</span>
                <button onClick={() => setShowMedicationModal(false)} className="text-xs font-bold hover:underline cursor-pointer">Cancel</button>
              </div>

              <form onSubmit={handleMedicationSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#191c1d] block">Add New Medication Item</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sertraline 50mg daily"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full h-11 border border-[#c2c7cc] rounded-lg px-3 text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#002434] text-white rounded-lg font-bold text-xs hover:bg-[#1a3a4a] transition-all cursor-pointer"
                >
                  Write Medication entry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
