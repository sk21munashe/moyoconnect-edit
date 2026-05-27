import React, { useState, useEffect } from "react";
import { PsychoedArticle } from "../types";
import { 
  BookOpen, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  Smile, 
  Heart, 
  ThumbsUp, 
  HelpCircle,
  Play,
  Pause,
  Volume2,
  FileText,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const ARTICLES: PsychoedArticle[] = [
  {
    id: "art1",
    title: "Understanding 'Kufungisisa' (Thinking Too Much)",
    shonaTitle: "Kununura 'Kufungisisa' mupfungwa dzenyu",
    ndebeleTitle: "Ukuzwisisa 'Kufungisisa' emoyeni wethu",
    category: "Anxiety",
    summary: "In Zimbabwe, we often say we are 'thinking too much'. Learn about this idiom of distress and practical ways to claim back your mental peace.",
    englishContent: [
      "In Shona and Ndebele culture, the term 'Kufungisisa' translates literally to 'thinking too much'. Clinicians and researchers recognize it as a powerful cultural idiom representing a blend of anxiety, heavy worry, and depression.",
      "Kufungisisa is not just a mental state; it often expresses itself in physical ways, like headaches, fatigue, and a heavy feeling in the chest.",
      "To address Kufungisisa, we must gently shift our relationship with our thoughts. Practicing immediate grounding (stopping to listen to five things around you) and sharing anonymously in peer support chats are excellent starting points to feel less isolated."
    ],
    shonaContent: [
      "MuZimbabwe, tinowanzo shandisa izwi rekuti 'kufungisisa' kutsanangura kuremerwa nepfungwa neshungu. Iyi inzira yakajairika inoratidza kuzvidya mwoyo nekuremerwa muupenyu.",
      "Kufungisisa hakusi kungonetsekana mupfungwa chete; kunogona kukonzera musoro, kuneta kwemuviri, uye mwoyo kurova zvakanyanya.",
      "Kuti tideredze kufungisisa, tinofanira kurerutsa mitoro nekutaura nevamwe. Kutora miniti imwe chete tichifema zvakaenzana nekunzwisisa kuti isu tine shamwari mupere dzedu dzinotiteerera kunobatsira kukunda dambudziko iri."
    ],
    ndebeleContent: [
      "Kuthi, thina emakhaya weZimbabwe, sijwayele ukuthi sithi 'ucabanga kakhulu' loba 'kufungisisa'. Leli ligama elisetshenziswa kakhulu elibonisa uvalo kanye lobuzima emoyeni.",
      "Kufungisisa kuletha imfudumalo emzimbeni njengekhanda elibuhlungu loba ukuzizwa udiniwe kakhulu kwasasa.",
      "Ukunciphisa lokhu, kuhle ukuthi siphungule imizwa yethu ngokubhala kumgwaliselo loba ngokuxoxa lendlu yethu yeMoyo peer support chat. Awuwedwa."
    ]
  },
  {
    id: "art2",
    title: "Grounding and Calming the Emotional Storm",
    shonaTitle: "Matanho ekunyararisa mhirizhonga yemudzimu",
    ndebeleTitle: "Isithembe sokuzisa ukuthula engqondweni",
    category: "Stress",
    summary: "Discover ancient and modern mindfulness breathing practices tailored to calm your rapid thoughts in moments of high anxiety.",
    englishContent: [
      "Mindfulness is the simple practice of being fully present in the current moment without judgment. It doesn't require separate skills; it belongs to everyone.",
      "Try the 5-4-3-2-1 Grounding Technique immediately if you feel an anxiety panic rising: Acknowledge 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings your attention out of your worrying head and back to earth.",
      "Pair this with 'Box Breathing': Breathe in slowly for 4 seconds, hold your breath for 4 seconds, exhale for 4 seconds, and wait for 4 seconds before inhaling again. Repeat this three times. This activates your body's parasympathetic nervous system to calm down your adrenaline."
    ],
    shonaContent: [
      "Rugare mupfungwa chiratidzo chekuve pano izvozvi pasina kutonga kana kuzvidya mwoyo zvakapfuura.",
      "Shandisai muitiro we 5-4-3-2-1 kana makanyanya kuzvidya mwoyo: Tarisai zvinhu zvitanhatu (5), tsvagai zvinguva zvina (4) zvamuri kubata, unzwai mitatu (3) yepedyo, nzwai miviri (2) yamuri kunhuwidza, uye batani imwe chete (1) yamunogona kuravira. Kunoderedza marwadzo mupfungwa zvakanyanya.",
      "Sanganisai izvi nekuFema Zvakadzama: Gadzirai masekonzi mana ekufema mukati, sekonzi mana mambomira, uye mana ekubudisa mweya. Zvakachengeteka uye zvinoita kuti mwoyo upore kurova kukuru."
    ],
    ndebeleContent: [
      "Ukuzola emoyeni kulayizira lokho engilakho namhla, kungenziwa kumbe kuzizwa ukhathele.",
      "Zama ukusebenzisa indlela ye 5-4-3-2-1 mhla ubona uvalo luphakama: Bona izinto eziyi-5, thinta ezi-4, zwa ezi-3, hogela ezi-2, nambitha eyi-1. Lokhu kuletha uvalo phansi ngokuphazima kweso.",
      "Ngeza ndawonye ngokudonsa umoya udonse ugcine phakathi ulandele isikhathi sebhokisi (Box Breathing) ukuze wehlise uvalo namhla."
    ]
  },
  {
    id: "art3",
    title: "Community Healing: The Power of Anxious Expression",
    shonaTitle: "Kupora Pamwe chete: Simba weKugovana",
    ndebeleTitle: "Ukuchaza kanye njalo: Ukusizakala ngeqembu",
    category: "Wellness",
    summary: "In our neighborhoods, healing happened on the bench. Explore how community care can uplift a heavy heart.",
    englishContent: [
      "Throughout history, we solved problems together. In Zimbabwe, the famous 'Friendship Bench' project proved that grandmothers sitting on wooden benches can provide effective, life-saving talk therapy.",
      "Talking to a peer is. It breaks down isolation. Real power comes when we stop carrying heavy bags in silence.",
      "anonymous spaces like MoyoConnect are digital benches. By writing in a journal or conversing with support bots, you take the first steps to healing. Your voice is valuable."
    ],
    shonaContent: [
      "Kubva kare, tanga tichigadzirisa matambudziko tese mumaruwa nemuMataundi. Chirongwa chinozivikanwa pasi rose che'Friendship Bench' chakaratidza kuti madzimai nevakuru vebhenji vanogona kupa ruyamuro rwakakura rwemupfungwa.",
      "Kutaura nemumwe munhu unyamunhu wechokwadi kunopesanisa pfungwa dzekuda kufa nekuve wega mumatambudziko.",
      "MoyoConnect ibhande rinoshandiswa se Friendship Bench pane mwana wese aremerwa. Zviri pano zvine tsvakiridzo nemhinduro dzakavanzika dzinoshanda."
    ],
    ndebeleContent: [
      "Kuhambisa phambili, singamalungu omphakathi alahla insizi ngokuxoxa ndawonye. I Friendship Bench yaZimbabwe ikhombise ukuthi ogogo bebekhulisa njengosizo olubonakalayo kakhulu.",
      "Ukuthetha lomunye umuntu wehlisa uvalo kuhlambulule emoyeni wethu wonke.",
      "Umklamo lo weMoyoConnect uyibhenji yedigital kuwo wonke muntu. Xoxa, bhala ukhululeke."
    ]
  }
];

function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
}

