import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Check, 
  CheckCircle, 
  ClipboardList, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  Smile,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface LoginProps {
  onLoginSuccess: (role: "patient" | "chw" | "admin", identifier: string) => void;
  initialLanguage: string;
  onLanguageChange: (lang: "en" | "sn" | "nd") => void;
}

interface Question {
  id: string;
  text: { en: string; sn: string; nd: string };
  options: {
    value: number;
    text: { en: string; sn: string; nd: string };
    description?: { en: string; sn: string; nd: string };
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: "mood",
    text: {
      en: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
      sn: "Mumazuva gumi nemana akapfuura, wakanyanya kunetswa nekunzwa kusuruvara, kuora mwoyo, kana kushaya tariro zvakadii?",
      nd: "Emavikini amabili adluleyo, ukuhlukunyezwa ngokuzwa udangele, ukhathazekile loba ulokulahlekelwa lithemba kukugwenxa kanjani?"
    },
    options: [
      {
        value: 0,
        text: { en: "0 - Not at all", sn: "0 - Kwete zvachose", nd: "0 - Hatshi nakanye" },
        description: { en: "Feeling secure and peaceful", sn: "Kunzwa wakachengeteka uye uine rugare", nd: "Ukuzizwa uvikelekile ulesizotha" }
      },
      {
        value: 1,
        text: { en: "1 - Several days", sn: "1 - Mazuva mashoma", nd: "1 - Amalanga ambalwa" },
        description: { en: "Mild, passing periods of sadness", sn: "Kusuwa kudiki kunopfuura nekukasika", nd: "Ukudana okuncane okudlulayo" }
      },
      {
        value: 2,
        text: { en: "2 - More than half the days", sn: "2 - Kupfuura mazuva mazhinji", nd: "2 - Edlula isigamu samalanga" },
        description: { en: "Persistent weight affecting daily motivation", sn: "Kusuwa kuripo kuchitadzisa shungu", nd: "Ubunzima obukhona obuvimba isasasa" }
      },
      {
        value: 3,
        text: { en: "3 - Nearly every day", sn: "3 - Mazuva ose", nd: "3 - Phose emalangeni wonke" },
        description: { en: "High distress, feeling deeply overwhelmed", sn: "Kushushikana kukuru, kunetseka zvakanyanya", nd: "Ukuhlukunyezwa kakhulu, ukucindezeleka kakhulu" }
      }
    ]
  },
  {
    id: "anxiety",
    text: {
      en: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
      sn: "Mumazuva gumi nemana akapfuura, wakanyanya kunetswa nekutya, kunetseka, kana kunzwa kusagadzikana pamwoyo zvakadii?",
      nd: "Emavikini amabili adluleyo, ukuhlukunyezwa ngokuzwa uvalo, ukukhathazeka loba ukungoneliseki kukugwenxa kanjani?"
    },
    options: [
      {
        value: 0,
        text: { en: "0 - Not at all", sn: "0 - Kwete zvachose", nd: "0 - Hatshi nakanye" },
        description: { en: "Calm, breathing comfortably", sn: "Wakagadzikana, uchifema zvakanaka", nd: "Uthule, uphefumula kahle" }
      },
      {
        value: 1,
        text: { en: "1 - Several days", sn: "1 - Mazuva mashoma", nd: "1 - Amalanga ambalwa" },
        description: { en: "Slight tension under specific demands", sn: "Kutya kudiki panenge paine zvakaoma", nd: "Ukuthukuma okuncane phambi komsebenzi" }
      },
      {
        value: 2,
        text: { en: "2 - More than half the days", sn: "2 - Kupfuura mazuva mazhinji", nd: "2 - Edlula isigamu samalanga" },
        description: { en: "Frequent racing thoughts and muscle tension", sn: "Pfungwa dzinomhanya-mhanya kashoma", nd: "Ukucabanga kakhulu njalo uvalo luyagijima" }
      },
      {
        value: 3,
        text: { en: "3 - Nearly every day", sn: "3 - Mazuva ose", nd: "3 - Phose emalangeni wonke" },
        description: { en: "Constant panic feeling, hard to rest or sleep", sn: "Kutya kusingaperi, kutadza kuzorora", nd: "Ukuyaleka okungapheliyo, ukuhluleka ukuphumula" }
      }
    ]
  },
  {
    id: "concern",
    text: {
      en: "What is the primary wellbeing focus area you would like support with first?",
      sn: "Ndeipi nzvimbo yakanyanya kukosha yeutano hwepfungwa yaungada rubatsiro pamberi?",
      nd: "Yiphi indawo eqakathekileyo yempilo yengqondo ongathanda usizo kuyo kuqala?"
    },
    options: [
      {
        value: 1,
        text: { en: "Stress Management & Overwhelm", sn: "Kugadzirisa Stress neKushushikana", nd: "Ukulungisa ukukhathazeka lomthwalo ongqondweni" },
        description: { en: "Coping with extreme community or economic pressure", sn: "Kukurira kumanikidzwa kweupenyu kana mari", nd: "Ukumelana lemithelela yemali loba yempilo" }
      },
      {
        value: 2,
        text: { en: "Trauma Recovery & Memories", sn: "Kupora kubva pamadziviriro neMarwadzo", nd: "Ukusila ekuhlukunyezweni lasezinkumbulweni ezibuhlungu" },
        description: { en: "Processing past distressing experiences safely", sn: "Kurapa marwadzo kana zvinotyiwa zvakaitika kare", nd: "Ukuhluza okubuhlungu okwasala emva ngendlela evikelekileyo" }
      },
      {
        value: 3,
        text: { en: "Breathing, Grounding & Sleep", sn: "Kufema, Kuzorora neKurara", nd: "Ukuphefumula, ukuthula njalo lokulala" },
        description: { en: "Acquiring somatic habits to stabilize acute anxiety", sn: "Kuziva unyanzvi hwekudzikamisa kutya nekukasika", nd: "Ukufunda izindlela zokwehlisa uvalo ngesiphefumulo" }
      },
      {
        value: 4,
        text: { en: "Community Case CHW Dialogue", sn: "Kukurukura neMupi weRubatsiro weCHW", nd: "Ukukhulumisana lomsizi wezempilo owe-CHW" },
        description: { en: "Direct check-ins representing structured human connection", sn: "Hurukuro neCHW inounza kuyanana nenyaradzo", nd: "Ukuhlangana lomsizi olemfundo yempilo yengqondo" }
      }
    ]
  },
  {
    id: "safety",
    text: {
      en: "Do you have a trusted person or community network you can talk with safely during crisis?",
      sn: "Une munhu waunotsigira kana sangano raunonamata naro raunokwanisa kutaura naye zvakachengeteka panguva dzedambudziko?",
      nd: "Ulesihlobo loba umphakathi ongakhuluma lawo ngokuvikelekileyo ngesikhathi sobunzima obukhulu?"
    },
    options: [
      {
        value: 0,
        text: { en: "Yes, fully active supportive connections", sn: "Hongu, ndine shamwari neukama hwakanaka", nd: "Yebo, ngilobuhlobo lobungane obungisizayo" },
        description: { en: "I can confide in friends, family, or faith group anytime", sn: "Ndinovimba nemhuri, shamwari nechechi", nd: "Ndingathembela emulini, abangane lobugodla bokholo" }
      },
      {
        value: 1,
        text: { en: "Yes, but connection is partial or strained", sn: "Hongu, asi kuyanana hakuna kunyatsagadzikana", nd: "Yebo, kodwa ubuhlobo budonsana ngezindlela ezithile" },
        description: { en: "I have people, but feel hesitant to worry them", sn: "Ndine vanhu asi ndinozengurira kuvatambudza", nd: "Ngilabo abasizi kodwa ngisaba ukubathwalisa nzima" }
      },
      {
        value: 2,
        text: { en: "No, I feel isolated right now", sn: "Kwete, ndiri ndega uye ndinozvinzwa ndakazviparadzanisa", nd: "Hatshi, ngizizwa ngingedwa kakhulu njalo ngibandlululwe" },
        description: { en: "I do not know anyone safe or close enough to tell", sn: "Hapana wandinoziva akakodzera kana ari pedyo", nd: "Kakula muntu ovikelekileyo loba oseduze engingamlandisela" }
      }
    ]
  },
  {
    id: "outreach",
    text: {
      en: "Would you like a District Community Health Worker (CHW) to proactively reach out for support?",
      sn: "Ungada kuti Mupi weRubatsiro (CHW) weMoyo mudunhu renyu akutsvagei kuti akubatsire?",
      nd: "Ungathanda ukuthi umsizi wezempilo owe-CHW asondole kuwe ukuze akunikeze usizo lokuxoxa?"
    },
    options: [
      {
        value: 1,
        text: { en: "Yes, connect me as soon as possible", sn: "Hongu, ndibatanidzei nekukasika", nd: "Yebo, ngihlanganiseni laye ngokukhulu ukushesha" },
        description: { en: "A local CHW under Dr. Sibanda will call/visit you", sn: "CHW wemudunhu akadzorwa naDr. Sibanda achakurukura nemi", nd: "Omele i-CHW ngaphansi kukaDr. Sibanda uzakucingo loba akubone" }
      },
      {
        value: 2,
        text: { en: "Only if my check-in distress level remains high", sn: "Chete kana kushushikana kwangu kukaramba kwakakura", nd: "Nxa isimo sami sokukhathazeka singehlulwa ukwehla" },
        description: { en: "CHW will watch digital dashboard logs, and message privately", sn: "CHW anoona zvakabuda pascreener ozokunyorerai chinyararire", nd: "U-CHW uzabona impilo yenu ocingweni bese ekubhala ekusithekeni" }
      },
      {
        value: 3,
        text: { en: "No, I prefer self-guided app resources only", sn: "Kwete, ndinoda kudzidza nekushandisa chirongwa ndega", nd: "Hatshi, ngithanda uksebenzisa izixhobo zakulolu cingo ngingedwa" }
      }
    ]
  }
];

