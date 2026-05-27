import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Plus, 
  ArrowLeft, 
  Clock, 
  ArrowUpRight, 
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
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  Globe,
  Bell,
  Menu,
  FileUp,
  Sliders,
  LogOut,
  LineChart,
  Eye,
  CheckCircle2,
  Lock,
  ExternalLink,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";

interface AdminPortalProps {
  onLogout: () => void;
}

function getYouTubeThumb(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
}

interface ContentItem {
  id: string;
  title: string;
  category: "Article" | "Audio" | "Video" | "PDF";
  language: "English" | "Shona" | "Ndebele";
  description: string;
  date: string;
  status: "Published" | "Draft" | "Review";
  views: number;
  author: string;
  imageUrl?: string;
  tags: string[];
  bodyText?: string;
}

const INITIAL_CONTENT: ContentItem[] = [];

export default function AdminPortal({ onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "content" | "analytics" | "settings">("dashboard");
  const [contentList, setContentList] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem("moyo_admin_content");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude the old pre-populated mock IDs to keep their custom content completely pristine
        return parsed.filter((item: ContentItem) => !["cnt-101", "cnt-102", "cnt-103", "cnt-104"].includes(item.id));
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync to database and listen in real-time globally for all sessions (to prevent content losing on signouts)
  useEffect(() => {
    const path = "moyo_content";
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items: ContentItem[] = [];
      snapshot.forEach((docRef) => {
        items.push(docRef.data() as ContentItem);
      });
      setContentList(items);
    }, (error) => {
      console.error("Firebase synchronizing error: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Keep local storage formatted
  useEffect(() => {
    localStorage.setItem("moyo_admin_content", JSON.stringify(contentList));
  }, [contentList]);

  // Real Google Sign in Triggers
  const handleConnectGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Access token validated! Synchronized to firestore core.");
    } catch (err: any) {
      console.error(err);
      alert(`Connection failed: ${err.message}`);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await signOut(auth);
      showToast("Closed secure Firestore admin session.");
    } catch (err: any) {
      console.error(err);
    }
  };

  const triggerManualSeed = async () => {
    let successCount = 0;
    for (const item of INITIAL_CONTENT) {
      try {
        await setDoc(doc(db, "moyo_content", item.id), item);
        successCount++;
      } catch (err) {
        console.error("Seeding item error: ", err);
      }
    }
    showToast(`Seeded ${successCount}/${INITIAL_CONTENT.length} default articles live successfully!`);
  };
  
  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState<"All" | "English" | "Shona" | "Ndebele">("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Article" | "Audio" | "Video" | "PDF">("All");

  // Interactive Content Creation & Form Control
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Upload Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Article" | "Audio" | "Video" | "PDF">("Article");
  const [formLanguage, setFormLanguage] = useState<"English" | "Shona" | "Ndebele">("English");
  const [formDesc, setFormDesc] = useState("");
  const [formBodyText, setFormBodyText] = useState("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft" | "Review">("Published");
  const [formTagsString, setFormTagsString] = useState("mentalhealth, community");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Simulated drag-drop feedback
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Real-time toast banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated system settings health triggers
  const [systemHealth, setSystemHealth] = useState({
    mediaServer: true,
    contentDelivery: true,
    secureTunnel: true
  });

  // Settings State variables
  const [backupSchedule, setBackupSchedule] = useState("Every 24 hours");
  const [clinicNodeMode, setClinicNodeMode] = useState("High Availability Regional Node");
  const [encryptionStrength, setEncryptionStrength] = useState("AES-256 GCM");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Drag and drop mocks
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
      showToast(`Asset "${file.name}" recognized successfully!`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
      showToast(`Selected file: ${file.name}`);
    }
  };

  // Submit Content Asset
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Title is required!");
      return;
    }

    const tagsArray = formTagsString.split(",").map(t => t.trim()).filter(Boolean);
    const fallbackImages: Record<string, string> = {
      Article: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHlxAACoJfrui06sWapll_wmW7YTR-pLr34Rqsb2Odp1n_3fIKm0eieSNCCmUCMAA8SoTe6gPoXQmlb_3FNadmMpP0XfNWcIWblEZrwzxT0FVs1KqDODq4IZ7wUUiitamCJT4iQSkyfhPy1qIzUV4qbmKObs6iPKBryIQO_NDG941Bmn3Vg4n5VqmQb2Ozd6IMfMio0AFIkWZH8NhiSOPnqLMxXaMU_zae8cKDdcAteGyI2C6PLBcF6NN_8m27KBD-VfPyUCqAGRhs",
      Audio: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBvmF2my4ALVvl6xrHgE7c42Or7T5QLIrqMwcpgcfl0_3ZoYfxZFquXvhstVD9t5yHJm-mT7naNzfPR8NsSmPxeI5yWSSzbrOld_9-xdJ35hOVlFeRjlXhpms8mCV_wO0msbP6FReAJgSDo_wRoJhrupdKKYJolQwRnLdNW4FovBGmUB7eYMQHHuUvNq_5GQxcgSkNmh0nmVIjnKUdBhy1DD5VflAr8eXj-nqMniGqWEX_f9EhZvI68cf6nAt7rSzUiBV6sEb8TDdp",
      Video: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOdgd4hodXu0-1NIeLDthKe5yjErBQCJbiFj_i5OAI0aA7EBIzi3InX1A6m3QMzqQeyKHIf-52H8T9KOSYyp_Zog0PVmK_1piUov4Bu_mRzU8ucOYYYoA2H9LTqEt6xeR67uJ3O-EbuugagrpZ73ASpDCX4UeEhKOUMJTlBYdsTo8If1CgUVMgowmliT_Hm24eZjnSlWdxkqerEPRKU_Dco3EXBRJSXS6-fNn48Ed4G3HIzBzcdE4rFw6qXSHECxo2sGt_X_pRz8il",
      PDF: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAHlmPX4ReJ0LwASKh_ML7eYbRocacf82TzRHLB6Mty7h4Z18I_q7Hjuz1ZY_DVd9GKBQNJT2k9HjqimMLW6bIgtBr6PSUSBTECIDVj3BkeObaBgzn5S91_VydoQA_8-kpaMnRCLt3_SGNBIyWLfzHHB2QizLDGtDPMxfIyqUO9plQMk9MxkTmrRt5ITm-GGV9Zg1HqubyaY4zD6du5_E8oG4Pga2hECQZOj0UuUSRzXFzRff66di9PuPrTerAGh58-bWz-s0_S5Wm"
    };

    if (isEditMode && editingId) {
      // Edit
      const existingItem = contentList.find(item => item.id === editingId);
      const updatedItem: ContentItem = {
        id: editingId,
        title: formTitle,
        category: formCategory,
        language: formLanguage,
        description: formDesc,
        bodyText: formBodyText,
        status: formStatus,
        date: existingItem?.date || "Just now",
        views: existingItem?.views || 0,
        author: existingItem?.author || "Administrator Node",
        tags: tagsArray,
        imageUrl: formImageUrl || fallbackImages[formCategory]
      };

      setDoc(doc(db, "moyo_content", editingId), updatedItem)
        .then(() => {
          showToast("Content resource updated on live database!");
        })
        .catch((error) => {
          console.error("Firebase update failed:", error);
          showToast("Local edit saved, but Live sync failed. Ensure authenticated.");
          setContentList(prev => prev.map(item => item.id === editingId ? updatedItem : item));
        });
    } else {
      // Create
      const newId = `cnt-${Math.floor(105 + Math.random() * 900)}`;
      const newItem: ContentItem = {
        id: newId,
        title: formTitle,
        category: formCategory,
        language: formLanguage,
        description: formDesc || "No overview statement provided.",
        bodyText: formBodyText || formDesc,
        date: "Just now",
        status: formStatus,
        views: 0,
        author: "Administrator Node",
        imageUrl: formImageUrl || fallbackImages[formCategory],
        tags: tagsArray.length > 0 ? tagsArray : ["mentalhealth"]
      };

      setDoc(doc(db, "moyo_content", newId), newItem)
        .then(() => {
          showToast("New therapeutic content published live to Firebase!");
        })
        .catch((error) => {
          console.error("Firebase create failed:", error);
          showToast("Local creation saved. Live sync failed. Support permissions.");
          setContentList([newItem, ...contentList]);
        });
    }

    resetForm();
    setShowUploadModal(false);
  };

  const handleEditClick = (item: ContentItem) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormLanguage(item.language);
    setFormDesc(item.description);
    setFormBodyText(item.bodyText || "");
    setFormStatus(item.status);
    setFormTagsString(item.tags.join(", "));
    setFormImageUrl(item.imageUrl || "");
    setFileName(null);
    setShowUploadModal(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action is irreversible on the active CDN.`)) {
      deleteDoc(doc(db, "moyo_content", id))
        .then(() => {
          showToast(`Deleted from live database: ${name}`);
        })
        .catch((error) => {
          console.error("Firebase delete failed:", error);
          showToast("Local item cleared. Live database delete failed.");
          setContentList(prev => prev.filter(c => c.id !== id));
        });
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormTitle("");
    setFormCategory("Article");
    setFormLanguage("English");
    setFormDesc("");
    setFormBodyText("");
    setFormStatus("Published");
    setFormTagsString("mentalhealth, peer-help");
    setFileName(null);
    setFormImageUrl("");
  };

  const totalContentCount = contentList.length;
  const articlesCount = contentList.filter(item => item.category === "Article").length;
  const audioCount = contentList.filter(item => item.category === "Audio").length;
  const videoPdfCount = contentList.filter(item => item.category === "Video" || item.category === "PDF").length;

  const filteredItems = contentList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = langFilter === "All" ? true : item.language === langFilter;
    const matchesCategory = categoryFilter === "All" ? true : item.category === categoryFilter;
    return matchesSearch && matchesLang && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-sans select-none relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -25, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -25, x: "-50%" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#002434] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 text-xs font-bold border border-[#abcbdf]/30"
          >
            <CheckCircle className="w-4 h-4 text-[#b6eeab]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#f3f4f5] border-r border-[#c2c7cc]/70 flex flex-col justify-between shrink-0 p-5 md:fixed md:top-0 md:bottom-0 md:left-0 z-40">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/images/moyoconnect_logo_1779856207318.png" 
                alt="MoyoConnect Logo" 
                className="h-9 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-md font-extrabold text-[#002434] tracking-tight leading-none">MoyoConnect</span>
                <span className="text-[9px] text-[#386934] uppercase tracking-wider font-extrabold mt-0.5">Admin Staff Portal</span>
              </div>
            </div>

            <nav className="space-y-1.5 pt-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#002434] text-white shadow-sm"
                    : "text-[#42474b] hover:bg-[#c2c7cc]/30 hover:text-[#002434]"
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span>Dashboard Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab("content")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "content"
                    ? "bg-[#002434] text-white shadow-sm"
                    : "text-[#42474b] hover:bg-[#c2c7cc]/30 hover:text-[#002434]"
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span>Content Library</span>
                <span className="ml-auto bg-[#c7e7fc] text-[#002434] text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  {contentList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-[#002434] text-white shadow-sm"
                    : "text-[#42474b] hover:bg-[#c2c7cc]/30 hover:text-[#002434]"
                }`}
              >
                <LineChart className="w-4 h-4 shrink-0" />
                <span>NGO Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-[#002434] text-white shadow-sm"
                    : "text-[#42474b] hover:bg-[#c2c7cc]/30 hover:text-[#002434]"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>System Settings</span>
              </button>
            </nav>
          </div>

          {/* User badge */}
          <div className="pt-4 border-t border-[#c2c7cc]/50 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#c7e7fc] flex items-center justify-center text-[#002434] font-black text-xs border border-[#abcbdf]">
                AP
              </div>
              <div>
                <span className="block text-xs font-bold text-[#191c1d]">Admin Profile</span>
                <span className="block text-[10px] text-[#72787c]">System Director</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full h-9 border border-[#002434]/40 hover:bg-[#ba1a1a]/10 hover:border-[#ba1a1a] hover:text-[#ba1a1a] text-[#42474b] text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Action Panel / Primary Pages content */}
        <div className="flex-grow md:pl-64 flex flex-col min-h-screen">
          
          {/* Live Sync Auth Banner */}
          {!firebaseUser || firebaseUser.email !== "mjmatongo@africau.edu" ? (
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-red-900">
                    Unauthenticated for Live Content database
                  </p>
                  <p className="text-[10px] text-red-700 font-medium">
                    New items will remain local to your browser. Authenticate with Google holding the admin email (<strong>mjmatongo@africau.edu</strong>) to enable global live sync.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="py-1.5 px-3 bg-red-600 text-white rounded-lg text-xs font-extrabold hover:bg-red-700 cursor-pointer flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <Globe className="w-3.5 h-3.5" /> Sign in with Google
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Live Firestore Core Connected
                  </p>
                  <p className="text-[10px] text-emerald-800 font-medium">
                    Synchronized to the database as <strong>{firebaseUser.email}</strong>. Articles edited here will instant-propagate to all devices.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={triggerManualSeed}
                  className="py-1 px-2.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-[9px] font-black hover:bg-emerald-100 cursor-pointer transition-all"
                >
                  Publish Base Seeds Live
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="py-1 px-2.5 bg-emerald-700 text-white rounded-md text-[10px] font-black hover:bg-emerald-800 cursor-pointer transition-all"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
          
          {/* Header Bar */}
          <header className="h-16 border-b border-[#c2c7cc]/60 bg-white sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#386934]" />
              <h1 className="text-md md:text-lg font-black text-[#002434] tracking-tight">
                MoyoConnect Central Admin Hub
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-[#386934] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#386934] animate-ping" />
                  Active CDC Node online
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#72787c]">Cluster Server Status</span>
              </div>
              <button 
                onClick={() => showToast("All clinic nodes are synchronized.")} 
                className="p-2 hover:bg-[#f3f4f5] rounded-full text-[#42474b] relative cursor-pointer active:scale-95 transition-transform"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full animate-bounce" />
              </button>
            </div>
          </header>

          <main className="p-6 md:p-10 space-y-6 flex-grow max-w-7xl w-full mx-auto">
            
            {/* ===================== VIEW 1: DASHBOARD OVERVIEW ===================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Dashboard top header summary */}
                <div>
                  <h2 className="text-2xl font-black text-[#002434] tracking-tight">Humanitarian Clinical System Operations</h2>
                  <p className="text-xs md:text-sm text-[#42474b]">Configure clinical media resources, monitor high-risk signals, and verify live database node integrity.</p>
                </div>

                {/* Grid metrics stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Stats 1: Content Library */}
                  <div 
                    onClick={() => setActiveTab("content")} 
                    className="bg-white border border-[#c2c7cc] p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden group border-t-4 border-t-[#002434]"
                  >
                    <div>
                      <BookOpen className="w-5 h-5 text-[#002434] mb-1.5" />
                      <h3 className="text-xs font-extrabold text-[#72787c] uppercase tracking-wider">Content Library</h3>
                      <p className="text-3xl font-black text-[#002434] mt-1.5">{totalContentCount}</p>
                    </div>
                    <div className="text-[11px] text-[#386934] font-bold mt-4 flex items-center gap-1">
                      Live content channels <CheckCircle2 className="w-3" />
                    </div>
                  </div>

                  {/* Stats 2: Published Articles */}
                  <div 
                    onClick={() => { setActiveTab("content"); setCategoryFilter("Article"); }}
                    className="bg-white border border-[#c2c7cc] p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-[#386934]"
                  >
                    <div>
                      <FileText className="w-5 h-5 text-[#386934] mb-1.5" />
                      <h3 className="text-xs font-extrabold text-[#72787c] uppercase tracking-wider">Articles Published</h3>
                      <p className="text-3xl font-black text-[#386934] mt-1.5">{articlesCount}</p>
                    </div>
                    <div className="text-[11px] text-[#72787c] font-semibold mt-4">
                      Active text-based resource sheets
                    </div>
                  </div>

                  {/* Stats 3: Audio Lessons */}
                  <div 
                    onClick={() => { setActiveTab("content"); setCategoryFilter("Audio"); }}
                    className="bg-white border border-[#c2c7cc] p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-[#dd8d36]"
                  >
                    <div>
                      <Volume2 className="w-5 h-5 text-[#dd8d36] mb-1.5" />
                      <h3 className="text-xs font-extrabold text-[#72787c] uppercase tracking-wider">Audio Lessons</h3>
                      <p className="text-3xl font-black text-[#351b00] mt-1.5">{audioCount}</p>
                    </div>
                    <div className="text-[11px] text-[#72787c] font-semibold mt-4">
                      Soundtracks & guidance recordings
                    </div>
                  </div>

                  {/* Stats 4: Multimedia Videos/PDFs */}
                  <div 
                    onClick={() => { setActiveTab("content"); setCategoryFilter("Video"); }}
                    className="bg-white border border-[#c2c7cc] p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden border-t-4 border-t-[#ba1a1a]"
                  >
                    <div>
                      <Play className="w-5 h-5 text-[#ba1a1a] mb-1.5" />
                      <h3 className="text-xs font-extrabold text-[#72787c] uppercase tracking-wider">Videos & PDFs</h3>
                      <p className="text-3xl font-black text-[#ba1a1a] mt-1.5">{videoPdfCount}</p>
                    </div>
                    <div className="text-[11px] text-red-700 font-bold mt-4">
                      Interactive video and system manuals
                    </div>
                  </div>
                </div>

                {/* Quick actions section & cluster monitor */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Quick Upload draft generator */}
                  <div className="lg:col-span-4 bg-[#002434] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#386934]" />
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-black uppercase text-[#abcbdf] tracking-widest">Quick Asset Portal</h3>
                        <p className="text-xs text-[#abcbdf]/80 leading-normal mt-1">Surgical tool to push new clinical files or audio sessions onto servers immediately.</p>
                      </div>

                      {/* Fake Drop Zone */}
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                          isDragOver 
                            ? "bg-[#386934]/30 border-[#b6eeab]" 
                            : "bg-[#1a3a4a]/50 border-[#85a4b7]/30 hover:bg-[#1a3a4a]/70"
                        }`}
                        onClick={() => {
                          resetForm();
                          setShowUploadModal(true);
                        }}
                      >
                        <FileUp className="w-8 h-8 text-[#b6eeab] mb-2" />
                        <span className="block text-xs font-bold text-white">
                          {fileName ? `Loaded: ${fileName}` : "Click to select a file"}
                        </span>
                        <span className="block text-[10px] text-[#abcbdf] mt-0.5">MP4, MP3, PDF up to 50MB</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4">
                      <button
                        onClick={() => {
                          resetForm();
                          setIsEditMode(false);
                          setShowUploadModal(true);
                        }}
                        className="w-full h-10 bg-[#386934] hover:bg-[#20511e] text-white rounded-full font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Content Draft
                      </button>
                      <button
                        onClick={() => showToast("Launching secure navigation to hospital servers.")}
                        className="w-full h-10 bg-[#1a3a4a] hover:bg-[#2c4a5b] text-[#abcbdf] border border-[#abcbdf]/20 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Manage Server CDN Logs
                      </button>
                    </div>
                  </div>

                  {/* System health indicators */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Health toggles */}
                    <div className="bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs">
                      <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-[#386934]" />
                        Real-time Node Telemetry Monitor
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Toggle 1 */}
                        <div className="border border-[#c2c7cc]/60 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-bold text-[#191c1d]">Media Streamer</span>
                            <span className={`text-[10px] font-black uppercase ${systemHealth.mediaServer ? "text-[#386934]" : "text-[#ba1a1a]"}`}>
                              {systemHealth.mediaServer ? "Operational" : "Down"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSystemHealth(prev => ({ ...prev, mediaServer: !prev.mediaServer }));
                              showToast(`Media streaming cluster ${!systemHealth.mediaServer ? "restored to backup node" : "paused safely"}.`);
                            }}
                            className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${systemHealth.mediaServer ? "bg-[#386934]" : "bg-[#c2c7cc]"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${systemHealth.mediaServer ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>

                        {/* Toggle 2 */}
                        <div className="border border-[#c2c7cc]/60 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-bold text-[#191c1d]">Content CDN</span>
                            <span className={`text-[10px] font-black uppercase ${systemHealth.contentDelivery ? "text-[#386934]" : "text-[#ba1a1a]"}`}>
                              {systemHealth.contentDelivery ? "Active" : "Down"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSystemHealth(prev => ({ ...prev, contentDelivery: !prev.contentDelivery }));
                              showToast(`CDN delivery pipeline ${!systemHealth.contentDelivery ? "switched back to active" : "suspended"}.`);
                            }}
                            className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${systemHealth.contentDelivery ? "bg-[#386934]" : "bg-[#c2c7cc]"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${systemHealth.contentDelivery ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>

                        {/* Toggle 3 */}
                        <div className="border border-[#c2c7cc]/60 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-bold text-[#191c1d]">Moyo Tunnel</span>
                            <span className={`text-[10px] font-black uppercase ${systemHealth.secureTunnel ? "text-[#386934]" : "text-[#ba1a1a]"}`}>
                              {systemHealth.secureTunnel ? "Encrypted" : "Offline fallback"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSystemHealth(prev => ({ ...prev, secureTunnel: !prev.secureTunnel }));
                              showToast(`TLS security tunnel is ${!systemHealth.secureTunnel ? "re-established" : "decoupled into offline mode"}.`);
                            }}
                            className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${systemHealth.secureTunnel ? "bg-[#386934]" : "bg-[#c2c7cc]"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full transition-transform ${systemHealth.secureTunnel ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recently added list table */}
                    <div className="bg-white border border-[#c2c7cc] rounded-2xl p-6 shadow-xs">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest flex items-center gap-1.5">
                          <BookOpen className="w-4.5 h-4.5 text-[#306534]" />
                          Recently Registered Content Nodes
                        </h3>
                        <button 
                          onClick={() => setActiveTab("content")} 
                          className="text-[11px] font-black text-[#386934] hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          View Full Library <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="divide-y divide-[#c2c7cc]/50">
                        {contentList.slice(0, 3).map((item) => (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#f3f4f5] border border-[#c2c7cc]/50">
                                <img src={getYouTubeThumb(item.imageUrl) || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-[#191c1d] truncate max-w-[240px] md:max-w-md">
                                  {item.title}
                                </span>
                                <span className="block text-[10px] text-[#72787c]">
                                  {item.category} • Created {item.date} • {item.language}
                                </span>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              item.status === "Published" 
                                ? "bg-[#b9f1ad] text-[#002202]" 
                                : item.status === "Draft" 
                                  ? "bg-[#e1e3e4] text-[#42474b]" 
                                  : "bg-[#ffdad6] text-[#93000a]"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ===================== VIEW 2: CONTENT MANAGER ===================== */}
            {activeTab === "content" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#002434] tracking-tight">Active Content Library</h2>
                    <p className="text-xs md:text-sm text-[#42474b]">Manage educational guides, localized CBT audio sessions, and risk safeguarding PDFs here.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      resetForm();
                      setIsEditMode(false);
                      setShowUploadModal(true);
                    }}
                    className="h-11 px-5 bg-[#386934] hover:bg-[#20511e] text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    Create New Content Node
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white border border-[#c2c7cc] p-4 rounded-2xl shadow-xs space-y-4">
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search query input */}
                    <div className="relative flex-grow">
                      <Search className="w-4 h-4 text-[#72787c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, description or file ID..."
                        className="w-full h-11 pl-10 pr-4 bg-[#f8f9fa] border border-[#c2c7cc] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                      />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap gap-2">
                      {/* Language Selection chips */}
                      <div className="flex rounded-lg border border-[#c2c7cc] overflow-hidden bg-[#f8f9fa] text-xs font-bold text-[#42474b]">
                        {["All", "English", "Shona", "Ndebele"].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLangFilter(lang as any)}
                            className={`px-3 py-2 transition-colors cursor-pointer ${
                              langFilter === lang 
                                ? "bg-[#002434] text-white" 
                                : "hover:bg-[#c2c7cc]/35 bg-white"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      {/* Category Switcher */}
                      <div className="flex rounded-lg border border-[#c2c7cc] overflow-hidden bg-[#f8f9fa] text-xs font-bold text-[#42474b]">
                        {["All", "Article", "Audio", "Video", "PDF"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat as any)}
                            className={`px-3 py-2 transition-colors cursor-pointer ${
                              categoryFilter === cat 
                                ? "bg-[#386934] text-white" 
                                : "hover:bg-[#c2c7cc]/35 bg-white"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Lists items */}
                {filteredItems.length === 0 ? (
                  <div className="bg-white border border-[#c2c7cc] p-12 text-center rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-[#ba1a1a] mx-auto mb-2" />
                    <span className="block text-xs font-bold text-[#002434]">No matching content items indexed.</span>
                    <span className="block text-[11px] text-[#72787c] mt-0.5">Try widening your filters or creating a new content entry.</span>
                    <button 
                      onClick={() => { resetForm(); setLangFilter("All"); setCategoryFilter("All"); setSearchQuery(""); }} 
                      className="mt-4 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#c2c7cc] text-xs text-[#002434] px-4 py-2 rounded-full font-bold transition-all cursor-pointer"
                    >
                      Reset Filter Queries
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-2xl overflow-hidden border border-[#c2c7cc] flex flex-col justify-between hover:shadow-md transition-shadow relative"
                      >
                        {/* Upper image and metadata */}
                        <div>
                          <div className="h-44 overflow-hidden bg-[#edeeef] relative border-b border-[#c2c7cc]/50">
                            <img src={getYouTubeThumb(item.imageUrl) || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            
                            {/* Status and category badge overlays */}
                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <span className="bg-[#002434] text-white px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide">
                                {item.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-xs ${
                                item.status === "Published" 
                                  ? "bg-[#b9f1ad] text-[#002202]" 
                                  : item.status === "Draft" 
                                    ? "bg-[#e1e3e4] text-[#42474b]" 
                                    : "bg-[#ffdad6] text-[#93000a]"
                              }`}>
                                {item.status}
                              </span>
                            </div>

                            <span className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                              ID: {item.id}
                            </span>
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#386934] uppercase tracking-wider">
                                LANGUAGE: {item.language}
                              </span>
                              <span className="text-[10px] text-[#72787c] font-semibold">
                                Published: {item.date}
                              </span>
                            </div>

                            <h3 className="text-md font-black text-[#002434] leading-snug">{item.title}</h3>
                            <p className="text-xs text-[#42474b] leading-relaxed line-clamp-3">{item.description}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {item.tags.map(tag => (
                                <span key={tag} className="bg-[#f3f4f5] border border-[#c2c7cc]/50 text-[#42474b] rounded text-[9px] font-bold px-2 py-0.5 select-all">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Lower Action buttons */}
                        <div className="p-4 bg-[#f8f9fa] border-t border-[#c2c7cc]/40 flex justify-between items-center">
                          <span className="text-[10px] text-[#72787c] font-extrabold uppercase flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-[#386934]" />
                            {item.views} user interactions
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1 px-2.5 bg-white hover:bg-[#c7e7fc]/40 border border-[#c2c7cc] hover:border-[#002434] rounded text-[11px] font-black text-[#002434] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit item node"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id, item.title)}
                              className="p-1 px-2.5 bg-white hover:bg-[#ffdad6] border border-[#c2c7cc] hover:border-[#ba1a1a] rounded text-[11px] font-black text-[#ba1a1a] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Delete item statement"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ===================== VIEW 3: NGO ANALYTICS REPORTS ===================== */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fade-in">
                
                <div>
                  <h2 className="text-2xl font-black text-[#002434] tracking-tight">Active Peer Patient Network Reports</h2>
                  <p className="text-xs md:text-sm text-[#42474b]">Clinical screening outputs, average CBT record scores, and peer module completions across Seke & Bulawayo.</p>
                </div>

                {/* Grid Bento style reports */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: PHQ-9 distress statistics */}
                  <div className="bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#ba1a1a]" />
                      Average Patient Distress Index
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-[#191c1d]">
                          <span>Severe Risk triggers (PHQ-9 Score 15+)</span>
                          <span className="font-extrabold text-[#ba1a1a]">14.2%</span>
                        </div>
                        <div className="h-2 w-full bg-[#f3f4f5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#ba1a1a]" style={{ width: "14.2%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-[#191c1d]">
                          <span>Moderate Risk signals (PHQ-9 Score 10-14)</span>
                          <span className="font-extrabold text-[#dd8d36]">58.3%</span>
                        </div>
                        <div className="h-2 w-full bg-[#f3f4f5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#dd8d36]" style={{ width: "58.3%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-[#191c1d]">
                          <span>Mild or Healthy signals (PHQ-9 0-9)</span>
                          <span className="font-extrabold text-[#386934]">27.5%</span>
                        </div>
                        <div className="h-2 w-full bg-[#f3f4f5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#386934]" style={{ width: "27.5%" }} />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#72787c] leading-relaxed italic">
                      Based on 45 active registered patient profiles completed via localized SMS screening.
                    </p>
                  </div>

                  {/* Card 2: Interactive self-help module ratios */}
                  <div className="bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#386934]" />
                      Popular Self-Help App Modules
                    </h3>
                    
                    <div className="space-y-4 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#191c1d]">CBT Fundamentals Framework</span>
                        <span className="bg-[#b9f1ad] text-[#002202] px-2.5 py-0.5 rounded font-black">74% active</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#191c1d]">Respiratory Breath loops</span>
                        <span className="bg-[#b9f1ad] text-[#002202] px-2.5 py-0.5 rounded font-black">48% active</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#191c1d]">Reframing Subconscious Stories</span>
                        <span className="bg-[#c7e7fc] text-[#002434] px-2.5 py-0.5 rounded font-black">35% active</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#191c1d]">Localized Psychoed Guides</span>
                        <span className="bg-[#c7e7fc] text-[#002434] px-2.5 py-0.5 rounded font-black">24% active</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Administrative linkage efficiency */}
                  <div className="bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-[#306534]" />
                        Hospital linkage efficiency
                      </h3>
                      <p className="text-xs text-[#42474b] leading-relaxed">
                        MoyoConnect tracks the total elapsed time between a CHW dispatching a "Severe Mental Health Escalation" and the patient filing their physical evaluating visit.
                      </p>
                      <div className="p-4 bg-[#f3f4f5] rounded-xl border border-[#c2c7cc]/50">
                        <span className="block text-[10px] uppercase font-bold text-[#72787c]">Avg Clinic Appointment cycle</span>
                        <span className="block text-2xl font-black text-[#002434] mt-0.5">3.2 days</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#72787c]">
                      Standard guidelines require hospital action inside 5 business days.
                    </div>
                  </div>

                </div>

                {/* Audit activity stream */}
                <div className="bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest mb-4">Central Dispatch System Audit Log</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3 text-xs text-[#42474b] items-start">
                      <span className="w-2 h-2 rounded-full bg-[#386934] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#191c1d]">Clinical PDF updated: Trauma-Informed Care Protocol</span>
                        <span className="block text-[10px] text-[#72787c] mt-0.5">Approved by administrator role • 2 hours ago</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-[#42474b] items-start">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#191c1d]">Automated crisis alert dispatched to Seke Hospital</span>
                        <span className="block text-[10px] text-[#72787c] mt-0.5">High rating flagged for Tariro Moyo. Case #MZ-9921 • Oct 24, 2026</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-[#42474b] items-start">
                      <span className="w-2 h-2 rounded-full bg-[#386934] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#191c1d]">6 new Shona CBT audio sessions synced</span>
                        <span className="block text-[10px] text-[#72787c] mt-0.5">Distributed to offline cluster successfully • Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ===================== VIEW 4: SYSTEM SETTINGS ===================== */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in">
                
                <div>
                  <h2 className="text-2xl font-black text-[#002434] tracking-tight">App Configuration & Clinic Settings</h2>
                  <p className="text-xs md:text-sm text-[#42474b]">Manage TLS proxy certificates, backup routines, and localization credentials below.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left configure form */}
                  <div className="lg:col-span-8 bg-white border border-[#c2c7cc] rounded-2xl p-6 shadow-xs space-y-6">
                    <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest mb-2 flex items-center gap-2">
                      <Sliders className="w-4.5 h-4.5 text-[#386934]" />
                      Global Cluster Variables
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Security Backup Intervals */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#191c1d]">Secure Backup Schedule</label>
                        <select 
                          value={backupSchedule}
                          onChange={(e) => {
                            setBackupSchedule(e.target.value);
                            showToast(`Backup schedule is now set to: ${e.target.value}`);
                          }}
                          className="h-11 px-3 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#002434] text-[#191c1d] outline-none"
                        >
                          <option>Every 1 hour</option>
                          <option>Every 6 hours</option>
                          <option>Every 12 hours</option>
                          <option>Every 24 hours</option>
                          <option>Weekly (Recommended for low network)</option>
                        </select>
                      </div>

                      {/* Clinic Node Mode */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#191c1d]">Clinic Node Operational Model</label>
                        <select 
                          value={clinicNodeMode}
                          onChange={(e) => {
                            setClinicNodeMode(e.target.value);
                            showToast(`Clinic system switched to ${e.target.value}`);
                          }}
                          className="h-11 px-3 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#002434] text-[#191c1d] outline-none"
                        >
                          <option>High Availability Regional Node</option>
                          <option>Hybrid Cloud Sync Node</option>
                          <option>Strict Local Encrypted Vault</option>
                          <option>Low Bandwidth Minimal Payload Fallback</option>
                        </select>
                      </div>

                      {/* Encryption Intensity */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#191c1d]">Data Storage Encryption Strength</label>
                        <select 
                          value={encryptionStrength}
                          onChange={(e) => {
                            setEncryptionStrength(e.target.value);
                            showToast(`Vault encryption algorithm adjusted to: ${e.target.value}`);
                          }}
                          className="h-11 px-3 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#002434] text-[#191c1d] outline-none"
                        >
                          <option>AES-256 GCM (Military Grade)</option>
                          <option>ChaCha20-Poly1305 (Mobile Optimized)</option>
                          <option>AES-128 CBC (Low resources default)</option>
                        </select>
                      </div>

                      {/* Applet Version control */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#72787c]">Cluster App Version</label>
                        <div className="h-11 bg-[#f3f4f5] border border-[#c2c7cc]/70 rounded-lg flex items-center px-4 text-xs font-bold text-[#002434]">
                          MoyoConnect Enterprise v3.8.4-RELEASE
                        </div>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-[#c2c7cc]/50 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => showToast("Local node cached records purged successfully.")}
                        className="py-2.5 px-4 bg-[#ba1a1a]/15 hover:bg-[#ba1a1a] hover:text-white border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Purge Local Node Cache
                      </button>
                      <button
                        onClick={() => showToast("Full encrypted DB backup downloaded for offline custody.")}
                        className="py-2.5 px-4 bg-[#002434] hover:bg-[#1a3a4a] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Export Encrypted Database Dump
                      </button>
                    </div>

                  </div>

                  {/* Security overview warnings card */}
                  <div className="lg:col-span-4 bg-white border border-[#c2c7cc] p-6 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-[#002434] tracking-widest flex items-center gap-1.5">
                      <Shield className="w-4.5 h-4.5 text-[#306534]" />
                      Safeguarding Policy Credentials
                    </h3>

                    <p className="text-xs text-[#42474b] leading-relaxed">
                      All clinical media, CBT record drafts, and screening metrics stored within this administrative hub are bound by international humanitarian safeguards (MhGAP guidelines) and encrypted in compliance with healthcare secrecy codes.
                    </p>

                    <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-xl text-xs space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                        Secrecy Guideline Warning
                      </span>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        Never export patient records without explicit regional NGO consent. Disclosing identifying codes ruins peer patient security.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </main>

          {/* Footer bar */}
          <footer className="h-14 bg-[#f3f4f5] border-t border-[#c2c7cc]/50 flex flex-col sm:flex-row items-center justify-between px-6 md:px-10 text-xs text-[#72787c]">
            <span>© 2026 MoyoConnect Humanitarian Care. Confidential Admin Node.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline hover:text-[#002434]">Support</a>
              <a href="#" className="hover:underline hover:text-[#002434]">Clinical Protocol</a>
              <a href="#" className="hover:underline hover:text-[#002434]">Terms of Secrecy</a>
            </div>
          </footer>

        </div>

      </div>

      {/* ===================== NEW CONTENT CREATION / EDITING MODAL ===================== */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-6 md:p-8 border border-[#c2c7cc] shadow-2xl flex flex-col justify-between"
            >
              
              {/* Top Title Bar */}
              <div className="flex justify-between items-center pb-4 border-b border-[#c2c7cc]/60 mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#002434]">
                    {isEditMode ? "Edit Existing Content Node" : "Publish New Care Resource"}
                  </h3>
                  <p className="text-xs text-[#72787c] mt-0.5">Configure clinical media assets and deploy them instantly to the peer network.</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="p-1.5 hover:bg-[#f3f4f5] rounded-full text-[#42474b] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form elements split */}
              <form onSubmit={handleSaveContent} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                
                {/* Left hand details configuration options */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#191c1d]">Resource Title</label>
                    <input 
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Cognitive Reframing Practices in Shona communities"
                      className="w-full h-11 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs px-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                    />
                  </div>

                  {/* Category and Languages row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Category */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#191c1d]">Category</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full h-11 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs px-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                      >
                        <option value="Article">Article (Written Material)</option>
                        <option value="Audio">Audio (Voice Recording)</option>
                        <option value="Video">Video (Modular Lesson)</option>
                        <option value="PDF">PDF (Clinical Protocol Guideline)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#191c1d]">Region Language</label>
                      <select 
                        value={formLanguage}
                        onChange={(e) => setFormLanguage(e.target.value as any)}
                        className="w-full h-11 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs px-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                      >
                        <option value="English">English</option>
                        <option value="Shona">Shona</option>
                        <option value="Ndebele">Ndebele</option>
                      </select>
                    </div>

                  </div>

                  {/* Description statement */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#191c1d]">Resource Summary Statement</label>
                    <textarea 
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Write a clear details outline of whom this cognitive strategy assists and key checkpoints..."
                      className="w-full bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs p-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d] resize-none"
                    />
                  </div>

                  {/* Body text / Article Content */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#191c1d]">Full Body Content / Resource Text / Transcript</label>
                    <textarea 
                      rows={6}
                      value={formBodyText}
                      onChange={(e) => setFormBodyText(e.target.value)}
                      placeholder="Enter the full article body, audio session transcript, or modular lessons text..."
                      className="w-full bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs p-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                    />
                  </div>

                  {/* Image link override */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#191c1d]">Thumbnail URL link (Optional override)</label>
                    <input 
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full h-11 bg-[#f8f9fa] border border-[#c2c7cc] rounded-lg text-xs px-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                    />
                  </div>

                </div>

                {/* Right hand assets and preview settings */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Media Upload Area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#191c1d]">Asset File Payload</label>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-colors cursor-pointer text-center relative overflow-hidden ${
                        isDragOver 
                          ? "bg-[#b6eeab]/20 border-[#386934]" 
                          : "bg-[#f8f9fa] border-[#c2c7cc] hover:bg-[#f3f4f5]"
                      }`}
                    >
                      <input 
                        type="file"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.mp3,.mp4"
                      />
                      <Upload className="w-7 h-7 text-[#386934] mb-2" />
                      <span className="block text-xs font-bold text-[#002434]">
                        {fileName ? `Attached: ${fileName}` : "Drag & drop guidelines files"}
                      </span>
                      <span className="block text-[10px] text-[#72787c] mt-0.5">PDF, MP3, MP4 format (Max 100MB)</span>
                    </div>
                  </div>

                  {/* Organisation Details */}
                  <div className="bg-[#f8f9fa] border border-[#c2c7cc] rounded-2xl p-4 space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-[#002434] tracking-wider">Classification & Tags</h4>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#72787c]">Deployed Status</label>
                      <div className="flex rounded-lg overflow-hidden border border-[#c2c7cc] text-xs font-bold text-[#42474b]">
                        {["Published", "Draft", "Review"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setFormStatus(st as any)}
                            className={`flex-1 py-1.5 transition-colors cursor-pointer text-center ${
                              formStatus === st 
                                ? "bg-[#002434] text-white" 
                                : "hover:bg-[#c2c7cc]/30 bg-white"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#72787c]">Tags (Comma separated)</label>
                      <input 
                        type="text"
                        value={formTagsString}
                        onChange={(e) => setFormTagsString(e.target.value)}
                        placeholder="e.g. selfhelp, cbt, Shona"
                        className="w-full h-9 bg-white border border-[#c2c7cc] rounded-lg text-xs px-3 outline-none focus:ring-1 focus:ring-[#002434] text-[#191c1d]"
                      />
                    </div>
                  </div>

                  {/* Card Instant visual design preview */}
                  <div className="bg-[#002434] text-white p-4 rounded-xl shadow-md uppercase tracking-wide">
                    <span className="text-[9px] font-black tracking-widest text-[#abcbdf] block mb-2">Live CDN Preview</span>
                    <span className="block text-xs font-black truncate text-white">{formTitle || "Untitled Resource Item"}</span>
                    <span className="block text-[10px] text-[#abcbdf] normal-case tracking-normal truncate mt-1">
                      {formCategory} • {formLanguage} • {formStatus}
                    </span>
                  </div>

                </div>

                {/* Confirm Action triggers */}
                <div className="lg:col-span-12 pt-4 border-t border-[#c2c7cc]/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="h-10 px-5 border border-[#c2c7cc] hover:bg-[#f3f4f5] rounded-full text-xs font-bold text-[#42474b] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#386934] hover:bg-[#20511e] text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
                  >
                    {isEditMode ? "Update Asset" : "Deploy Live Now"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
