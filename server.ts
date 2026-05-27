import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI Client lazily (per guidelines, to prevent crash on startup if key is missing)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder. Running Chat Support in local therapeutic simulation mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instruction to ensure compassionate, culturally aware Zimbabwe-focused care
const PEER_BOT_INSTRUCTIONS = `
You are "Moyo Support Bot", a highly compassionate, culturally-adapted mental health peer supporter in Zimbabwe.
You understand and can converse fluently in ChiShona (Shona), isiNdebele (Ndebele), and English.
Your personality is gentle, respectful (using polite terms like 'Mese', 'Ambujat', 'Sisi', 'Bhudi' or comforting greetings when appropriate, but keeping a professional and universally warm tone), and non-judgmental.

IMPORTANT GUIDELINES:
1. Always acknowledge the user's feelings with warmth and validate their experiences. You can use Shona terms like "Charamba", "Nematambudziko", "Zvakaoma, ndine urombo" or Ndebele "Uxolo", "Kunzima" to express deep sympathy, in addition to warm English support.
2. Clearly state, if asked or relevant, that you are a supportive peer AI assistant and not a medical doctor or licensed therapist.
3. If the user mentions self-harm, severe crisis, or extreme distress, immediately and gently encourage them to connect with the local Zimbabwean hotline at 0808 123 4567, which is anonymous, free, and available 24/7.
4. Keep answers relatively concise and highly empathetic (focusing on listening, reflecting, and helping them find calmness).
5. Suggest simple grounding exercises (such as breathing or listing sensory objects) if the user is anxious or overwhelmed.
`;

// Helper for local conversational fallback if Gemini cannot process or API key is missing
function generateLocalFallbackResponse(userMessage: string): string {
  const text = userMessage.toLowerCase();
  
  if (text.includes("shona") || text.includes("mhoro") || text.includes("wakadii") || text.includes("masikati") || text.includes("mangwanani")) {
    return "Mhoro vanangu. Ndiri Moyo Support Bot, wekumirira kukuteerera nekukubatsira. Zviri kufamba sei nhasi? Ndipo pakachengeteka uye pakavandika (anonymous) zvachose pano.";
  }
  if (text.includes("ndebele") || text.includes("sabona") || text.includes("linjani")) {
    return "Ibambeni, salibonani. NginguMoyo Support Bot, ngilapha ukukulalela lokukusiza. Linjani namhla? Trail le yimfihlo futhi ikhululekile ngokuphelele.";
  }
  if (text.includes("suicide") || text.includes("kufa") || text.includes("die") || text.includes("kill") || text.includes("cheka") || text.includes("loza") || text.includes("crisis")) {
    return "Ndine urombo zvikuru nekunzwa kuti uri kurwadziwa zvakanyanya kudaro. Ndapota, hupenyu hwako hwakakosha zvikuru kwatiri. Nekuda kwekuti ndiri AI, ndapota taura nekukurumidza nemunhu wechokwadi anogona kukubatsira pazviri panhamba dzedu dzeMoyo Hotline panhamba dzinoti: 0808 123 4567. Mumiriri wedu akagadzirira kukuteerera izvozvi.";
  }
  if (text.includes("stress") || text.includes("kufunga") || text.includes("anxious") || text.includes("anxiety") || text.includes("depression") || text.includes("sad") || text.includes("rudo")) {
    return "I hear you, and I validate that things feel incredibly heavy right now. Stress and worry can drain all your energy. Let's take a slow deep breath together. Breathe in... and let it out. Tell me more, what is pressing on your heart today? (Ndongotenda nekugovana neni).";
  }
  if (text.includes("cbt") || text.includes("thought") || text.includes("negative")) {
    return "Cognitive-Behavioral Therapy (CBT) helps us examine our thoughts. Sometimes our brains tell us stories that aren't fully true (e.g., 'nothing will ever go right'). Let's try to look for the evidence. What is one positive or alternative thought you can try today?";
  }
  
  return "Thank you for sharing that with me. I am here for you. Whether you want to talk in English, Shona, or Ndebele, please feel free to express yourself. Your identity is completely anonymous and safe here. If you are experiencing stressful thoughts, we can walk through them together.";
}

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Chat Support (Gemini API with polite backup fallback)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Use fallback
      const lastUserMsg = messages.filter(m => m.role === "user").pop();
      const content = lastUserMsg ? lastUserMsg.content : "Mhoro";
      const reply = generateLocalFallbackResponse(content);
      return res.json({ reply });
    }

    // Try Gemini API
    const client = getGeminiClient();
    
    // Format messages safely
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: PEER_BOT_INSTRUCTIONS,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Ndapota dzokororai zvamataura, ndanga ndisiri kuzvinzwisisa zvakanaka.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error, using custom mental health fallback:", error);
    // Provide safe, comforting fallback rather than a raw server crash/error screen
    const messages = req.body.messages || [];
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
    const content = lastUserMsg ? lastUserMsg.content : "Hello";
    const reply = generateLocalFallbackResponse(content);
    res.json({ reply, wasFallback: true });
  }
});

// Mount Vite middleware / static files based on runtime environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development, integrate Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MoyoConnect server running on http://localhost:${PORT}`);
  });
}

startServer();