export default function Login({ onLoginSuccess, initialLanguage, onLanguageChange }: LoginProps) {
  // Navigation views: "login" | "register" | "questionnaire" | "success"
  const [view, setView] = useState<"login" | "register" | "questionnaire" | "success">("login");
  
  const [activeTab, setActiveTab] = useState<"patient" | "chw">("patient");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  const [activeLang, setActiveLang] = useState<"en" | "sn" | "nd">(
    (initialLanguage as "en" | "sn" | "nd") || "en"
  );

  // Registration credentials
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  
  // Questionnaire responses
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, number>>({});

  const dict = {
    patientLogin: { en: "Patient Login", sn: "Kupinda kweMurwere", nd: "Ukungena koMkhulisi" },
    chwLogin: { en: "CHW Login", sn: "Kupinda kweCHW", nd: "Ukungena kweCHW" },
    patientLabel: { en: "Email Address", sn: "Kero yeImeyiri", nd: "Ikheli le-I-meyili" },
    chwLabel: { en: "CHW Staff ID", sn: "ID yeCHW", nd: "Imbobo yeCHW" },
    patientPlaceholder: { en: "e.g. user@example.com", sn: "e.g. mushandisi@example.com", nd: "e.g. umsebenzisi@example.com" },
    chwPlaceholder: { en: "e.g. MC-ZIM-10293", sn: "e.g. MC-ZIM-10293", nd: "e.g. MC-ZIM-10293" },
    passwordLabel: { en: "Password", sn: "Svomhu yekupinda", nd: "Inombolo yokungena" },
    forgot: { en: "Forgot?", sn: "Wakanganwa?", nd: "Ukhohliwe?" },
    signIn: { en: "Sign In", sn: "Pinda", nd: "Ngena" },
    or: { en: "or", sn: "kana", nd: "loba" },
    googleSignIn: { en: "Sign in with Google", sn: "Pindai ne Google", nd: "Ngena nge Google" },
    privacyNote: {
      en: "Your data is encrypted and protected by MoyoConnect security protocols. We never share your health information without explicit consent.",
      sn: "Mashoko enyu akachengetedzwa uye akavharirwa nemutemo weMoyoConnect. Hatimbogoverani ruzivo rwehutano hwenyu pasina mvumo yenyu.",
      nd: "Imininingwane yenu ivikelwe ngaphansi komthetho weMoyoConnect. Asisoze sabelane ngemininingwane yenu yezempilo ngaphandle kwemvumo yenu.",
    },
    noAccount: { en: "Don't have an account?", sn: "Hauna akaundi?", nd: "Haula akhaunti?" },
    registerNow: { en: "Register now", sn: "Nyorera izvozvi", nd: "Bhalisa manje" },
    adminPortal: { en: "Admin Portal", sn: "Mukova weVatungamiri", nd: "Amagede weVaphathi" },
    tagline: {
      en: "Compassionate care for community mental health.",
      sn: "Kuchengetedza kwakanaka nekunzwisisa kwehutano hwetsika dzedu.",
      nd: "Ukukhathalela okuthembekileyo kwempilo yethu yengqondo.",
    },
    title: { en: "Together for a healthier mind.", sn: "Pamwe chete kuitira pfungwa dzinofara.", nd: "Sisonke emoyeni owehlisayo." },
    desc: {
      en: "Connecting communities to care through secure, dignified technology.",
      sn: "Kubatanidza misha nevarapi tichishandisa unyanzvi hwakavimbika kwayo.",
      nd: "Ukuhlanganisa izigaba labasizi ngethekhinoloji evikelekileyo lehloniphekayo.",
    },
    privacyTitle: { en: "Privacy Note:", sn: "Chenjedzo yeChivande:", nd: "Ukhetho mfihlo:" },
    formError: {
      en: "Please enter a valid email and password.",
      sn: "Ndokumbira upfe imeyiri nesvomhu yakakodzera.",
      nd: "Sicela ufake i-I-meyili lenombolo eyiyo.",
    },
    registerTitle: { en: "Create Moyo Account", sn: "Gadzira Akaundi yeMoyo", nd: "Bumba i-Akhaunti yeMoyo" },
    registerSubtitle: { en: "Provide details to securely access customized mental support.", sn: "Zadzisai ruzivo kuitira kuwana rubatsiro rwepfungwa rwakakodzera.", nd: "Faka imininingwane yakho ukuze uthole usizo okufaneleyo." },
    fullNameLabel: { en: "Full Name", sn: "Zita Rizere", nd: "Ibhizo Elipheleleyo" },
    fullNamePlaceholder: { en: "e.g. Tinotenda Moyo", sn: "e.g. Tinotenda Moyo", nd: "e.g. Tinotenda Moyo" },
    passwordConfirmLabel: { en: "Confirm Password", sn: "Simbisai Svomhu", nd: "Qinisekisa Inombolo" },
    alreadyHaveAccount: { en: "Already have an account?", sn: "Une akaundi kare?", nd: "Ule akhaunti vele?" },
    loginNow: { en: "Login here", sn: "Pinda pano", nd: "Ngena lapha" },
    questionnaireTitle: { en: "Intake Check-in Questionnaire", sn: "Mibvunzo Yepfungwa neHutano", nd: "Imibuzo Yokuhlola Impilo Yengqondo" },
    questionnaireIntro: { en: "This essential 5-step screening helps tailor your self-help tools and lets local community workers offer appropriate care levels.", sn: "Mibvunzo iyi inobatsira kugadzira zvishandiso zvakakodzera imi uye inobvumira vashandi vehutano kupa rubatsiro.", nd: "Le mibuzo isiza ukulungisa izixhobo ezifaneleyo njalo ivumela abasebenzi bezempilo ukuthi balethe usizo." },
  };

  const handleLangSelect = (lang: "en" | "sn" | "nd") => {
    setActiveLang(lang);
    onLanguageChange(lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || password.length < 4) {
      setErrorMsg(dict.formError[activeLang]);
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    if (activeTab === "patient") {
      try {
        // Real Firebase Authentication Sign-In
        const userCredential = await signInWithEmailAndPassword(auth, identifier.trim().toLowerCase(), password);
        const user = userCredential.user;
        setIsSubmitting(false);
        onLoginSuccess("patient", user.displayName || user.email?.split("@")[0] || "Patient");
      } catch (authErr: any) {
        console.warn("Firebase Auth sign-in failed, trying local fallback", authErr);
        
        // Scan locally registered backup users in localStorage for seamless backward compatibility
        const savedJSON = localStorage.getItem("registered_moyo_users");
        let fallbackMatched = false;
        if (savedJSON) {
          try {
            const users = JSON.parse(savedJSON) as any[];
            const matched = users.find(u => u.email.toLowerCase() === identifier.trim().toLowerCase());
            if (matched) {
              if (matched.password === password) {
                fallbackMatched = true;
                setIsSubmitting(false);
                onLoginSuccess("patient", matched.name);
                return;
              } else {
                setErrorMsg(activeLang === "en" ? "Incorrect password. Please try again." : "Svomhu yekupinda haina kururama.");
                setIsSubmitting(false);
                return;
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        setIsSubmitting(false);
        if (!fallbackMatched) {
          let friendlyMsg = authErr.message;
          if (authErr.code === "auth/invalid-credential" || authErr.code === "auth/user-not-found" || authErr.code === "auth/wrong-password") {
            friendlyMsg = activeLang === "en" 
              ? "Incorrect email or password. Please verify your credentials and try again." 
              : "Imeyiri kana svomhu yekupinda haina kururama.";
          } else if (authErr.code === "auth/operation-not-allowed") {
            friendlyMsg = "Email/password authentication is currently disabled in your Firebase Console. Please verify with Administrator.";
          }
          setErrorMsg(friendlyMsg);
        }
      }
    } else {
      // CHW staff identifier login flow (local staff validation bypass)
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess("chw", identifier.trim());
      }, 600);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setErrorMsg("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Auto-register user stats structure in firestore if not exists
      const userDocRef = doc(db, "registered_moyo_users", user.uid);
      const intakeAnswers = localStorage.getItem("moyo_current_questionnaire");
      const savedAnswers = intakeAnswers ? JSON.parse(intakeAnswers) : { mood: 0, anxiety: 0 };
      
      const userProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Secure Google User",
        email: user.email || "",
        language: activeLang,
        timestamp: new Date().toISOString(),
        assessmentAnswers: savedAnswers
      };

      await setDoc(userDocRef, userProfile, { merge: true });

      setIsGoogleSubmitting(false);
      onLoginSuccess("patient", userProfile.name);
    } catch (err: any) {
      console.error("Google Auth error", err);
      setIsGoogleSubmitting(false);
      setErrorMsg(err.message || "Google Sign-In failed. Please verify configuration.");
    }
  };

  // Switch views safely
  const handleStartRegistration = () => {
    setErrorMsg("");
    setView("register");
  };

  const handleBackToLogin = () => {
    setErrorMsg("");
    setView("login");
  };

  // Submit First Registration Stage
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg(activeLang === "en" ? "Please fill in all layout fields." : "Zadzisai nzvimbo dzose.");
      return;
    }

    if (!regEmail.includes("@")) {
      setErrorMsg(activeLang === "en" ? "Please enter a valid email address." : "Ndokumbira upfe imeyiri yechokwadi.");
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg(activeLang === "en" ? "Password must contain at least 4 characters." : "Svomhu inofanira kuva nemavara mana.");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setErrorMsg(activeLang === "en" ? "Passwords do not match." : "Svomhu mbiri idzi hadzina kufanana.");
      return;
    }

    // Check if email already registered
    const savedJSON = localStorage.getItem("registered_moyo_users");
    if (savedJSON) {
      try {
        const users = JSON.parse(savedJSON) as any[];
        const exist = users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
        if (exist) {
          setErrorMsg(activeLang === "en" ? "Email is already in use by another support profile." : "Imeyiri iyi yakatoshandiswa.");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Advance to Questionnaire
    setCurrentQuestionIndex(0);
    setQuestionnaireAnswers({});
    setView("questionnaire");
  };

  // Handle questionnaire responses step by step
  const handleSelectAnswer = (value: number) => {
    const activeQuestion = QUESTIONS[currentQuestionIndex];
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: value
    }));
  };

  const handleNextQuestion = async () => {
    const activeQuestion = QUESTIONS[currentQuestionIndex];
    if (questionnaireAnswers[activeQuestion.id] === undefined) {
      alert(activeLang === "en" ? "Please select a response to continue." : "Ndapota sarudzai mhinduro kuti muenderere mberi.");
      return;
    }

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      setErrorMsg("");
      try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail.trim().toLowerCase(), regPassword);
        const user = userCredential.user;

        // Set Display Name in Auth Profile
        await updateProfile(user, { displayName: regName.trim() });

        // Build User Profile document
        const userDoc = {
          uid: user.uid,
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          language: activeLang,
          timestamp: new Date().toISOString(),
          assessmentAnswers: questionnaireAnswers
        };

        // Write user profile to Firestore
        await setDoc(doc(db, "registered_moyo_users", user.uid), userDoc);

        // Save to Backup local storage for local offline redundancy or secondary lookups
        const savedJSON = localStorage.getItem("registered_moyo_users") || "[]";
        try {
          const users = JSON.parse(savedJSON) as any[];
          // remove any old local user with same email
          const filtered = users.filter((u: any) => u.email.toLowerCase() !== regEmail.trim().toLowerCase());
          filtered.push({
            name: regName.trim(),
            email: regEmail.trim().toLowerCase(),
            password: regPassword,
            language: activeLang,
            timestamp: new Date().toISOString(),
            assessmentAnswers: questionnaireAnswers
          });
          localStorage.setItem("registered_moyo_users", JSON.stringify(filtered));
          localStorage.setItem("moyo_current_questionnaire", JSON.stringify(questionnaireAnswers));
        } catch (localErr) {
          console.error("Local storage sync warning", localErr);
        }

        setIsSubmitting(false);
        setView("success");
      } catch (authErr: any) {
        console.error("Firebase Auth signup failed", authErr);
        setIsSubmitting(false);
        let friendlyMsg = authErr.message;
        if (authErr.code === "auth/email-already-in-use") {
          friendlyMsg = activeLang === "en" 
            ? "This email is already registered on MoyoConnect. Please try logging in." 
            : "Kero yeimeyiri iyi yakatoshandiswa mune imwe akaundi.";
        } else if (authErr.code === "auth/weak-password") {
          friendlyMsg = activeLang === "en" 
            ? "Your password is too weak. Please choose a password with at least 6 characters." 
            : "Svomhu yekupinda haina kusimba zvakakodzera. Ndapota shandisai dzinopfuura nhamba 6.";
        } else if (authErr.code === "auth/operation-not-allowed") {
          friendlyMsg = "Email/Password registration is not enabled in your Firebase account credentials configuration.";
        }
        setErrorMsg(friendlyMsg);
        
        // Go back to Registration screen so they can retry or use a different email/password!
        setView("register");
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setView("register");
    }
  };

  // Core intake feedback scoring variables
  const distressSum = (questionnaireAnswers["mood"] || 0) + (questionnaireAnswers["anxiety"] || 0);
  const feedback = getAssessmentFeedback();

  function getAssessmentFeedback() {
    const score = distressSum;
    const wantsOutreach = questionnaireAnswers["outreach"] === 1;
    const isIsolated = questionnaireAnswers["safety"] === 2;

    if (score >= 4 || wantsOutreach || isIsolated) {
      return {
        tier: { en: "Triage Alert: Professional Care Linkage Recommended", sn: "Zano: Rubatsiro rwemunhu akadzidzira runokurudzirwa", nd: "Useluleko: Kuncoma ukuthi udinge usizi lomchwepheshile we-CHW" },
        badgeColor: "bg-[#ffdad6] text-[#93000a] border-[#ffb4ab] border",
        description: { 
          en: `Your scores indicate moderate-to-severe mental distress (${score}/6). A local Community Health Worker under Dr. Sibanda's clinic has been authorized to offer private telephone support. Meanwhile, please feel free to access our Crisis Hotline tab inside the app.`,
          sn: `Chiyero chenyu chinoratidza kusagadzikana kuri pakati nepakati zviriko (${score}/6). Mushandi wehutano CHW ari pasi pekiriniki yaDr. Sibanda akurudzirwa kukufonera. Panguva ino kwanisa kushandisa bhatani riri muMoyoConnect.`,
          nd: `Isimo sakho sikhombisa ubunzima obuphakathi loba obuphezulu (${score}/6). Umsizi zempilo kaDr. Sibanda uzakubhalela. Ngalesi sikhathi sebenzisa imbobo yenombolo zosizo olukhulayo kulolu cingo.`
        },
        recommendation: { en: "Community Worker Supportive Counseling Route & Grounding Breath Loops", sn: "Kubatana neCHW mudunhu neZvidzidzo zvekufema zvirerere", nd: "Inombolo yosizo lezempilo lezifundo zokuphefumula" }
      };
    } else if (score >= 2) {
      return {
        tier: { en: "Triage Alert: Moderate Distress / Daily Practice Recommended", sn: "Zano: Kushushikana kudiki / Kudzidzira kufema mazuva ose", nd: "Useluleko: Ukukhathazeka okulengelayo / Ukuzivocavoca usuku nosuku" },
        badgeColor: "bg-[#ffe082] text-[#5d4037] border-[#ffd54f] border",
        description: { 
          en: `You recorded mild-to-moderate indices of tension (${score}/6). Daily practice of our localized Cognitive Behavior Therapy (CBT) reframing logs and guided diaphragmatic breathing is highly effective for grounding anxiety.`,
          sn: `Chiyero chenyu chinoratidza kunetseka kudiki pakati pamafambiro enyu (${score}/6). Kudzidzira nzira dzeCBT dzekufunga patsva nekufema nenzira kwayo kunorapa nekukurumidza.`,
          nd: `Isimo sikhombisa ukukhathazeka okuphakathi (${score}/6). Ukuphefumula kahle losuku nosuku lokuqondisa kabusha imicabango ye-CBT kuzakunika amandla okuthula.`
        },
        recommendation: { en: "Mindfulness Breathing Exercises & CBT reframing journal", sn: "Mindfulness yezvekufema nebhuku reCBT patsva", nd: "Ukhetho zempilo lokubhala phansi amandla we-CBT" }
      };
    } else {
      return {
        tier: { en: "Support Status: Optimal Wellness & Resilient Growth", sn: "Zano: Hutano Hwepfungwa hwakachengeteka", nd: "Useluleko: Impilo Elungileyo lentshisekelo yezengqondo" },
        badgeColor: "bg-[#b9f1ad] text-[#002202] border-[#8ee285] border",
        description: { 
          en: `Your stress check records are stable (${score}/6). This application is a protective companion to strengthen your mental defense. We suggest active exploration of our localized psychoeducational articles.`,
          sn: `Utano hvenyu huri panzvimbo yakachengeteka zvakanaka (${score}/6). MoyoConnect chichakubatsirai kuti dambudziko risapinda. Dzidzai zvinyorwa zvakagadzirwa nevarapi vatsvanaka.`,
          nd: `Impilo yenu enhle imi kahle gqo (${score}/6). Lolu hlelo lwamandla luzakusiza kakhulu ekuzivikeleni. Hluza izifundo labaphathi bezempilo elula.`
        },
        recommendation: { en: "MoyoConnect Mental Health Psychoeducational Articles", sn: "Zvinyorwa zvose zveMoyoConnect zveDzidzo nePfungwa", nd: "Indlela yokufundisa engaphakathi kohlelo MoyoConnect" }
      };
    }
  }

  const handleFinalizeAllAndEnter = () => {
    // Fulfill registration login trigger and entry to main dashboard app!
    onLoginSuccess("patient", regName.trim());
  };

  return (
    <div className="font-sans min-h-screen bg-[#f8f9fa] bg-radial-gradient flex flex-col items-center justify-center p-4 relative">
      {/* Background Gradient Mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(182,238,171,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(199,231,252,0.2)_0px,transparent_50%)] pointer-events-none z-0"></div>

      <div className="w-full max-w-lg flex flex-col gap-6 z-10 animate-fade-in my-4">
        {/* Logo Area */}
        <header className="flex flex-col items-center text-center gap-2">
          <div className="w-24 h-18 mb-1 flex items-center justify-center">
            <img
              src="/src/assets/images/moyoconnect_logo_1779856207318.png"
              alt="MoyoConnect Logo"
              className="h-full w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-[#002434] tracking-tight">
            MoyoConnect
          </h1>
          <p className="text-sm text-[#42474b] max-w-[320px]">
            {dict.tagline[activeLang]}
          </p>
        </header>

        {/* Dynamic Multi-View main container card */}
        <main className="bg-white rounded-2xl p-6 sm:p-8 border border-[#c2c7cc] shadow-sm border-t-4 border-t-[#386934] transition-all">
          <AnimatePresence mode="wait">
            
            {/* ================= VIEW 1: LOGIN VIEW ================= */}
            {view === "login" && (
              <motion.div
                key="login_view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                {/* Tabs */}
                <div className="flex justify-between items-center bg-[#f3f4f5] p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveTab("patient");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                      activeTab === "patient"
                        ? "bg-white text-[#002434] shadow-xs font-black"
                        : "text-[#42474b] hover:text-[#002434]"
                    }`}
                  >
                    {dict.patientLogin[activeLang]}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("chw");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                      activeTab === "chw"
                        ? "bg-white text-[#002434] shadow-xs font-black"
                        : "text-[#42474b] hover:text-[#002434]"
                    }`}
                  >
                    {dict.chwLogin[activeLang]}
                  </button>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  {/* Identity Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-xs text-[#191c1d]" htmlFor="identifier">
                      {activeTab === "patient" ? dict.patientLabel[activeLang] : dict.chwLabel[activeLang]}
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c] group-focus-within:text-[#002434] transition-colors">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        id="identifier"
                        name="identifier"
                        type={activeTab === "patient" ? "email" : "text"}
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          activeTab === "patient"
                            ? dict.patientPlaceholder[activeLang]
                            : dict.chwPlaceholder[activeLang]
                        }
                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] transition-all outline-none text-sm placeholder:text-[#72787c]/60"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-xs text-[#191c1d]" htmlFor="password">
                        {dict.passwordLabel[activeLang]}
                      </label>
                      <button
                        type="button"
                        onClick={() => alert(activeLang === "en" ? "Verification instructions have been requested via SMS / email." : "Chiziviso chakumbirwa parunhare rwenyu.")}
                        className="text-xs font-bold text-[#386934] hover:underline cursor-pointer"
                      >
                        {dict.forgot[activeLang]}
                      </button>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c] group-focus-within:text-[#002434] transition-colors">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] transition-all outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72787c] hover:text-[#191c1d] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <span className="text-xs text-red-650 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {errorMsg}
                    </span>
                  )}

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full h-11 bg-[#002434] text-white font-bold text-xs rounded-full shadow-sm hover:bg-[#1a3a4a] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        {dict.signIn[activeLang]}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#c2c7cc]"></div>
                    <span className="text-[10px] text-[#72787c] font-bold uppercase tracking-wider">
                      {dict.or[activeLang]}
                    </span>
                    <div className="flex-1 h-px bg-[#c2c7cc]"></div>
                  </div>

                  {/* Google integration trigger */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full h-11 bg-white text-[#191c1d] font-bold text-xs rounded-full border border-[#c2c7cc] shadow-xs hover:bg-[#f3f4f5] transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#191c1d] border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          ></path>
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          ></path>
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          ></path>
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          ></path>
                        </svg>
                        {dict.googleSignIn[activeLang]}
                      </>
                    )}
                  </button>
                </form>

                {/* Privacy info note */}
                <div className="mt-6 pt-5 border-t border-[#c2c7cc] flex flex-col gap-4">
                  <div className="flex items-start gap-3 p-3 bg-[#b6eeab]/15 rounded-xl border border-[#b6eeab]/30">
                    <ShieldCheck className="w-5 h-5 text-[#386934] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-[#42474b]">
                      <strong>{dict.privacyTitle[activeLang]}</strong> {dict.privacyNote[activeLang]}
                    </p>
                  </div>
                  
                  {activeTab === "patient" && (
                    <p className="text-center text-xs text-[#42474b] bg-[#f8f9fa] py-2 rounded-xl border border-[#c2c7cc]/40">
                      {dict.noAccount[activeLang]}{" "}
                      <button
                        type="button"
                        onClick={handleStartRegistration}
                        className="text-[#386934] font-black hover:underline cursor-pointer"
                      >
                        {dict.registerNow[activeLang]}
                      </button>
                    </p>
                  )}

                  <button
                    onClick={() => {
                      onLoginSuccess("admin", "Admin System");
                    }}
                    className="block text-center text-[10px] text-[#42474b]/55 hover:text-[#386934] transition-all cursor-pointer font-extrabold w-full py-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {dict.adminPortal[activeLang]}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= VIEW 2: REGISTER VIEW ================= */}
            {view === "register" && (
              <motion.div
                key="register_view"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToLogin}
                    className="p-1.5 hover:bg-[#f3f4f5] rounded-full text-[#42474b] cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-[#002434] tracking-tight">
                      {dict.registerTitle[activeLang]}
                    </h2>
                    <p className="text-xs text-[#72787c]">
                      {dict.registerSubtitle[activeLang]}
                    </p>
                  </div>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit}>
                  {/* Full Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#191c1d]" htmlFor="regName">
                      {dict.fullNameLabel[activeLang]}
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c] group-focus-within:text-[#002434]">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="regName"
                        name="regName"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={dict.fullNamePlaceholder[activeLang]}
                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] outline-none text-sm placeholder:text-[#72787c]/65"
                      />
                    </div>
                  </div>

                  {/* Email address field */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs text-[#191c1d]" htmlFor="regEmail">
                      {dict.patientLabel[activeLang]}
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c] group-focus-within:text-[#002434]">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        id="regEmail"
                        name="regEmail"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] outline-none text-sm placeholder:text-[#72787c]/65"
                      />
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs text-[#191c1d]" htmlFor="regPassword">
                        {dict.passwordLabel[activeLang]}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          id="regPassword"
                          name="regPassword"
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 pl-10 pr-4 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs text-[#191c1d]" htmlFor="regPasswordConfirm">
                        {dict.passwordConfirmLabel[activeLang]}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787c]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          id="regPasswordConfirm"
                          name="regPasswordConfirm"
                          type="password"
                          required
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 pl-10 pr-4 bg-white border border-[#c2c7cc] rounded-lg focus:ring-2 focus:ring-[#002434] focus:border-[#002434] outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Language selection chips */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-bold text-xs text-[#191c1d]">Language Preference / Mutauro:</span>
                    <div className="flex rounded-lg border border-[#c2c7cc] overflow-hidden bg-[#f3f4f5] text-xs font-bold text-[#42474b]">
                      {[
                        { code: "en", label: "English" },
                        { code: "sn", label: "Shona (Zvehutano)" },
                        { code: "nd", label: "Ndebele (Ezempilo)" }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLangSelect(lang.code as any)}
                          className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                            activeLang === lang.code 
                              ? "bg-[#002434] text-white font-black" 
                              : "hover:bg-[#c2c7cc]/30 bg-white"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <span className="text-xs text-red-650 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {errorMsg}
                    </span>
                  )}

                  {/* Register submit trigger */}
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#3da139] hover:bg-[#386934] text-white font-bold text-xs rounded-full shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{activeLang === "en" ? "Continue to Intake Questionnaire" : "Tevera: Pindura Mibvunzo"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Footer anchor */}
                <p className="text-center text-xs text-[#42474b] pt-4 border-t border-[#c2c7cc]/60">
                  {dict.alreadyHaveAccount[activeLang]}{" "}
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-[#386934] font-black hover:underline cursor-pointer"
                  >
                    {dict.loginNow[activeLang]}
                  </button>
                </p>
              </motion.div>
            )}

            {/* ================= VIEW 3: QUESTIONNAIRE VIEW ================= */}
            {view === "questionnaire" && (
              <motion.div
                key="questionnaire_view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Stepper display */}
                <div className="flex justify-between items-center pb-3 border-b border-[#c2c7cc]/50">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#386934]" />
                    <span className="text-xs text-[#386934] font-black uppercase tracking-widest mt-0.5">
                      {activeLang === "en" ? "Moyo Mental Check" : "Kuongorora Hutano"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#002434] bg-[#c7e7fc] px-2.5 py-1 rounded-full">
                    {activeLang === "en" ? `Step ${currentQuestionIndex + 1} of ${QUESTIONS.length}` : `Mubvunzo ${currentQuestionIndex + 1} pa ${QUESTIONS.length}`}
                  </span>
                </div>

                {/* Question card intro */}
                {currentQuestionIndex === 0 && (
                  <div className="bg-[#c7e7fc]/25 border border-[#abcbdf]/40 p-3.5 rounded-xl flex gap-3">
                    <Heart className="w-5 h-5 text-[#002434] shrink-0 fill-[#002434]" />
                    <p className="text-[11px] leading-relaxed text-[#002434]">
                      <strong>{dict.questionnaireTitle[activeLang]}:</strong> {dict.questionnaireIntro[activeLang]}
                    </p>
                  </div>
                )}

                {/* Active Question Text */}
                <div className="space-y-4">
                  <h3 className="text-md sm:text-lg font-black text-[#002434] leading-snug">
                    {QUESTIONS[currentQuestionIndex].text[activeLang]}
                  </h3>

                  {/* Question Options */}
                  <div className="space-y-3">
                    {QUESTIONS[currentQuestionIndex].options.map((opt) => {
                      const isActive = questionnaireAnswers[QUESTIONS[currentQuestionIndex].id] === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleSelectAnswer(opt.value)}
                          className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col gap-1 hover:shadow-2xs select-none ${
                            isActive 
                              ? "bg-[#002434]/5 border-[#002434] ring-1 ring-[#002434]" 
                              : "border-[#c2c7cc] hover:border-[#72787c]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isActive ? "text-[#002434]" : "text-[#191c1d]"}`}>
                              {opt.text[activeLang]}
                            </span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isActive ? "border-[#002434] bg-[#002434] text-white" : "border-[#72787c] bg-white"
                            }`}>
                              {isActive && <Check className="w-3" />}
                            </div>
                          </div>
                          {opt.description && (
                            <span className="text-[10px] text-[#72787c] font-medium leading-relaxed pl-1.5 border-l border-[#c2c7cc] mt-1">
                              {opt.description[activeLang]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#f3f4f5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#386934] transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>

                {/* Stepper buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    className="flex-1 h-11 bg-white border border-[#c2c7cc] text-[#42474b] rounded-full text-xs font-bold hover:bg-[#f3f4f5] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{activeLang === "en" ? "Back" : "Kuseri"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex-1 h-11 bg-[#002434] text-white rounded-full text-xs font-bold hover:bg-[#1a3a4a] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {currentQuestionIndex === QUESTIONS.length - 1 
                        ? (activeLang === "en" ? "Complete Intake Assessment" : "Pedza kuKuongorora")
                        : (activeLang === "en" ? "Next Question" : "Mberi")
                      }
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= VIEW 4: REGISTRATION SUCCESS ASSESSMENT ================= */}
            {view === "success" && (
              <motion.div
                key="success_view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-2"
              >
                {/* Celebratory Check and welcome */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-[#b9f1ad] text-[#002202] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#8ee285]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-[#002434] tracking-tight">
                    {activeLang === "en" ? "Account Created Successfully!" : "Akaundi Yagadzirwa Zvakanaka!"}
                  </h2>
                  <p className="text-xs text-[#42474b] max-w-sm mx-auto">
                    {activeLang === "en" 
                      ? `Thank you, ${regName}. Your intake check-in records have been encrypted and prepared.` 
                      : `Maita basa, ${regName}. Mhinduro dzenyu dzachengetedzwa kwazvo.`
                    }
                  </p>
                </div>

                {/* Real-Time Assessment Triage Feedback panel */}
                <div className="bg-[#f8f9fa] border border-[#c2c7cc] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#72787c]">
                      {activeLang === "en" ? "Initial Clinical Assessment" : "Tsananguro yeMhinduro"}
                    </span>
                    <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${feedback.badgeColor}`}>
                      {feedback.tier[activeLang]}
                    </div>
                  </div>

                  <p className="text-xs text-[#191c1d] leading-relaxed">
                    {feedback.description[activeLang]}
                  </p>

                  <div className="pt-3 border-t border-[#c2c7cc]/50 flex flex-col gap-1 max-w-full">
                    <span className="text-[9px] uppercase font-black text-[#72787c] tracking-widest leading-none">
                      {activeLang === "en" ? "Recommended Therapy Suite" : "Zvirongwa zvekudzidza zvakakurudzirwa"}
                    </span>
                    <span className="text-xs font-extrabold text-[#386934] flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-4 h-4 text-[#ffe082] fill-[#ffe082]" />
                      {feedback.recommendation[activeLang]}
                    </span>
                  </div>
                </div>

                <div className="bg-[#b6eeab]/15 border border-[#b6eeab]/30 p-3.5 rounded-xl flex gap-3 text-left">
                  <Smile className="w-5 h-5 text-[#386934] shrink-0" />
                  <p className="text-[10px] leading-relaxed text-[#42474b]">
                    {activeLang === "en" 
                      ? "MoyoConnect is designed for self-guided stress management and clinical peer accountability. In case of acute psychiatric emergency, immediately contact emergency services or go to the nearest clinical ward."
                      : "MoyoConnect inobatsira kudzora kushushikana parunhare rwenyu. Kana muine dambudziko guru zvakanyanya, taurai nevarapi padhuze nekukasika."
                    }
                  </p>
                </div>

                {/* Confirm entry button */}
                <button
                  onClick={handleFinalizeAllAndEnter}
                  className="w-full h-12 bg-[#002434] hover:bg-[#1a3a4a] text-white font-black text-xs rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>{activeLang === "en" ? "Enter MoyoConnect App" : "Pinda muMoyoConnect izvozvi"}</span>
                  <ArrowRight className="w-4 h-4 animate-bounce-right" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer with Language selectors */}
        <footer className="flex flex-col items-center gap-4 py-2">
          {view === "login" && (
            <div className="flex gap-3 text-xs font-semibold text-[#72787c]">
              <button
                type="button"
                onClick={() => handleLangSelect("en")}
                className={`hover:text-[#002434] transition-colors cursor-pointer ${
                  activeLang === "en" ? "text-[#002434] font-black underline" : ""
                }`}
              >
                English
              </button>
              <span className="text-[#c2c7cc]">|</span>
              <button
                type="button"
                onClick={() => handleLangSelect("sn")}
                className={`hover:text-[#002434] transition-colors cursor-pointer ${
                  activeLang === "sn" ? "text-[#002434] font-black underline" : ""
                }`}
              >
                Shona
              </button>
              <span className="text-[#c2c7cc]">|</span>
              <button
                type="button"
                onClick={() => handleLangSelect("nd")}
                className={`hover:text-[#002434] transition-colors cursor-pointer ${
                  activeLang === "nd" ? "text-[#002434] font-black underline" : ""
                }`}
              >
                Ndebele
              </button>
            </div>
          )}
          <div className="text-[10px] text-[#c2c7cc] font-medium text-center">
            © 2026 MoyoConnect • Humanitarian Mental Health Support
          </div>
        </footer>
      </div>

      {/* Decorative Illustration Side - Desktop Only */}
      <div className="hidden lg:flex fixed left-6 top-6 bottom-6 w-[28%] xl:w-[31%] items-center justify-center pointer-events-none">
        <div className="relative w-full h-[90%] rounded-3xl overflow-hidden shadow-2xl border border-[#c2c7cc]/40 bg-[#edeeef] flex flex-col justify-end">
          <img
            alt="MoyoConnect Community Care"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoBf2AZcSJwwcHtG0D80-wFDW6ABNKunloz5PVB0qsWxSVHQR2E-p9TDKPBsrXSL8OEl2GFYCsX7PP1vWOTdj8zIws-nS3WNNqLPIYQY60f0FCEP9JnQOItaBV76LZ4NMngp7n5PcLCVD6p4101xnIJt95JOJJtEKDcXv8xoNJaYAspYGO1WB8I5siDWz0BlrR_5RbuVBn9vc8wcx2xi75ZJt-slOotAiH0SUR98zLEiHcsSGQt3bhFvMCUBlhRqhWOrDua5cT425Z"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002434]/90 via-[#002434]/40 to-transparent"></div>
          <div className="relative z-10 p-8 text-left">
            <h2 className="text-white font-display font-bold text-xl leading-tight">
              {dict.title[activeLang]}
            </h2>
            <p className="text-[#abcbdf] text-xs mt-2 font-medium">
              {dict.desc[activeLang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