interface PsychoedProps {
  onBackToHome: () => void;
  onOpenScreener: () => void;
}

export default function Psychoed({ onBackToHome, onOpenScreener }: PsychoedProps) {
  const [lang, setLang] = useState<"en" | "sn" | "nd">(() => {
    return (localStorage.getItem("moyo_lang") as "en" | "sn" | "nd") || "en";
  });
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const [adminArticles, setAdminArticles] = useState<any[]>(() => {
    const saved = localStorage.getItem("moyo_admin_content");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        // Only load Published status nodes
        return parsed.filter((item: any) => item.status === "Published");
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    const path = "moyo_content";
    const q = query(collection(db, path), where("status", "==", "Published"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems: any[] = [];
      snapshot.forEach((docRef) => {
        dbItems.push(docRef.data());
      });

      // Get any local custom items that are Published
      const saved = localStorage.getItem("moyo_admin_content");
      let localPublished: any[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          localPublished = parsed.filter((item: any) => item.status === "Published");
        } catch (e) {
          console.error(e);
        }
      }

      // Merge local items with database query items, preventing duplicates
      const merged: any[] = [...dbItems];
      localPublished.forEach((localItem) => {
        const alreadyInDb = dbItems.some((dbItem) => dbItem.id === localItem.id);
        if (!alreadyInDb) {
          merged.unshift(localItem);
        }
      });

      setAdminArticles(merged);
    }, (error) => {
      console.error("Firebase load error in Psychoeducation module:", error);
    });

    return () => unsubscribe();
  }, []);

  const getTranslatedText = (key: string) => {
    const dict = {
      title: { en: "Culturally Adapted Psychoeducation", sn: "Dzidziso yeKupora kweKufungisisa", nd: "Izifundo zokuphiliswa kwengqondo" },
      subtitle: { en: "Understanding mental health in our local Shona, Ndebele, and English templates reduces anxiety. Read anonymously.", sn: "Inzwisisoi kugwinya kwepfungwa muchiShona, Ndebele, kana English pasina kutya. Verengai pano zvakavanzika zvachose.", nd: "Ukuzwisisa imizwa ngolimi lwethu lwesiNdebele, isiShona loba isiNgisi. Bala ukhululeke." },
      readMore: { en: "Read Article", sn: "Verenga Chinyorwa", nd: "Bala ugwadlo" },
      benchTitle: { en: "Moyo Digital Bench", sn: "Bhenji reRugare reMoyo", nd: "IBhenji yeMoyo" },
      benchText: { en: "Stressed right now? Get immediate support and feedback on your symptoms anonymously.", sn: "Wakanyanya kuremerwa pfungwa izvozvi? Tora ongororo unzwisise huremu hwazvo izvozvi zvakavanzika.", nd: "Uhlupheka namhla? Thatha ukuhlola kwethu okuyimfihlo ukuze uthole usizo." },
      btnAction: { en: "Take anonymous screening", sn: "Tora ongororo pfungwa", nd: "Thatha ukuhlola manga" },
      adminStaff: { en: "NGO Care Resource", sn: "Zvekubatsira kubva kuNGO", nd: "Usizo lwamalunga eNGO" }
    } as any;
    return dict[key]?.[lang] || dict[key]?.["en"] || "";
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-1">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="text-label-md text-moyo-muted flex items-center gap-1 hover:text-moyo-primary transition-colors cursor-pointer"
        >
          &larr; {lang === "en" ? "Back to Home" : "Dzokera"}
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

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-moyo-secondary">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === "en" ? "Wellness Knowledge Center" : "Gwaro reDzidziso"}
          </span>
        </div>
        <h2 className="text-2xl font-display font-bold text-moyo-primary mb-2">
          {getTranslatedText("title")}
        </h2>
        <p className="text-sm text-moyo-muted">
          {getTranslatedText("subtitle")}
        </p>
      </div>

      {/* Main Articles list */}
      <div className="space-y-4 mb-8">
        {(() => {
          // Map standard clinical articles
          const mappedStandard = ARTICLES.map((art) => ({
            ...art,
            isCustom: false,
            author: "Moyo Clinical Board",
            imageUrl: undefined
          }));

          // Translate UI language identifier to admin portal naming
          const mapLang = {
            en: "English",
            sn: "Shona",
            nd: "Ndebele"
          }[lang];

          // Map dynamic published admin articles matching language
          const mappedAdmin = adminArticles
            .filter((art) => art.language === mapLang)
            .map((art) => {
              const paragraphs = art.bodyText ? art.bodyText.split("\n\n") : [art.description];
              return {
                id: art.id,
                category: art.category,
                title: art.title,
                shonaTitle: art.title,
                ndebeleTitle: art.title,
                summary: art.description,
                englishContent: paragraphs,
                shonaContent: paragraphs,
                ndebeleContent: paragraphs,
                isCustom: true,
                author: art.author || "Admin Staff Node",
                imageUrl: art.imageUrl,
                views: art.views,
                tags: art.tags || []
              };
            });

          const allArticles = [...mappedStandard, ...mappedAdmin];

          return allArticles.map((art) => {
            const isOpened = activeArticleId === art.id;
            const currentTitle = lang === "sn" ? art.shonaTitle : lang === "nd" ? art.ndebeleTitle : art.title;
            const currentContent = lang === "sn" ? art.shonaContent : lang === "nd" ? art.ndebeleContent : art.englishContent;

            return (
              <div
                key={art.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isOpened ? "border-moyo-secondary shadow-sm" : "border-moyo-border/50 shadow-sm hover:border-moyo-border"
                }`}
              >
                <div
                  onClick={() => {
                    setActiveArticleId(isOpened ? null : art.id);
                    setPlayingAudioId(null);
                    setPlayingVideoId(null);
                  }}
                  className="p-5 cursor-pointer flex gap-4 select-none items-start text-left"
                >
                  {(() => {
                    const ytId = getYouTubeId(art.imageUrl) || 
                                 (art.englishContent && typeof art.englishContent[0] === 'string' ? getYouTubeId(art.englishContent[0]) : null) ||
                                 getYouTubeId(art.summary);
                    const thumbUrl = ytId 
                      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
                      : art.imageUrl;
                    
                    if (thumbUrl) {
                      return (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-moyo-bg border border-moyo-border/10">
                          <img src={thumbUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-moyo-secondary-container/30 text-moyo-on-secondary-container rounded-full tracking-wider">
                        {art.category}
                      </span>
                      <span className="text-[10px] font-bold text-moyo-muted">
                        • {art.isCustom ? `${getTranslatedText("adminStaff")} (${art.author})` : `Clinical Board`}
                      </span>
                    </div>
                    <h3 className="text-md font-display font-bold text-moyo-primary leading-snug">
                      {currentTitle}
                    </h3>
                    {!isOpened && (
                      <p className="text-xs text-moyo-muted mt-2 line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>
                    )}
                  </div>

                  <button className="text-xs font-bold text-moyo-primary flex items-center shrink-0 mt-1 hover:underline">
                    {isOpened ? "Close" : getTranslatedText("readMore")}
                  </button>
                </div>

                {/* Expansion block */}
                {isOpened && (
                  <div className="px-5 pb-6 border-t border-moyo-bg pt-4 bg-moyo-bg/10">
                    
                    {/* Dynamic Custom Media Playback UI */}
                    {art.isCustom && art.category === "Audio" && (
                      <div className="bg-[#f0f7f4] border border-[#d2ebd9] rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingAudioId(playingAudioId === art.id ? null : art.id);
                            }}
                            className="w-10 h-10 rounded-full bg-moyo-primary flex items-center justify-center text-white hover:bg-moyo-primary/95 transition-all shadow-sm shrink-0 cursor-pointer"
                          >
                            {playingAudioId === art.id ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                          </button>
                          <div className="min-w-0 flex-grow">
                            <span className="block text-xs font-bold text-moyo-primary">Calming Breathwork Lesson</span>
                            <span className="block text-[10px] text-moyo-muted">
                              {playingAudioId === art.id ? "Playing guided audio..." : "Tap to play • 05:40 min duration"}
                            </span>
                          </div>
                          <Volume2 className="w-4 h-4 text-moyo-secondary shrink-0" />
                        </div>
                        {playingAudioId === art.id && (
                          <div className="mt-3 space-y-1">
                            <div className="w-full bg-moyo-border/30 h-1.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 340, ease: "linear" }}
                                className="bg-moyo-secondary h-full"
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-moyo-muted">
                              <span>0:00</span>
                              <span>5:40</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {art.isCustom && art.category === "Video" && (() => {
                      const ytId = getYouTubeId(art.imageUrl) || 
                                   (art.englishContent && typeof art.englishContent[0] === 'string' ? getYouTubeId(art.englishContent[0]) : null) ||
                                   getYouTubeId(art.summary);
                      const isPlaying = playingVideoId === art.id;

                      if (isPlaying) {
                        if (ytId) {
                          return (
                            <div className="relative rounded-xl overflow-hidden aspect-video mb-4 border border-moyo-border shadow-xs bg-black">
                              <iframe 
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                title={art.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full absolute inset-0"
                              />
                            </div>
                          );
                        } else {
                          // Check if imageUrl looks like a valid direct video link
                          const videoUrl = art.imageUrl && art.imageUrl.startsWith("http") ? art.imageUrl : null;
                          if (videoUrl) {
                            return (
                              <div className="relative rounded-xl overflow-hidden aspect-video mb-4 border border-moyo-border shadow-xs bg-black">
                                <video 
                                  src={videoUrl}
                                  controls
                                  autoPlay
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            );
                          }
                        }
                      }

                      // Else show thumbnail/play preview
                      const displayThumb = ytId 
                        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
                        : (art.imageUrl && !art.imageUrl.includes("youtube.com") && !art.imageUrl.includes("youtu.be") ? art.imageUrl : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b");

                      return (
                        <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-video mb-4 flex items-center justify-center border border-moyo-border shadow-xs group">
                          <img 
                            src={displayThumb} 
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (ytId || (art.imageUrl && art.imageUrl.startsWith("http"))) {
                                setPlayingVideoId(art.id);
                              } else {
                                alert(`Video resource not found. Setup direct link or YouTube URL: ${art.title}`);
                              }
                            }}
                            className="relative z-10 w-12 h-12 rounded-full bg-moyo-secondary flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                          >
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </button>
                          <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded font-black tracking-wide uppercase">
                            {ytId ? "YouTube Lesson • Click to play" : "Lesson video • CHW audit v1.0"}
                          </span>
                        </div>
                      );
                    })()}

                    {art.isCustom && art.category === "PDF" && (
                      <div className="bg-[#f0f4f7] border border-[#d2dee5] rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-moyo-primary shrink-0" />
                          <div>
                            <span className="block text-xs font-bold text-moyo-primary">Clinical Field Reference PDF</span>
                            <span className="block text-[10px] text-moyo-muted">Compiled for NGOs and peer health supporters • 1.2MB</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Opening document: ${art.title}`);
                          }}
                          className="py-1.5 px-3 bg-white hover:bg-[#ebf0f3] border border-moyo-border/60 text-xs font-bold text-moyo-primary rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open File
                        </button>
                      </div>
                    )}

                    <div className="space-y-4 text-sm text-moyo-muted leading-relaxed">
                      {currentContent.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3 items-center border-t border-moyo-border/30 pt-4">
                      <span className="text-xs font-bold text-moyo-primary">{lang === "en" ? "Was this helpful?" : "Izvi zvakubatsirai?"}</span>
                      <button className="py-1 px-3 bg-white border border-moyo-border/60 text-xs text-moyo-primary rounded-lg flex items-center gap-1.5 hover:bg-moyo-bg cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5 text-moyo-secondary" />
                        Yees / Hongu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Embedded Action Bench Callout */}
      <div className="bg-moyo-primary-container text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-0 bottom-0 w-32 h-32 border-4 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h4 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-moyo-on-tertiary-container" />
            {getTranslatedText("benchTitle")}
          </h4>
          <p className="text-xs text-moyo-on-primary-container max-w-md leading-relaxed mb-4">
            {getTranslatedText("benchText")}
          </p>
          <button
            onClick={onOpenScreener}
            className="py-2.5 px-5 bg-moyo-secondary text-white font-bold text-xs rounded-lg hover:bg-moyo-on-secondary-container transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {getTranslatedText("btnAction")}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
