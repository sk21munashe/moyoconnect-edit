export type Screen = "home" | "modules" | "support" | "impact";

export type ActiveModule = "none" | "screening" | "journaling" | "chat" | "psychoed" | "cbt";

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  mood: string;       // e.g. "😀 Joyful/Kufara", "😔 Sad/Kusuwa", "😰 Anxious/Kutya", "😠 Angry/Kutsamwa", "🌱 Calm/Kugadzikana"
  thoughts: string;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ScreenerQuestion {
  id: string;
  text: string;
  shonaText: string;
  ndebeleText: string;
}

export interface ScreenerResult {
  score: number;
  level: "Mild" | "Moderate" | "Severe";
  colorClass: string;
  bgClass: string;
  borderClass: string;
  advice: string;
  shonaAdvice: string;
  ndebeleAdvice: string;
}

export interface PsychoedArticle {
  id: string;
  title: string;
  shonaTitle: string;
  ndebeleTitle: string;
  category: "Anxiety" | "Depression" | "Stress" | "Wellness";
  summary: string;
  englishContent: string[];
  shonaContent: string[];
  ndebeleContent: string[];
}

export interface CBTThoughtRecord {
  id: string;
  date: string;
  situation: string;       // What triggered the emotion?
  automaticThought: string; // What went through your mind?
  subconsciousNegative: string; // What story are you telling yourself?
  evidenceFor: string;     // Support for thought
  evidenceAgainst: string; // Alternative explanations
  balancedThought: string; // A more grounded alternative perspective
  preMoodRating: number;   // 0-100% distress initially
  postMoodRating: number;  // 0-100% distress afterward
}
