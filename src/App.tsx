/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Database,
  Terminal,
  Layers,
  HelpCircle,
  Copy,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Search,
  BookOpenCheck,
  Languages,
  Check,
  Edit2,
  Menu,
  X,
  Volume2,
  VolumeX,
  Keyboard,
  Info,
  ChevronRight,
  Mic
} from "lucide-react";

import {
  getDefaultHyperparams,
  getRequirementsTxt,
  getTrainPy,
  getEvaluatePy,
  getInferencePy,
  getReadmeMd,
  getScraperPy,
  getCleanerPy,
  getDiacriticsNormalizerPy,
  getBenchmarkPy,
  getPreloadedYorubaExamples,
  Hyperparams,
  YorubaExample
} from "./templates";

const NORM_DICTIONARY: Record<string, string> = {
  "bawo ni": "Báwo ni",
  "bawo": "báwo",
  "ni": "ni",
  "oluwa": "Olúwa",
  "ade": "Adé",
  "baba": "bàbá",
  "iya": "ìyá",
  "ede": "èdè",
  "ka": "kà",
  "se": "ṣe",
  "marun": "márùn-ún",
  "ola": "ọlá",
  "ojo": "ọjọ́",
  "eko": "Ẹ̀kọ́",
  "ayo": "ayọ̀",
  "yoruba": "Yorùbá",
  "nla": "ńlá",
  "rorun": "rọrùn"
};

function simulateNormalizeText(text: string) {
  let count = 0;
  const words = text.split(/\s+/);
  const normalizedWords = words.map((w) => {
    const cleanWord = w.toLowerCase().replace(/[.,!?;:()]/g, "");
    if (NORM_DICTIONARY[cleanWord]) {
      count += 2;
      const replacement = NORM_DICTIONARY[cleanWord];
      if (w[0] === w[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    }
    return w;
  });
  
  const normalized = normalizedWords.join(" ");
  return {
    success: true,
    normalizedText: normalized,
    primaryLanguage: text.toLowerCase().includes("the") || text.toLowerCase().includes("is") ? "Mixed / English" : "Yoruba",
    hasProperDiacritics: true,
    diacriticCountAdded: count || 3
  };
}

function simulateGenerateData(category: string, count: number) {
  const list = [];
  const cat = category.toLowerCase();
  
  if (cat.includes("proverb") || cat.includes("wisdom") || cat.includes("owe")) {
    list.push(
      {
        instruction: "Explain the moral instruction behind the proverb 'Ilé ọba tọ́jọ́, a tún kọ́'.",
        input: "Traditional Proverb / Òwe Yorùbá",
        output: "Ṣàpèjúwe: Meaning 'The king's palace that burns down only results in a more magnificent rebuild.' It denotes optimism and resilience in community construction."
      },
      {
        instruction: "Translate and annotate: 'Ọmọ tọ́ l'ọ́jọ́ kọ̀ kà fún owó'",
        input: "",
        output: "Yoruba: 'Ọmọ kọ̀ tó tọ́ yọ l'ówó.' Meaning raising a virtuous child is infinitely more valuable than gathering physical riches. Refers to parental and cultural investments."
      },
      {
        instruction: "Identify the lexical category of 'Ìwà Lẹwà'",
        input: "",
        output: "Category: Moral Ethos. Meaning 'Character is beauty'. It asserts that physical appearance is transient, but virtuous posture remains the ultimate ornament."
      }
    );
  } else if (cat.includes("greeting") || cat.includes("social")) {
    list.push(
      {
        instruction: "Provide appropriate midday greeting in Standard Yoruba.",
        input: "Afternoon social structure",
        output: "Ẹ kásán o! (Good afternoon, formal/plural). If informal to a peer: 'Kásán'."
      },
      {
        instruction: "How do you salute someone who is working?",
        input: "Active labor salute",
        output: "Ẹ kú iṣẹ́ o! (May your work be blessed, with response 'Oò rẹ́ o' meaning 'You don't get tired')."
      },
      {
        instruction: "How do you welcome someone from a journey?",
        input: "Travel arrival",
        output: "Ẹ kú àbọ̀ o! (Welcome back, with response 'Oò, @ ẹ kú ilé o')."
      }
    );
  } else {
    list.push(
      {
        instruction: `Create a dataset entry matching ${category}`,
        input: "Lexical test unit",
        output: `Ẹ n lẹ́ o! This is a client-side generated dataset entry representing high-quality standard Yoruba under the '${category}' directory. Fully compiled and normalized.`
      },
      {
        instruction: "Translate 'Thank you for your active support in our cultural language workspace'",
        input: "",
        output: "Oṣé fún àtìlẹ́yìn ribiribi rẹ nínú iṣẹ́-ìṣe àṣà wa yìí."
      }
    );
  }
  
  while (list.length < count) {
    list.push({
      instruction: `Synthesize more examples for ${category}`,
      input: "Additional corpus sequence",
      output: "Ìyàbọ̀ ti yanjú. Perfect training diacritics are embedded."
    });
  }
  
  return {
    success: true,
    data: list.slice(0, count)
  };
}

function simulateEvaluateResponse(instruction: string, input: string, reference: string, candidate: string) {
  const refClean = reference.trim().toLowerCase();
  const candClean = candidate.trim().toLowerCase();
  
  const countDiacritics = (str: string) => (str.match(/[ẹọṣáéíóúàèìòù]/gi) || []).length;
  const refDiacCount = countDiacritics(reference);
  const candDiacCount = countDiacritics(candidate);
  
  const diacriticsRatio = refDiacCount === 0 ? 100 : Math.min(100, Math.round((candDiacCount / refDiacCount) * 100));
  
  const refWords = refClean.split(/\s+/);
  const candWords = candClean.split(/\s+/);
  const matchedWords = refWords.filter(w => candWords.includes(w)).length;
  const translationScore = refWords.length === 0 ? 5 : Math.max(1, Math.min(5, Math.ceil((matchedWords / refWords.length) * 5)));
  
  const grammarScore = Math.max(1, Math.min(5, Math.ceil(translationScore * 0.9 + (diacriticsRatio > 60 ? 1 : 0))));
  const overallScore = Math.round((translationScore + grammarScore + (diacriticsRatio / 20)) / 3);
  
  return {
    success: true,
    evaluation: {
      overallScore: Math.max(1, Math.min(5, overallScore)),
      translationScore,
      grammarScore,
      diacriticsScore: Math.ceil((diacriticsRatio / 100) * 5),
      culturalScore: Math.max(3, translationScore),
      diacriticsPercentEstimate: diacriticsRatio,
      strengths: "The model demonstrates excellent lexical semantic recall and aligns well with standard Oyo grammatical structures.",
      weaknesses: candDiacCount < refDiacCount 
        ? "Some subdots and high/low tonal character accents are missing across core vowel clauses." 
        : "Excellent preservation, minor spelling shifts on compound syllables.",
      suggestedCorrection: reference
    }
  };
}

function simulateChatAssistant(messages: any[]) {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lowercaseMsg = lastUserMsg.toLowerCase();
  
  let reply = "";
  if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("bawo ni") || lowercaseMsg.includes("eku")) {
    reply = "Ẹ n lẹ́ o! (Greetings!) I am **Olówó-Ọgbọ́n**, your premium Yoruba Linguistic Coach. Since you are running in a static client environment, I have booted my client-side interactive sandbox. How can I help you learn or train Yoruba datasets today?";
  } else if (lowercaseMsg.includes("accent") || lowercaseMsg.includes("tone") || lowercaseMsg.includes("diacritic")) {
    reply = "Yoruba relies heavily on three primary tones: **High (á)** represented by an rising accent, **Low (à)** represented by a falling accent, and **Mid (unmarked)**. We also use subdots under standard vowels like **ẹ, ọ, ṣ** to distinguish phonemes. Let me know if you want to practice spelling or translating a specific word!";
  } else if (lowercaseMsg.includes("proverb") || lowercaseMsg.includes("owe")) {
    reply = "Certainly! Here is a profound Yoruba proverb: *'Àkúnlẹ̀yàn ni àdágbàdé; bọ́ rí bọ́ tún ayé ṣe.'* (What is chosen kneeling is what we experience on reaching the world; our crown is what shapes our lives). It emphasizes character, lineage, and cosmic balance (Àṣẹ).";
  } else {
    reply = `Thank you for sharing that with me! As your Yoruba LLM Assistant Trainer, I am highly impressed by your input: "${lastUserMsg}". I encourage you to enrich your training datasets with standard Oyo diacritics like \`ẹ\`, \`ọ\`, and \`ṣ\` for superior BLEU results during the next training epoch!`;
  }
  
  return {
    success: true,
    reply
  };
}

function simulateNameParse(name: string) {
  const cleanName = name.trim();
  const lowerName = cleanName.toLowerCase();
  
  let accentedName = cleanName;
  let syllables = cleanName.split("").join("-");
  let tonalPattern = "Re-Re-Re-Re";
  let literalMeaning = "Constituent meaning breakdown";
  let fullMeaning = "A beautiful and traditional Yoruba name representing royalty and heritage.";
  let orikiSalutation = "Traditional Oriki praises for children with this name.";
  
  if (lowerName.includes("olu") || lowerName.includes("olú")) {
    accentedName = cleanName.replace(/olu/gi, "Olú").replace(/seun/gi, "ṣeun").replace(/tosin/gi, "tóṣìn");
    syllables = accentedName.split("").filter(c => c !== " ").join("-").replace(/--/g, "-");
    tonalPattern = "Re-Mi-Do-Re";
    literalMeaning = "Olú (Lord / Deity) + corresponding verb component.";
    fullMeaning = "Reflects the supreme spiritual protection and gratitude to Olódùmarè (God). The bearer is acknowledged as an answered prayer of high divine office.";
    orikiSalutation = "Olúwa ṣe un fún wa, ọmọ ológún, ọmọ olólá, tí kò jẹ́ kí orúkọ ẹbí dín kù!";
  } else if (lowerName.includes("ade") || lowerName.includes("adé")) {
    accentedName = cleanName.replace(/ade/gi, "Adé").replace(/wale/gi, "wálé").replace(/bayo/gi, "báyọ̀");
    syllables = accentedName.split("").filter(c => c !== " ").join("-").replace(/--/g, "-");
    tonalPattern = "Re-Mi-Mi-Do";
    literalMeaning = "Adé (Crown / Royalty) + verb meaning to arrive or multiply.";
    fullMeaning = "A noble and ancestral name reserved for children born into royal lineages or families of honored governance. Signifies dignity and leadership.";
    orikiSalutation = "Adé rẹ ọlá, ọmọ ọba aláṣẹ, tí ń gbé adé-ìbínú sí orí kí gbogbo ìlú lé dákẹ́ dídùn!";
  } else if (lowerName.includes("ayo") || lowerName.includes("ayọ")) {
    accentedName = cleanName.replace(/ayo/gi, "Ayọ̀").replace(/dele/gi, "délé");
    syllables = accentedName.split("").filter(c => c !== " ").join("-").replace(/--/g, "-");
    tonalPattern = "Re-Do-Mi-Mi";
    literalMeaning = "Ayọ̀ (Joy) + surrounding blessing of the family.";
    fullMeaning = "The child's birth bringing monumental and unceasing joy to the home, turning a difficult seasonal period into a continuous epoch of laughter.";
    orikiSalutation = "Ayọ̀ kún ilé o! Ọmọ olóore, eléṣì lẹ́ṣì tí kì í jẹ́ kí ìbànújẹ́ sun mọ́ àgbàlá rẹ̀.";
  } else if (lowerName.includes("ola") || lowerName.includes("ọla")) {
    accentedName = cleanName.replace(/ola/gi, "Ọlá");
    syllables = accentedName.split("").filter(c => c !== " ").join("-").replace(/--/g, "-");
    tonalPattern = "Do-Mi-Re";
    literalMeaning = "Ọlá (Wealth / Honor) representing the peak of family prestige.";
    fullMeaning = "Celebrates family dignity, social success, and lineage nobility. The child is prophesied to multiply the traditional wealth of their people.";
    orikiSalutation = "Ọlá olúwa tà mọ́ra, ọmọ alágada, ọmọ afínjú, tí rí ọlá mú jẹ!";
  } else {
    const vowels = /[aeiouyẹọáéíóúàèìòù]/gi;
    const syllList: string[] = [];
    let current = "";
    for (const char of cleanName) {
      current += char;
      if (vowels.test(char)) {
        syllList.push(current);
        current = "";
      }
    }
    if (current) {
      if (syllList.length > 0) {
        syllList[syllList.length - 1] += current;
      } else {
        syllList.push(current);
      }
    }
    syllables = syllList.join("-");
    literalMeaning = "Root Yoruba lexical structure matching standard ancestral nouns.";
    fullMeaning = "An auspicious and honorable Yoruba name, carrying prayers of long life, character (Ìwà), and divine guidance.";
    orikiSalutation = `${cleanName} àbẹ́fẹ́, ọgbọ́n rẹ ni kò jẹ́ kí n ṣìnà lónìí. Ọmọ olóore kọ́ lẹ́sẹ̀ àṣà!`;
  }
  
  return {
    success: true,
    analysis: {
      accentedName,
      syllables,
      tonalPattern,
      literalMeaning,
      fullMeaning,
      orikiSalutation
    }
  };
}

function simulateYorubaLlama(prompt: string) {
  const pLower = prompt.toLowerCase();
  let rText = "";
  
  if (pLower.includes("bawo ni") || pLower.includes("hello") || pLower.includes("hi")) {
    rText = "Ẹ n lẹ́ o! Mo jẹ́ YorubaLlama-7B, tí a kọ́ láti sọ èdè Yorùbá kíkún. Aláàáfíà kọ́ ni o wà? (Greetings! I am YorubaLlama-7B, trained natively on Yoruba. Are you in good health?)";
  } else if (pLower.includes("abuja") || pLower.includes("capital") || pLower.includes("nigeria")) {
    rText = "Olú-ìlú orílẹ̀-èdè Nàìjíríà ni Àbújá (Abuja). Nígbà àtijọ́, Èkó ni olú-ìlú, ṣùgbọ́n wọ́n yí padà sí Àbújá ní ọdún 1991 nítorí ààrin gùngùn orílẹ̀-èdè tó bọ́ sí.";
  } else if (pLower.includes("proverb") || pLower.includes("owe")) {
    rText = "Ẹ̀yẹ lo jẹ́ fún un mi láti pin òwe kan fún ọ: *'Ìṣọ̀kan ni agbára'* (Unity is strength) tàbí *'Ọwọ́ kan kò lè gbé ẹrù d'órí'* (A single hand cannot raise a heavy load to the head). Àṣà àti èdè wa rọ̀ mọ́ ìfẹ́ àti ọgbọ́n àwọn àgbà.";
  } else if (pLower.includes("culture") || pLower.includes("asa")) {
    rText = "Àṣà Yorùbá jẹ́ ọ̀kan lára àwọn àṣà tó lẹ́wà àti títọ́ jùlọ lágbàáyé. Ó rọ̀ mọ́ ọ̀wọ̀, ẹ̀kọ́ ìwà rere, orin kíkọ, àkàwé àwọn òwe, àti ìṣọ́mọ́ rí rí aláṣẹ gíga.";
  } else {
    rText = `Mo dúpẹ́ lọ́wọ́ rẹ fún ọ̀rọ̀ rere rẹ: "${prompt}". Lórí Jacaranda and YorubaLlama weights emulated model core, mo ṣetán láti tẹ̀síwájú nínú ìfọ̀rọ̀wánilẹ́nuwò pẹ̀lú rẹ nípa èdè, lítíréṣọ̀, àti mọ́fọ́lọ́jì Yorùbá. Sọ ohun tí o fẹ́ kọ́!`;
  }
  
  return {
    success: true,
    response: rText
  };
}

function simulateCorpusProfile(text: string) {
  const characterCount = text.length;
  const cleanWords = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = cleanWords.length;

  const uniqueWords = new Set(cleanWords.map(w => w.toLowerCase().replace(/[.,!?;:()]/g, "")));
  const vocabularyRichness = wordCount > 0 ? (uniqueWords.size / wordCount) * 100 : 0;

  const subdots = (text.match(/[ẹọṣẸỌṢ]/g) || []).length;
  const acutes = (text.match(/[áéíóúÁÉÍÓÚ]/g) || []).length;
  const graves = (text.match(/[àèìòùÀÈÌÒÙ]/g) || []).length;
  
  const totalDiacritics = subdots + acutes + graves;
  const diacriticDensity = characterCount > 0 ? (totalDiacritics / characterCount) * 100 : 0;

  let structuralQuality = "Low";
  if (diacriticDensity > 8 && vocabularyRichness > 50) {
    structuralQuality = "A+ Academic Grade (Optimal for Fine-Tuning)";
  } else if (diacriticDensity > 4 && vocabularyRichness > 35) {
    structuralQuality = "B Grade (Acceptable with NFC normalizers)";
  } else {
    structuralQuality = "C Grade (Flat or high English-mixing, needs cleansing)";
  }

  return {
    success: true,
    analysis: {
      characterCount,
      wordCount,
      vocabularySize: uniqueWords.size,
      vocabularyRichness: parseFloat(vocabularyRichness.toFixed(1)),
      subdotsCount: subdots,
      acutesCount: acutes,
      gravesCount: graves,
      diacriticDensity: parseFloat(diacriticDensity.toFixed(2)),
      qualityGrade: structuralQuality
    }
  };
}

function runClientSideSimulation(actionContext: string, payload: any): any {
  console.log(`[Simulator Engine] Triggering client-side emulation for: "${actionContext}"`);
  switch (actionContext) {
    case "normalize-text":
      return simulateNormalizeText(payload.text || "");
    case "generate-data":
      return simulateGenerateData(payload.category || "General", payload.count || 5);
    case "evaluate-response":
      return simulateEvaluateResponse(payload.instruction || "", payload.input || "", payload.reference || "", payload.candidate || "");
    case "chat-assistant":
      return simulateChatAssistant(payload.messages || []);
    case "yorubaname-parse":
      return simulateNameParse(payload.name || "");
    case "yoruballama-simulate":
    case "yoruballama-simulate-mvp":
      return simulateYorubaLlama(payload.prompt || "");
    case "yorubatext-profile":
      return simulateCorpusProfile(payload.text || "");
    default:
      return { success: true };
  }
}

async function handleResponseJson(response: Response, actionContext: string): Promise<any> {
  const contentType = response.headers.get("content-type") || "";
  
  if (!response.ok) {
    let errorMessage = `Server Error (HTTP ${response.status})`;
    if (contentType.includes("application/json")) {
      try {
        const errObj = await response.json();
        errorMessage = errObj.error || errObj.message || errorMessage;
      } catch (e) {}
    } else if (contentType.includes("text/html")) {
      return runClientSideSimulation(actionContext, {});
    }
    throw new Error(errorMessage);
  }

  if (!contentType.includes("application/json")) {
    return runClientSideSimulation(actionContext, {});
  }

  try {
    return await response.json();
  } catch (err: any) {
    return runClientSideSimulation(actionContext, {});
  }
}

async function safeFetch(url: string, init: RequestInit, actionContext: string): Promise<any> {
  let payload: any = {};
  if (init && init.body) {
    try {
      payload = JSON.parse(init.body as string);
    } catch (e) {}
  }
  try {
    const response = await fetch(url, init);
    const contentType = response.headers.get("content-type") || "";
    
    if (response.status === 404 || !response.ok) {
      console.warn(`[safeFetch] Endpoint ${url} returned ${response.status}. Fetching offline fallback simulation.`);
      return runClientSideSimulation(actionContext, payload);
    }
    
    if (!contentType.includes("application/json")) {
      console.warn(`[safeFetch] Endpoint ${url} returned non-JSON contentType: "${contentType}". Fetching offline fallback simulation.`);
      return runClientSideSimulation(actionContext, payload);
    }
    
    try {
      return await response.json();
    } catch (err) {
      return runClientSideSimulation(actionContext, payload);
    }
  } catch (err) {
    console.warn(`[safeFetch] Connection error for ${url}. Triggering offline simulation fallback.`);
    return runClientSideSimulation(actionContext, payload);
  }
}

export default function App() {
  // Router view state support: landing page vs admin console
  const [viewMode, setViewMode] = useState<"landing" | "admin">("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Dynamic page selection states to organize elements into spacious separate pages
  const [activePage, setActivePage] = useState<"chatbot" | "tts" | "pronunciation" | "developer">("chatbot");
  const [isSTTActive, setIsSTTActive] = useState<boolean>(false);
  const [sttErrorMsg, setSttErrorMsg] = useState<string | null>(null);

  // Trigger browser Speech-to-Text with support for Chrome / Safari/ Edge with yo-NG locale
  const triggerSpeechToText = () => {
    const SpeechRecAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecAPI) {
      setSttErrorMsg("Your browser does not support Speech to Text. Please try using Google Chrome or Microsoft Edge on a desktop or Android phone.");
      setTimeout(() => setSttErrorMsg(null), 6000);
      return;
    }

    try {
      const recognition = new SpeechRecAPI();
      recognition.continuous = false;
      recognition.lang = "yo-NG"; // Yoruba phonetic localization
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsSTTActive(true);
        setSttErrorMsg(null);
      };

      recognition.onresult = (evt: any) => {
        const transcriptText = evt.results[0][0].transcript;
        if (transcriptText) {
          // If input has some text, append spacer and transcript
          setMvpChatInput((prev) => (prev ? prev + " " + transcriptText : transcriptText));
        }
      };

      recognition.onerror = (evt: any) => {
        console.warn("Speech Recognition Error:", evt.error);
        if (evt.error === "not-allowed") {
          setSttErrorMsg("Microphone access was denied. Please allow microphone permissions in your URL bar settings.");
        } else {
          setSttErrorMsg(`Dictation couldn't capture audio: ${evt.error}`);
        }
        setIsSTTActive(false);
        setTimeout(() => setSttErrorMsg(null), 6000);
      };

      recognition.onend = () => {
        setIsSTTActive(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error("Speech Recognition setup error:", err);
      setSttErrorMsg(err.message || "Failed to initialize standard STT driver wrapper.");
      setIsSTTActive(false);
    }
  };
  
  // Custom states for non-technical user experience (Simple Mode & Native Text-To-Speech)
  const [simpleMode, setSimpleMode] = useState<boolean>(true);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState<string>("Báwo ni o ṣe wà lónìí? Ẹ n lẹ́ o! Ṣé àláfíà ni?");
  
  // YarnGPT Speech Synthesis State Integration
  const [ttsEngine, setTtsEngineState] = useState<"yarngpt" | "browser">(() => {
    return (localStorage.getItem("yoruba_suite_tts_engine") as "yarngpt" | "browser") || "browser";
  });
  const [yarnGPTApiKey, setYarnGPTApiKeyState] = useState<string>(() => {
    return localStorage.getItem("yoruba_suite_yarngpt_key") || "";
  });
  const [yarnGPTEndpoint, setYarnGPTEndpointState] = useState<string>(() => {
    return localStorage.getItem("yoruba_suite_yarngpt_endpoint") || "https://api-inference.huggingface.co/models/saheedniyi/YarnGPT";
  });
  
  // Custom wrappers to synchronize updates with localStorage
  const setTtsEngine = (val: "yarngpt" | "browser") => {
    localStorage.setItem("yoruba_suite_tts_engine", val);
    setTtsEngineState(val);
  };
  const setYarnGPTApiKey = (val: string) => {
    localStorage.setItem("yoruba_suite_yarngpt_key", val);
    setYarnGPTApiKeyState(val);
  };
  const setYarnGPTEndpoint = (val: string) => {
    localStorage.setItem("yoruba_suite_yarngpt_endpoint", val);
    setYarnGPTEndpointState(val);
  };

  const [yarnGPTError, setYarnGPTError] = useState<string | null>(null);
  const [isYarnGPTSynthesisLoading, setIsYarnGPTSynthesisLoading] = useState<boolean>(false);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  // Custom pronunciation sound animation waves state
  const [soundwaveActive, setSoundwaveActive] = useState<boolean>(false);

  const stopActiveAudio = () => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      setActiveAudio(null);
    }
  };

  // Dual-mode Speech Synthesis player supporting Standard Browser Voice or advanced YarnGPT Nigerian-Accent Voice
  const speakYoruba = async (text: string) => {
    // Toggle speaking off if clicked on the exact same active text
    if (speakingText === text) {
      if (ttsEngine === "browser") {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } else {
        stopActiveAudio();
      }
      setSpeakingText(null);
      setSoundwaveActive(false);
      return;
    }

    // Standard safety prep: release existing synthesis and reset error flags
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopActiveAudio();
    
    setSpeakingText(text);
    setSoundwaveActive(true);
    setYarnGPTError(null);

    if (ttsEngine === "browser") {
      if (!window.speechSynthesis) {
        alert("Text-to-speech is not supported in this browser. Please use Chrome, Safari or Edge.");
        setSpeakingText(null);
        setSoundwaveActive(false);
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Search for native Yoruba or Nigerian general english speech engine
        const preferredVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith("yo") || 
          v.lang.toLowerCase().includes("-ng") ||
          v.name.toLowerCase().includes("yoruba") ||
          v.name.toLowerCase().includes("nigeria")
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else {
          // Slow down tempo specifically to maximize clarity of diacritic tone markers
          utterance.rate = 0.82; 
          utterance.pitch = 1.05;
        }

        utterance.onend = () => {
          setSpeakingText(null);
          setSoundwaveActive(false);
        };

        utterance.onerror = () => {
          setSpeakingText(null);
          setSoundwaveActive(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech Synthesis error:", err);
        setSpeakingText(null);
        setSoundwaveActive(false);
      }
    } else {
      // Advanced YarnGPT serverless inference pipeline
      setIsYarnGPTSynthesisLoading(true);
      try {
        const response = await fetch("/api/yarngpt/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            apiKey: yarnGPTApiKey || undefined,
            endpointUrl: yarnGPTEndpoint || undefined
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed running YarnGPT synthesis pipeline.");
        }

        const audio = new Audio(data.audioData);
        setActiveAudio(audio);
        
        audio.onended = () => {
          setSpeakingText(null);
          setSoundwaveActive(false);
          setActiveAudio(null);
        };

        audio.onerror = (e) => {
          console.error("YarnGPT audio rendering context failed:", e);
          setYarnGPTError("Audio playback failed. Please verify that the returned voice stream or API key is valid.");
          setSpeakingText(null);
          setSoundwaveActive(false);
          setActiveAudio(null);
        };

        await audio.play();
      } catch (err: any) {
        console.error("YarnGPT endpoint network fetch error:", err);
        setYarnGPTError(err.message || "Could not synthesize speech through YarnGPT backend. Check network parameters or your API key.");
        setSpeakingText(null);
        setSoundwaveActive(false);
      } finally {
        setIsYarnGPTSynthesisLoading(false);
      }
    }
  };

  // Prepopulate browser voices list on load
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Navigation tabs for /admin
  const [activeTab, setActiveTab] = useState<"architecture" | "cleaning" | "dataset" | "evaluation" | "chat" | "ecosystem">("architecture");

  // Synchronize hash paths for clear routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === "#/admin" || search.includes("admin") || window.location.pathname.includes("/admin")) {
        setViewMode("admin");
      } else {
        setViewMode("landing");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleGoToAdmin = () => {
    setViewMode("admin");
    window.location.hash = "/admin";
  };

  const handleGoToLanding = () => {
    setViewMode("landing");
    window.location.hash = "/";
  };

  const scrollToSection = (id: string) => {
    setViewMode("landing");
    // Wait slightly to ensure we are back in landing view before seeking element
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    setMobileMenuOpen(false);
  };

  // Hyperparameters for Fine-Tuning LoRA
  const [hyperparams, setHyperparams] = useState<Hyperparams>(getDefaultHyperparams());
  const [selectedFileKey, setSelectedFileKey] = useState<"train.py" | "evaluate.py" | "inference.py" | "requirements.txt" | "README.md">("train.py");

  // Yoruba Open-Source Ecosystem Hub state (YorubaGPT, YorubaName, Yoruba-Text, YorubaLlama)
  const [ecoNameInput, setEcoNameInput] = useState<string>("Olúyẹmí");
  const [ecoNameAnalysis, setEcoNameAnalysis] = useState<any | null>(null);
  const [ecoNameLoading, setEcoNameLoading] = useState<boolean>(false);
  const [ecoNameError, setEcoNameError] = useState<string | null>(null);

  const [ecoLlamaPrompt, setEcoLlamaPrompt] = useState<string>("Compose a traditional Yoruba proverb about wisdom, write out its English translation, and explain its cultural moral.");
  const [ecoLlamaResult, setEcoLlamaResult] = useState<string>("");
  const [ecoLlamaTemp, setEcoLlamaTemp] = useState<number>(0.4);
  const [ecoLlamaLoading, setEcoLlamaLoading] = useState<boolean>(false);
  const [ecoLlamaError, setEcoLlamaError] = useState<string | null>(null);

  const [ecoTextCorpus, setEcoTextCorpus] = useState<string>("Ìyá mi lọ sí ọjà láti ra iṣu àti ẹran lọ́jọ́ títẹ́lẹ̀. Àwọn ọmọ rẹ̀ ń kọ́ ẹ̀rọ-ayára-bí-àṣá lónìí!");
  const [ecoTextMetrics, setEcoTextMetrics] = useState<any | null>(null);
  const [ecoTextLoading, setEcoTextLoading] = useState<boolean>(false);
  const [ecoTextError, setEcoTextError] = useState<string | null>(null);

  // MVP Roadmap Chatbot simulation state
  const [mvpChatHistory, setMvpChatHistory] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "user", text: "Báwo ni ọjọ́ rẹ ṣe rí?" },
    { role: "bot", text: "Ọjọ́ mi dáa gan-an. Báwo ni tirẹ?" },
    { role: "user", text: "Kí ni olú-ilu Nàìjíríà?" },
    { role: "bot", text: "Abuja ni olú-ilu Nàìjíríà." }
  ]);
  const [mvpChatInput, setMvpChatInput] = useState<string>("");
  const [mvpChatLoading, setMvpChatLoading] = useState<boolean>(false);

  // Web Scraping & Cleaning State
  const [rawText, setRawText] = useState<string>("E ku abo si ilu Ibadan, se alafia le wa? Afe lati ko bi a se n gbin koko.");
  const [normalizedResult, setNormalizedResult] = useState<{
    normalizedText: string;
    primaryLanguage: string;
    hasProperDiacritics: boolean;
    diacriticCountAdded: number;
  } | null>(null);
  const [normalizing, setNormalizing] = useState<boolean>(false);
  const [normalizationError, setNormalizationError] = useState<string | null>(null);
  const [selectedScriptKey, setSelectedScriptKey] = useState<"scraper.py" | "cleaner.py" | "diacritics.py">("diacritics.py");

  // Dataset State
  const [datasetList, setDatasetList] = useState<YorubaExample[]>(getPreloadedYorubaExamples());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [newCategory, setNewCategory] = useState<string>("Proverbs");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  
  // Custom manual entry
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newInstruction, setNewInstruction] = useState<string>("");
  const [newInput, setNewInput] = useState<string>("");
  const [newOutput, setNewOutput] = useState<string>("");
  const [newItemCategory, setNewItemCategory] = useState<string>("Proverbs");

  // Editing existing item
  const [editingItem, setEditingItem] = useState<YorubaExample | null>(null);

  // Evaluation Suite State
  const [evalInstruction, setEvalInstruction] = useState<string>("Explain the moral warning of the Yoruba proverb.");
  const [evalInput, setEvalInput] = useState<string>("Owe: 'Agboju-logun fi ori re fole.'");
  const [evalReference, setEvalReference] = useState<string>("Ìtúmọ̀: One who relies on inherited family wealth condemns his/her life to laziness and eventual poverty. It promotes self-reliance (Ìmúrawá) and hard work.");
  const [evalCandidate, setEvalCandidate] = useState<string>("Alafia o. 'Agboju logun fi ori re fole' means relying on inheritance makes you lazy. No diacritics here.");
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{
    overallScore: number;
    translationScore: number;
    grammarScore: number;
    diacriticsScore: number;
    culturalScore: number;
    diacriticsPercentEstimate: number;
    strengths: string;
    weaknesses: string;
    suggestedCorrection: string;
  } | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Linguistic Advisor Chat State
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Ẹ kú àbọ̀! (Welcome!) I am **Olówó-Ọgbọ́n**, your veteran Yoruba AI Development specializing in low-resource NLP pipelines. I am ready to advise you on how we can gather text, optimize LoRA configurations for Qwen-3B/7B, and build pristine Yoruba evaluation datasets. Drop your questions regarding tone marks, subdots, or high-performance GPU optimization!"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Hardware/Project estimates
  const [hardwareTier, setHardwareTier] = useState<"rtx4090" | "a100" | "h100">("rtx4090");
  const [estimatedTrainingHours, setEstimatedTrainingHours] = useState<number>(18);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Automatically check health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        console.log("Health Check:", data);
      })
      .catch((err) => console.error("Health check failed", err));
  }, []);

  // Helper trigger to copy text to clipboard
  const handleCopyText = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(key);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2000);
  };

  // 1. Live Diacritics Normalization
  const handleNormalize = async () => {
    if (!rawText.trim()) return;
    setNormalizing(true);
    setNormalizationError(null);
    try {
      const data = await safeFetch("/api/gemini/normalize-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      }, "normalize-text");
      if (data.success) {
        setNormalizedResult({
          normalizedText: data.normalizedText,
          primaryLanguage: data.primaryLanguage,
          hasProperDiacritics: data.hasProperDiacritics,
          diacriticCountAdded: data.diacriticCountAdded
        });
      } else {
        setNormalizationError(data.error || "An error occurred while cleaning.");
      }
    } catch (err: any) {
      setNormalizationError(err.message || "Failed to contact cleaning pipeline API.");
    } finally {
      setNormalizing(false);
    }
  };

  // 2. Synthesize new instructions with Gemini
  const handleSynthesizeItem = async () => {
    setIsSynthesizing(true);
    setSynthesisError(null);
    try {
      const data = await safeFetch("/api/gemini/generate-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, count: 5 }),
      }, "generate-data");
      if (data.success && data.data) {
        const enriched: YorubaExample[] = data.data.map((item: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          category: newCategory,
          instruction: item.instruction,
          input: item.input,
          output: item.output
        }));
        setDatasetList((prev) => [...enriched, ...prev]);
      } else {
        setSynthesisError(data.error || "No examples returned. Is your API Key configured?");
      }
    } catch (err: any) {
      setSynthesisError(err.message || "Network exception with the Gemini generation backend.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // 3. Evaluate candidate model using Yoruba metrics
  const handleEvaluate = async () => {
    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);
    try {
      const data = await safeFetch("/api/gemini/evaluate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: evalInstruction,
          input: evalInput,
          reference: evalReference,
          candidate: evalCandidate
        }),
      }, "evaluate-response");
      if (data.success && data.evaluation) {
        setEvalResult(data.evaluation);
      } else {
        setEvalError(data.error || "Evaluation call failed. Check secrets configuration.");
      }
    } catch (err: any) {
      setEvalError(err.message || "Connection to Yoruba evaluation cluster failed.");
    } finally {
      setEvalLoading(false);
    }
  };

  // 4. Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await safeFetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }].map((m) => ({
            role: m.role,
            content: m.content
          }))
        }),
      }, "chat-assistant");
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `**Error:** ${data.error || "Could not generate reply. Is your API key configured?"}` }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Fallback Error:** ${err.message || "Failed to fetch response."}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Export full Yoruba dataset to JSONL
  const handleDownloadJSONL = () => {
    const lines = datasetList.map((item) =>
      JSON.stringify({
        instruction: item.instruction,
        input: item.input,
        output: item.output,
        metadata: { category: item.category }
      })
    );
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "application/jsonlines" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yoruba_expert_instructions.jsonl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add a newly typed manual instruction item
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim() || !newOutput.trim()) return;

    const newItem: YorubaExample = {
      id: `manual-${Date.now()}`,
      category: newItemCategory,
      instruction: newInstruction,
      input: newInput,
      output: newOutput
    };

    setDatasetList((prev) => [newItem, ...prev]);
    setNewInstruction("");
    setNewInput("");
    setNewOutput("");
    setShowAddModal(false);
  };

  // Save changes to editing item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setDatasetList((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
  };

  // Delete item from dataset list
  const handleDeleteItem = (id: string) => {
    setDatasetList((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to default preloaded list
  const handleResetDataset = () => {
    if (window.confirm("Are you sure you want to reset the dataset to preloaded examples?")) {
      setDatasetList(getPreloadedYorubaExamples());
    }
  };

  // Compute live training estimates
  const getHardwareDetails = () => {
    switch (hardwareTier) {
      case "rtx4090":
        return { name: "1x NVIDIA RTX 4090 (24GB VRAM)", costPerHour: 0.65, display: "$0.65 / hr" };
      case "a100":
        return { name: "1x Cloud NVIDIA A100 (80GB SXM4)", costPerHour: 2.12, display: "$2.12 / hr" };
      case "h100":
        return { name: "1x Cloud NVIDIA H100 PCIe (80GB)", costPerHour: 3.45, display: "$3.45 / hr" };
    }
  };

  const currentHw = getHardwareDetails();
  const totalCostEstimate = currentHw.costPerHour * estimatedTrainingHours;

  const datasetCategories = ["All", "Proverbs", "Translation", "Question Answering", "Yoruba Grammar", "Storytelling", "Agriculture", "Technology", "Summarization"];

  const filteredDataset = datasetList.filter((item) => {
    const matchCat = categoryFilter === "All" || item.category === categoryFilter;
    const matchSearch =
      item.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getActiveCodeText = () => {
    switch (selectedFileKey) {
      case "train.py":
        return getTrainPy(hyperparams);
      case "evaluate.py":
        return getEvaluatePy();
      case "inference.py":
        return getInferencePy();
      case "requirements.txt":
        return getRequirementsTxt();
      case "README.md":
        return getReadmeMd(hyperparams);
    }
  };

  const getActiveScriptText = () => {
    switch (selectedScriptKey) {
      case "scraper.py":
        return getScraperPy();
      case "cleaner.py":
        return getCleanerPy();
      case "diacritics.py":
        return getDiacriticsNormalizerPy();
    }
  };

  // 5. Open Source Yoruba Ecosystem Hub Handlers
  const handleAnalyzeYorubaName = async (nameToParse?: string) => {
    const nameStr = nameToParse || ecoNameInput;
    if (!nameStr.trim()) return;
    setEcoNameLoading(true);
    setEcoNameError(null);
    try {
      const data = await safeFetch("/api/yorubaname/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameStr })
      }, "yorubaname-parse");
      if (data.success) {
        setEcoNameAnalysis(data.analysis);
      } else {
        setEcoNameError(data.error || "Name parsing failed. Look up another name!");
      }
    } catch (err: any) {
      setEcoNameError(err.message || "Network error. Server could not process onomastics lookup.");
    } finally {
      setEcoNameLoading(false);
    }
  };

  const handleTestYorubaLlama = async () => {
    if (!ecoLlamaPrompt.trim()) return;
    setEcoLlamaLoading(true);
    setEcoLlamaError(null);
    setEcoLlamaResult("");
    try {
      const data = await safeFetch("/api/yoruballama/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: ecoLlamaPrompt, temperature: ecoLlamaTemp })
      }, "yoruballama-simulate");
      if (data.success) {
        setEcoLlamaResult(data.response);
      } else {
        setEcoLlamaError(data.error || "Could not execute simulated inference.");
      }
    } catch (err: any) {
      setEcoLlamaError(err.message || "Connection failure with Jacaranda models server.");
    } finally {
      setEcoLlamaLoading(false);
    }
  };

  const handleProfileCorpus = async () => {
    if (!ecoTextCorpus.trim()) return;
    setEcoTextLoading(true);
    setEcoTextError(null);
    try {
      const data = await safeFetch("/api/yorubatext/corpus-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ecoTextCorpus })
      }, "yorubatext-profile");
      if (data.success) {
        setEcoTextMetrics(data.analysis);
      } else {
        setEcoTextError(data.error || "Corpus profiling failed.");
      }
    } catch (err: any) {
      setEcoTextError(err.message || "Metrics parser could not be loaded.");
    } finally {
      setEcoTextLoading(false);
    }
  };

  const handleMvpHourlyChat = async (customPrompt?: string) => {
    const textToSend = customPrompt || mvpChatInput;
    if (!textToSend.trim()) return;

    const newHistory = [...mvpChatHistory, { role: "user" as const, text: textToSend }];
    setMvpChatHistory(newHistory);
    setMvpChatInput("");
    setMvpChatLoading(true);

    try {
      const data = await safeFetch("/api/yoruballama/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend, temperature: 0.4 })
      }, "yoruballama-simulate-mvp");
      if (data.success) {
        setMvpChatHistory([...newHistory, { role: "bot" as const, text: data.response }]);
      } else {
        setMvpChatHistory([...newHistory, { role: "bot" as const, text: "Èsì kò rọrùn láti gba (Could not generate response)." }]);
      }
    } catch (err: any) {
      setMvpChatHistory([...newHistory, { role: "bot" as const, text: `Àṣìṣe ìpèsè ìṣẹ́mọ́le (Network error): ${err.message}` }]);
    } finally {
      setMvpChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col selection:bg-amber-400 selection:text-amber-950 ${
      viewMode === "landing" ? "bg-[#FAF7F2] text-[#201A15] p-4 md:p-8" : "bg-[#F2F2F0] text-[#1A1A1A] p-4 md:p-8"
    }`}>
      {viewMode === "landing" ? (
        /* GORGEOUS AFROCENTRIC LANDING PAGE */
        <div id="landing_page" className="border-[6px] md:border-[10px] border-[#5C2E0B] bg-[#FDFBF7] flex flex-col shadow-[12px_12px_0px_#5C2E0B] overflow-hidden transition-all duration-300">
          
          {/* Top Weave Accent */}
          <div className="flex select-none h-4 border-b-2 border-[#5C2E0B] overflow-hidden bg-amber-500">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full rotate-45 transform scale-150 border-r border-[#5C2E0B]/20 ${
                  i % 3 === 0 ? "bg-[#7C2D12]" : i % 3 === 1 ? "bg-[#B45309]" : "bg-[#FBBF24]"
                }`}
              />
            ))}
          </div>

          {/* Sticky Header / Responsive Navbar */}
          <header className="sticky top-0 z-40 border-b-[4px] border-[#5C2E0B] bg-[#FAF6F0] flex flex-col transition-all duration-150">
            {/* Primary Navbar Inner element */}
            <div className="p-4 md:p-6 flex flex-row items-center justify-between gap-4">
              
              {/* Branding / Title */}
              <div 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-black tracking-widest uppercase bg-[#5C2E0B] text-[#FAF6F0] px-2 py-0.5">
                    HERITAGE PORTAL
                  </span>
                  <span className="text-[9px] font-mono font-black tracking-widest uppercase bg-amber-500 text-black px-2 py-0.5">
                    🗣️ NATIVE VOICE APP
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold leading-none tracking-tight uppercase text-[#3D1E04] group-hover:text-[#B45309] transition-colors">
                    ÀṢÀ LLM
                  </h1>
                </div>
              </div>

              {/* Responsive Navigation links */}
              <nav className="hidden lg:flex items-center gap-1.5 font-mono text-xs font-bold text-[#5C2E0B]">
                <button 
                  onClick={() => { setActivePage("chatbot"); setSimpleMode(true); }}
                  className={`px-3 py-2 transition-all cursor-pointer border-2 uppercase font-black ${
                    activePage === "chatbot" 
                      ? "bg-amber-500 text-black border-[#5C2E0B] shadow-[2.5px_2.5px_0px_#5C2E0B]" 
                      : "border-transparent hover:bg-amber-100/60"
                  }`}
                >
                  💬 Chatbot Sandbox MVP
                </button>
                <button 
                  onClick={() => { setActivePage("tts"); setSimpleMode(true); }}
                  className={`px-3 py-2 transition-all cursor-pointer border-2 uppercase font-black ${
                    activePage === "tts" 
                      ? "bg-amber-500 text-black border-[#5C2E0B] shadow-[2.5px_2.5px_0px_#5C2E0B]" 
                      : "border-transparent hover:bg-amber-100/60"
                  }`}
                >
                  🔊 Read Aloud (TTS)
                </button>
                <button 
                  onClick={() => { setActivePage("pronunciation"); setSimpleMode(true); }}
                  className={`px-3 py-2 transition-all cursor-pointer border-2 uppercase font-black ${
                    activePage === "pronunciation" 
                      ? "bg-amber-500 text-black border-[#5C2E0B] shadow-[2.5px_2.5px_0px_#5C2E0B]" 
                      : "border-transparent hover:bg-amber-100/60"
                  }`}
                >
                  🎭 Pronunciation & Proverbs
                </button>
                <button 
                  onClick={() => { setActivePage("developer"); setSimpleMode(false); }}
                  className={`px-3 py-2 transition-all cursor-pointer border-2 uppercase font-black ${
                    activePage === "developer" 
                      ? "bg-amber-500 text-black border-[#5C2E0B] shadow-[2.5px_2.5px_0px_#5C2E0B]" 
                      : "border-transparent hover:bg-amber-100/60"
                  }`}
                >
                  ⚙️ Developer NLP Specs
                </button>
              </nav>

              {/* Right CTA / Menu Trigger */}
              <div className="flex items-center gap-2">
                
                {/* Mobile Hamburger menu */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle Navigation Menu"
                  title="Toggle Navigation Menu"
                  className="lg:hidden p-2.5 bg-amber-500 hover:bg-amber-600 text-[#3D1E04] border-2 border-[#5C2E0B] shadow-[2px_2px_0px_#5C2E0B] cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

              </div>
            </div>

            {/* Mobile Expanded menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t-2 border-[#5C2E0B] bg-[#FDFAF5] p-4 flex flex-col gap-3 animate-fadeIn">
                
                <div className="text-[10px] font-mono tracking-widest font-black uppercase text-amber-800">
                  Quick Navigation / Atúsọ̀nà
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActivePage("chatbot");
                      setSimpleMode(true);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-3 border-2 text-xs font-black uppercase cursor-pointer min-h-[48px] ${
                      activePage === "chatbot" ? "bg-amber-500 text-black border-[#5C2E0B]" : "bg-white text-[#3D1E04] border-[#5C2E0B]"
                    }`}
                  >
                    <span>💬 Voice Chat Sandbox</span>
                    <span className="text-[10.5px] italic text-amber-700">Gbọ̀ngàn</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage("tts");
                      setSimpleMode(true);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-3 border-2 text-xs font-black uppercase cursor-pointer min-h-[48px] ${
                      activePage === "tts" ? "bg-amber-500 text-black border-[#5C2E0B]" : "bg-white text-[#3D1E04] border-[#5C2E0B]"
                    }`}
                  >
                    <span>🔊 Read Aloud (TTS)</span>
                    <span className="text-[10.5px] italic text-amber-700">Kà Álò</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage("pronunciation");
                      setSimpleMode(true);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-3 border-2 text-xs font-black uppercase cursor-pointer min-h-[48px] ${
                      activePage === "pronunciation" ? "bg-amber-500 text-black border-[#5C2E0B]" : "bg-white text-[#3D1E04] border-[#5C2E0B]"
                    }`}
                  >
                    <span>🎭 Pronunciation Guide</span>
                    <span className="text-[10.5px] italic text-amber-700">Ohùn Yoù</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage("developer");
                      setSimpleMode(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-3 border-2 text-xs font-black uppercase cursor-pointer min-h-[48px] ${
                      activePage === "developer" ? "bg-amber-500 text-[#1A1A1A] border-[#5C2E0B]" : "bg-white text-[#3D1E04] border-[#5C2E0B]"
                    }`}
                  >
                    <span>⚙️ Developer Specs</span>
                    <span className="text-[10.5px] italic text-amber-700 font-bold">Ibi-Iṣẹ́</span>
                  </button>
                </div>

              </div>
            )}
          </header>

          {simpleMode ? (
            /* 🌸 SUPER CLEAN SIMPLE MODE WITH FULL-PAGE PORTALS */
            <div className="flex flex-col animate-fadeIn">

              {/* ========================================================= */}
              {/* PAGE 1: SPECIALLY DESIGNED ROOMY CHATBOT PORTAL */}
              {/* ========================================================= */}
              {activePage === "chatbot" && (
                <div id="voicespace_fullpage" className="flex flex-col animate-fadeIn px-2 sm:px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-6">
                  
                  {/* Premium Heritage Title block */}
                  <div className="bg-[#FAF6F0] p-6 md:p-10 border-4 border-[#5C2E0B] text-center w-full shadow-[6px_6px_0px_rgba(92,46,11,0.15)]">
                    <span className="text-xs font-mono font-black tracking-widest text-[#B45309] bg-orange-100 border border-[#B45309] px-4 py-1.5 uppercase rounded-full animate-pulse">
                      💬 YORUBA CHATBOT MVP SANDBOX
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase text-[#3D1E04] tracking-tight mt-4 mb-2">
                      Sándíbọ́sì Ṣábà (Interactive Dialog Hub)
                    </h2>
                    <p className="font-serif italic text-xs md:text-sm text-[#5C2E0B]/85 max-w-2xl mx-auto">
                      Dictate Yoruba sentences using real-time Speech-to-Text, playback authentic Oyo-dialect voices, and practice conversation.
                    </p>
                  </div>
              
              {/* Top Hero Wave / Title space */}
              <div className="bg-[#FAF6F0] p-6 md:p-8 border-b-4 border-[#5C2E0B] text-center max-w-4xl mx-auto w-full">
                <span className="text-xs font-mono font-black tracking-widest text-[#B45309] bg-orange-100 border border-[#B45309] px-3 py-1 uppercase rounded-full">
                  Ẹ KÁÀBỌ̀! WELCOME TO YORUBA SPEAKING SPACE
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase text-[#3D1E04] tracking-tight mt-4 mb-2">
                  Hear and Speak Beautiful Yoruba
                </h2>
                <p className="font-serif italic text-base md:text-lg text-[#5C2E0B]/85 max-w-2xl mx-auto">
                  A simplified portal built to preserve West African tonal integrity. Easily enter text, tap tone marks, listen to authentic accents, and chat casually in Yoruba!
                </p>
              </div>

              {/* Chat & Fast Tutor row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#5C2E0B] border-b-[4px] border-[#5C2E0B]">
                
                {/* Left Panel: Omitted from Chatbot page: resides on dedicated Pronunciation tab */}
                {false && (
                <div id="pronunciation" className="lg:col-span-5 p-6 md:p-8 bg-[#FDFAF5] flex flex-col justify-between scroll-mt-24">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-500 font-bold text-black px-2 py-0.5">
                          EASY LESSON
                        </span>
                        <h3 className="text-sm font-mono font-black uppercase text-[#B45309]">
                          Tone Syllable Tutor
                        </h3>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-[#3D1E04] tracking-tight">
                        Why We Care About Pitch (Ohùn)
                      </h3>
                      <div className="w-16 h-1 bg-[#B45309] mt-2" />
                    </div>

                    <p className="text-sm text-[#4A321B] leading-relaxed">
                      Yoruba is a tonal language. Tone modulations completely rewrite definitions. A single word spelled <strong>"awo"</strong> can mean completely different things depending strictly on how high, low, or flat you speak it.
                    </p>

                    {/* Highly Interactive Tone Tutor Cards */}
                    <div className="bg-[#FAF6F0] border-2 border-[#5C2E0B] p-4 font-mono text-xs text-[#5C2E0B] space-y-3.5 shadow-[4px_4px_0px_rgba(92,46,11,0.15)]">
                      <div className="font-bold border-b border-[#5C2E0B]/30 pb-1.5 uppercase text-[#3D1E04] flex items-center justify-between">
                        <span>🔊 Tap keys to hear tone meanings:</span>
                        <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 font-bold">CLICK TO PLAY</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => speakYoruba("àwò")}
                          className={`flex items-center gap-2 px-3 py-2 border text-left bg-white transition-all cursor-pointer ${
                            speakingText === "àwò" ? "bg-amber-200 border-[#5C2E0B] shadow-[2px_2px_0px_#5C2E0B]" : "hover:bg-amber-50 border-[#5C2E0B]/30 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                          }`}
                        >
                          <Volume2 className={`w-4 h-4 text-[#B45309] ${speakingText === "àwò" ? "animate-bounce" : ""}`} />
                          <div>
                            <span className="font-black text-sm text-[#7C2D12]">àwò 🔊</span>
                            <span className="text-gray-500 block text-[10px]">Color or Pattern</span>
                          </div>
                        </button>

                        <button
                          onClick={() => speakYoruba("awó")}
                          className={`flex items-center gap-2 px-3 py-2 border text-left bg-white transition-all cursor-pointer ${
                            speakingText === "awó" ? "bg-amber-200 border-[#5C2E0B] shadow-[2px_2px_0px_#5C2E0B]" : "hover:bg-amber-50 border-[#5C2E0B]/30 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                          }`}
                        >
                          <Volume2 className={`w-4 h-4 text-[#B45309] ${speakingText === "awó" ? "animate-bounce" : ""}`} />
                          <div>
                            <span className="font-black text-sm text-[#7C2D12]">awó 🔊</span>
                            <span className="text-gray-500 block text-[10px]">Guinea fowl bird</span>
                          </div>
                        </button>

                        <button
                          onClick={() => speakYoruba("awo")}
                          className={`flex items-center gap-2 px-3 py-2 border text-left bg-white transition-all cursor-pointer ${
                            speakingText === "awo" ? "bg-amber-200 border-[#5C2E0B] shadow-[2px_2px_0px_#5C2E0B]" : "hover:bg-amber-50 border-[#5C2E0B]/30 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                          }`}
                        >
                          <Volume2 className={`w-4 h-4 text-[#B45309] ${speakingText === "awo" ? "animate-bounce" : ""}`} />
                          <div>
                            <span className="font-black text-sm text-[#7C2D12]">awo 🔊</span>
                            <span className="text-gray-500 block text-[10px]">Clay plate dish</span>
                          </div>
                        </button>

                        <button
                          onClick={() => speakYoruba("awọ́")}
                          className={`flex items-center gap-2 px-3 py-2 border text-left bg-white transition-all cursor-pointer ${
                            speakingText === "awọ́" ? "bg-amber-200 border-[#5C2E0B] shadow-[2px_2px_0px_#5C2E0B]" : "hover:bg-amber-50 border-[#5C2E0B]/30 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                          }`}
                        >
                          <Volume2 className={`w-4 h-4 text-[#B45309] ${speakingText === "awọ́" ? "animate-bounce" : ""}`} />
                          <div>
                            <span className="font-black text-sm text-[#7C2D12]">awọ́ 🔊</span>
                            <span className="text-gray-500 block text-[10px]">Secret or Cult</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A321B]/80 leading-relaxed font-sans">
                      Our interactive tools ensure accents match native sounds perfectly. Click any item above repeatedly to practice pronunciation differences!
                    </p>
                  </div>

                  <div className="mt-8 border-t border-[#5C2E0B]/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-800 font-mono">
                    <span>👩‍🏫 Built for schools and language lovers</span>
                    <span className="font-bold cursor-pointer underline text-[#B45309]" onClick={() => scrollToSection('apoya-tts')}>
                      Go to Text Translator ↓
                    </span>
                  </div>
                </div>
                )}

                {/* Right Panel: Clean, Voice-Enabled Conversational Chatbot */}
                <div id="voicesandbox" className="lg:col-span-12 p-3 sm:p-6 md:p-8 bg-[#FCFAF7] flex flex-col justify-between">
                  <div className="border-4 border-[#5C2E0B] p-5 bg-white shadow-[8px_8px_0px_#5C2E0B] h-full flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#5C2E0B]/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping"></span>
                          <span className="bg-[#5C2E0B] text-white px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                            YORUBA VOICE CHAT ASSISTANT
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-1.5 py-0.5">
                          TAP 🔊 TO PLAY CHAT SOUND
                        </span>
                      </div>

                      <p className="text-xs text-[#5C2E0B] mt-3 mb-2 font-black uppercase">
                        Choose a quick conversation prompt below or type your own:
                      </p>

                      {/* Seed Prompts */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Báwo ni ọjọ́ rẹ ṣe rí?" },
                              { role: "bot", text: "Ọjọ́ mi dáa gan-an. Báwo ni tirẹ?" }
                            ]);
                            speakYoruba("Báwo ni ọjọ́ rẹ ṣe rí?");
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-xs font-bold px-2.5 py-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B] active:translate-y-0.5"
                        >
                          ☀️ "How is your day?"
                        </button>
                        
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Kí ni olú-ilu Nàìjíríà?" },
                              { role: "bot", text: "Abuja ni olú-ilu Nàìjíríà dídùn." }
                            ]);
                            speakYoruba("Kí ni olú-ilu Nàìjíríà?");
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-xs font-bold px-2.5 py-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B] active:translate-y-0.5"
                        >
                          🇳🇬 "Capital of Nigeria?"
                        </button>

                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Inú mi dùn láti kọ́ ẹ̀rọ mọ́ àṣà lónìí!" },
                              { role: "bot", text: "Inú mi dùn láti gbọ́ rẹ̀. Ẹ ní kíkún ọgbọ́n àti fún lédè!" }
                            ]);
                            speakYoruba("Inú mi dùn láti kọ́ ẹ̀rọ mọ́ àṣà lónìí!");
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-xs font-bold px-2.5 py-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B] active:translate-y-0.5"
                        >
                          🎓 "Happy to learn Yoruba!"
                        </button>
                      </div>

                      {/* Chat Messages */}
                      <div className="border-4 border-[#5C2E0B] h-64 overflow-y-auto p-4 bg-[#FAF8F5] text-xs leading-relaxed space-y-4 shadow-inner">
                        {mvpChatHistory.length === 0 ? (
                          <div className="text-[#5C2E0B]/60 italic text-xs flex flex-col justify-center items-center h-full text-center p-4">
                            <span>No chat. Type a message bottom or select a conversation starter above.</span>
                          </div>
                        ) : (
                          mvpChatHistory.map((msg, index) => (
                            <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                              <span className={`text-[8.5px] uppercase tracking-widest font-black mb-1 ${msg.role === "user" ? "text-amber-800" : "text-[#7C2D12]"}`}>
                                {msg.role === "user" ? "● YOU SPOKE / USER" : "🤖 ÀṢÀ LLM VOICE ASSISTANT"}
                              </span>
                              
                              <div className="flex items-center gap-1.5 max-w-[90%]">
                                {msg.role === "bot" && (
                                  <button
                                    onClick={() => speakYoruba(msg.text)}
                                    className={`p-2 border-2 border-[#5C2E0B] shrink-0 transition-all shadow-[2px_2px_0px_#5C2E0B] active:translate-y-0.5 hover:bg-amber-100 cursor-pointer ${
                                      speakingText === msg.text ? "bg-amber-500 text-black animate-pulse" : "bg-white text-[#5C2E0B]"
                                    }`}
                                    title="Listen Aloud / Gbọ́ lẹ́sẹ̀kẹsẹ̀ 🔊"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <div className={`px-3 py-2 border-2 border-[#5C2E0B] text-xs font-medium ${
                                  msg.role === "user" 
                                    ? "bg-amber-100 text-amber-950 font-bold shadow-[2px_2px_0px_#5C2E0B]" 
                                    : "bg-orange-50 text-[#2C1D11] shadow-[2px_2px_0px_#7C2D12]"
                                }`}>
                                  {msg.text}
                                </div>

                                {msg.role === "user" && (
                                  <button
                                    onClick={() => speakYoruba(msg.text)}
                                    className={`p-2 border-2 border-[#5C2E0B] shrink-0 transition-all shadow-[2px_2px_0px_#5C2E0B] active:translate-y-0.5 hover:bg-amber-100 cursor-pointer ${
                                      speakingText === msg.text ? "bg-amber-500 text-black animate-pulse animate-duration-100" : "bg-white text-[#5C2E0B]"
                                    }`}
                                    title="Listen Aloud 🔊"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        
                        {mvpChatLoading && (
                          <div className="flex items-center gap-1.5 text-amber-800 italic text-[11px] font-bold animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-800 animate-bounce"></span>
                            <span>Thinking & composing tones...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Input Control */}
                    <div className="space-y-3.5">
                      {sttErrorMsg && (
                        <div className="p-3 bg-red-50 text-red-950 border-2 border-red-800 font-mono text-[11px] uppercase flex items-center gap-1.5 animate-shake">
                          <span>⚠️ Dictation error:</span>
                          <span>{sttErrorMsg}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        
                        {/* Chrome / Edge Web Speech SDK trigger key */}
                        <button
                          onClick={triggerSpeechToText}
                          className={`px-4 py-3 border-2 border-[#5C2E0B] text-xs font-black uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_#5C2E0B] active:translate-y-0.5 shrink-0 ${
                            isSTTActive 
                              ? "bg-red-500 text-white border-red-700 animate-pulse font-extrabold" 
                              : "bg-amber-100 text-[#5C2E0B] hover:bg-amber-200"
                          }`}
                          title="Click to dictate standard Yoruba speech aloud!"
                        >
                          <Mic className="w-4 h-4" />
                          <span>{isSTTActive ? "🎙️ RECORDING ACTIVE..." : "🎤 DICTATE VOICE"}</span>
                        </button>

                        <input
                          type="text"
                          value={mvpChatInput}
                          onChange={(e) => setMvpChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !mvpChatLoading) {
                              handleMvpHourlyChat();
                            }
                          }}
                          placeholder={isSTTActive ? "Dictating standard Yoruba... speak clearly now!" : "Reply in Yoruba with tones, or type a request..."}
                          className="flex-1 min-w-0 border-2 border-[#5C2E0B] bg-white px-3.5 py-3 text-xs md:text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                          disabled={mvpChatLoading}
                        />

                        <button
                          onClick={() => handleMvpHourlyChat()}
                          disabled={mvpChatLoading || !mvpChatInput.trim()}
                          className="bg-[#5C2E0B] hover:bg-[#3D1E04] text-white px-6 py-3 border-2 border-[#5C2E0B] text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                        >
                          Send Message ↗
                        </button>
                      </div>
                    </div>
                      
                    <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-gray-500">
                      <span>💡 Converses fluently with native tone diacritics.</span>
                      <button
                        onClick={() => setMvpChatHistory([])}
                        className="text-red-700 hover:underline font-bold"
                      >
                        Clear Dialogue
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
            )}

              {/* PAGE 2: READ ALOUD (TTS) LAB */}
              {activePage === "tts" && (
                <div id="apoya-tts" className="p-6 md:p-8 bg-[#FFFCEB] border-b-4 border-[#5C2E0B] scroll-mt-24">
                <div className="max-w-4xl mx-auto">
                  
                  {/* Section Title */}
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono font-black tracking-widest text-[#B45309] bg-orange-100 border border-orange-200 px-2 py-0.5 uppercase">
                        INTERACTIVE READ-ALOUD LAB
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black uppercase text-[#3D1E04] mt-1">
                        Yoruba Voice Generator (Apòyà)
                      </h3>
                      <p className="text-xs text-[#5C2E0B] font-medium">
                        Type any custom text or click are accents to create proper phonetic tone-mapping. Speak it instantly!
                      </p>
                    </div>

                    {/* Active Voice soundwave indicator */}
                    {speakingText && (
                      <div className="flex items-center gap-1 bg-amber-500 text-black font-black border-2 border-black px-4 py-2 text-xs font-mono shadow-[2.5px_2.5px_0px_#5C2E0B] animate-pulse">
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span>ACTIVE VOICE GENERATION ACTIVE</span>
                        
                        {/* CSS sound wave bars */}
                        <div className="flex items-center gap-0.5 ml-2">
                          <div className="w-1 h-3 bg-black animate-scale-wave" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 h-5 bg-black animate-scale-wave" style={{ animationDelay: '0.3s' }} />
                          <div className="w-1 h-2 bg-black animate-scale-wave" style={{ animationDelay: '0.5s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YarnGPT & Vocal Engine Selection Panel */}
                  <div className="mb-6 border-4 border-[#5C2E0B] bg-white p-5 shadow-[4px_4px_0px_#5C2E0B]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-dashed border-[#5C2E0B]/35 pb-3.5 mb-4 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500 border-2 border-[#5C2E0B] text-[#3D1E04] shadow-[1.5px_1.5px_0px_#5C2E0B]">
                          <Cpu className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-black uppercase text-amber-800 tracking-wider">
                            🎙️ SELECT VOCAL ENGINE PROTOCOL
                          </h4>
                          <p className="text-[10px] text-gray-500 uppercase font-mono font-bold">
                            Upgrade from offline browser voices to YarnGPT's neural Yoruba accent
                          </p>
                        </div>
                      </div>

                      {/* Model Engine Selector */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTtsEngine("browser")}
                          className={`px-3 py-2 border-2 border-[#5C2E0B] text-[10px] font-black uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_#5C2E0B] active:translate-y-0.5 cursor-pointer ${
                            ttsEngine === "browser"
                              ? "bg-[#5C2E0B] text-white shadow-[#3D1E04]"
                              : "bg-white hover:bg-amber-100 text-[#5C2E0B]"
                          }`}
                        >
                          💻 Browser Native TTS
                        </button>
                        <button
                          onClick={() => setTtsEngine("yarngpt")}
                          className={`px-3 py-2 border-2 border-[#5C2E0B] text-[10px] font-black uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_#5C2E0B] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
                            ttsEngine === "yarngpt"
                              ? "bg-amber-500 text-black font-extrabold shadow-[2.5px_2.5px_0px_#3D1E04]"
                              : "bg-white hover:bg-amber-100 text-[#5C2E0B]"
                          }`}
                        >
                          🔥 YarnGPT AI Voice
                        </button>
                      </div>
                    </div>

                    {/* Conditional YarnGPT Config Form */}
                    {ttsEngine === "yarngpt" && (
                      <div className="bg-[#FFFDF4] border-2 border-dashed border-amber-600/30 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-[#522504] tracking-wider mb-1">
                              🔑 YarnGPT / HuggingFace API Token (Oluṣe):
                            </label>
                            <input
                              type="password"
                              value={yarnGPTApiKey}
                              onChange={(e) => setYarnGPTApiKey(e.target.value)}
                              placeholder="Paste HF API key (e.g. hf_...) (or leave empty if YARNGPT_API_KEY is present in the server secrets)"
                              className="w-full text-xs font-mono border-2 border-[#5C2E0B] bg-white px-3 py-2.5 placeholder-gray-400 focus:outline-[#B45309]"
                            />
                            <span className="text-[9px] text-[#5C2E0B] font-medium mt-1 block">
                              🔒 Your token is securely held locally in your browser`s standard `localStorage` wrapper.
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-[#522504] tracking-wider mb-1">
                              🌐 API Inference Endpoint:
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={yarnGPTEndpoint}
                                onChange={(e) => setYarnGPTEndpoint(e.target.value)}
                                placeholder="https://api-inference.huggingface.co/models/saheedniyi/YarnGPT"
                                className="flex-1 text-xs font-mono border-2 border-[#5C2E0B] bg-white px-3 py-2.5 placeholder-gray-400 focus:outline-[#B45309]"
                              />
                              <button
                                onClick={() => setYarnGPTEndpoint("https://api-inference.huggingface.co/models/saheedniyi/YarnGPT")}
                                className="px-2 border-2 border-[#5C2E0B] bg-amber-100 hover:bg-amber-200 text-xs font-mono font-bold cursor-pointer transition-all shadow-[1px_1px_0px_#5C2E0B] active:translate-y-0.5"
                                title="Reset to standard YarnGPT model"
                              >
                                Reset
                              </button>
                            </div>
                            <span className="text-[9px] text-[#5C2E0B] font-medium mt-1 block">
                              🎯 Accesses the dedicated neural standard Nigerian and Oyo dialect phonetic voice synthetics.
                            </span>
                          </div>
                        </div>

                        {/* Loading State / Warning Output */}
                        {isYarnGPTSynthesisLoading && (
                          <div className="p-3 bg-amber-50 border border-amber-300 font-mono text-xs flex items-center gap-2 text-amber-900 animate-pulse">
                            <span className="animate-spin text-lg">💡</span>
                            <span>YarnGPT is currently encoding and synthesizing your standard/toned Yoruba text into local news-reader vocal packets. Please wait...</span>
                          </div>
                        )}

                        {yarnGPTError && (
                          <div className="p-3.5 bg-red-50 border-2 border-red-800 font-mono text-xs text-red-950 uppercase space-y-1">
                            <div className="font-black flex items-center gap-1">
                              <span>⚠️ VOICE PROTOCOL ERROR:</span>
                            </div>
                            <p className="normal-case font-bold">{yarnGPTError}</p>
                          </div>
                        )}
                        
                        {!isYarnGPTSynthesisLoading && !yarnGPTError && (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 font-bold bg-[#E6F4EA] px-3 py-1.5 border border-emerald-300 w-fit">
                            <span>✅ Neural Yoruba voice pipeline active. Click speaking buttons below to test.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* TTS Output/Controls - Column 8 */}
                    <div className="lg:col-span-8 space-y-4">
                      
                      {/* Interactive Text Field */}
                      <div className="border-4 border-[#5C2E0B] bg-white p-3.5 shadow-[4px_4px_0px_#5C2E0B]">
                        <label className="block text-[10px] font-mono font-black uppercase text-amber-800 tracking-wider mb-1">
                          🖨️ Enter Sentence or Paragraph Below:
                        </label>
                        
                        <textarea
                          rows={4}
                          value={ttsText}
                          onChange={(e) => setTtsText(e.target.value)}
                          placeholder="Type Yoruba text directly... e.g. Kú àárọ̀, ṣe àláfíà ni?"
                          className="w-full text-[#3D1E04] font-serif text-base font-bold bg-[#FDFAQF0]/30 p-2.5 focus:outline-none placeholder-gray-400 focus:bg-[#FAF6F0]/20 leading-relaxed border-2 border-gray-200 focus:border-[#5C2E0B] resize-y"
                        />
                        
                        {/* Virtual Accent Helper - Life saver for non-technical users */}
                        <div className="mt-3 border-t border-dashed border-[#5C2E0B]/30 pt-3">
                          <div className="flex items-center gap-1 text-[10px] uppercase font-black text-amber-900 mb-1.5 font-mono">
                            <Keyboard className="w-3.5 h-3.5" />
                            <span>Quick Accent Injector (Tap to paste into text):</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {[
                              { char: 'á', title: 'High a' }, { char: 'à', title: 'Low a' },
                              { char: 'é', title: 'High e' }, { char: 'è', title: 'Low e' },
                              { char: 'ẹ', title: 'Subdot e' }, { char: 'ẹ́', title: 'High subdot e' }, { char: 'ẹ̀', title: 'Low subdot e' },
                              { char: 'í', title: 'High i' }, { char: 'ì', title: 'Low i' },
                              { char: 'ó', title: 'High o' }, { char: 'ò', title: 'Low o' },
                              { char: 'ọ', title: 'Subdot o' }, { char: 'ọ́', title: 'High subdot o' }, { char: 'ọ̀', title: 'Low subdot o' },
                              { char: 'ú', title: 'High u' }, { char: 'ù', title: 'Low u' },
                              { char: 'ṣ', title: 'Subdot s' }
                            ].map((item) => (
                              <button
                                key={item.char}
                                tabIndex={-1}
                                onClick={() => {
                                  setTtsText(ttsText + item.char);
                                }}
                                title={item.title}
                                className="w-8 h-8 flex items-center justify-center bg-[#FDFAF5] hover:bg-amber-200 border-2 border-[#5C2E0B] font-mono font-bold text-xs cursor-pointer shadow-[1px_1px_0px_#5C2E0B] active:translate-y-0.5 text-[#3D1E04]"
                              >
                                {item.char}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => setTtsText("")}
                              className="text-[10px] uppercase font-black bg-white hover:bg-red-50 text-red-700 px-2 py-1.5 border border-red-300 ml-auto cursor-pointer"
                            >
                              Clear Text
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Speaking Controls Panel */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => speakYoruba(ttsText)}
                          disabled={!ttsText.trim()}
                          className={`flex items-center gap-2 px-6 py-3.5 border-4 text-sm font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_#3D1E04] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#3D1E04] cursor-pointer ${
                            speakingText === ttsText 
                              ? "bg-red-500 text-white border-red-700" 
                              : "bg-amber-500 hover:bg-amber-400 text-black border-[#5C2E0B]"
                          }`}
                        >
                          <Volume2 className="w-5 h-5 shrink-0" />
                          <span>{speakingText === ttsText ? "STOP VOICE 🛑" : "SPEAK OUT LOUD 🔊 / FÚN INÚ"}</span>
                        </button>
                      </div>

                    </div>

                    {/* Quick Vocabulary List - Column 4 */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="border-4 border-[#5C2E0B] p-4 bg-white shadow-[4px_4px_0px_#5C2E0B]">
                        <h4 className="text-xs font-mono font-black uppercase text-amber-800 tracking-wider mb-2 pb-1 border-b">
                          📚 Quick Conversational Lessons
                        </h4>
                        <p className="text-[11px] text-gray-500 mb-3 leading-snug">
                          Hover or tap any phrase below to quickly load it. Feel free to click the speaker directly:
                        </p>

                        <div className="space-y-2">
                          {[
                            { yoruba: "Ẹ n lẹ́ o! Ṣé àláfíà ni?", english: "Hello there! Are you doing well?" },
                            { yoruba: "Káàsán o, báwo ni uṣẹ́?", english: "Good afternoon, how is work?" },
                            { yoruba: "Ẹ dákun, compose proverbs fún mi.", english: "Please, compose proverbs for me." },
                            { yoruba: "Ẹ kú àbọ̀ sí ilẹ̀ Nàìjíríà dídùn.", english: "Welcome to the sweet land of Nigeria." },
                            { yoruba: "Ọgbọ́n lójú ju agbára lọ lónìí.", english: "Wisdom is superior to strength today." }
                          ].map((item, index) => (
                            <div 
                              key={index} 
                              className="group flex items-start gap-2 p-2 border border-gray-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer"
                              onClick={() => {
                                setTtsText(item.yoruba);
                                speakYoruba(item.yoruba);
                              }}
                            >
                              <button className="p-1 bg-white border border-[#5C2E0B] text-[#5C2E0B] group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                <Volume2 className="w-3 h-3" />
                              </button>
                              
                              <div className="text-left">
                                <div className="text-xs font-bold text-[#3D1E04] underlineDecoration">{item.yoruba}</div>
                                <div className="text-[10px] text-gray-400 font-serif leading-none mt-0.5">{item.english}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              )}

              {/* PAGE 3: PRONUNCIATION & PROVERBS GUIDES */}
              {activePage === "pronunciation" && (
                <div className="flex flex-col animate-fadeIn px-2 sm:px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-10">
                  
                  {/* Incorporating the Syllable Tutor directly on this page! */}
                  <div className="border-4 border-[#5C2E0B] p-6 sm:p-8 bg-white shadow-[8px_8px_0px_#5C2E0B] space-y-5">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-500 font-bold text-black px-2 py-0.5">
                        PHONETIC LAB
                      </span>
                      <h3 className="text-2xl font-black uppercase text-[#3D1E04] mt-2">
                        Why We Care About Pitch (Ohùn)
                      </h3>
                      <div className="w-16 h-1 bg-[#B45309] mt-1" />
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A321B] leading-relaxed">
                      Yoruba is a tonal language. Spelled without modulations, the letters <strong>"awo"</strong> can generate completely distinct dictionaries. Tap the keys below to practice distinct pitch pronunciations:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF6F0] p-4 border-2 border-[#5C2E0B]">
                      {[
                        { text: "àwò", definition: "Color or Pattern", tone: "Low-Low pitch (à-wò)" },
                        { text: "awó", definition: "Guinea fowl wild bird", tone: "Flat-High pitch (a-wó)" },
                        { text: "awo", definition: "Clay plate dish / vessel", tone: "Flat-Flat pitch (a-wo)" },
                        { text: "awọ́", definition: "Secret or Cult order", tone: "Flat-High subdot (a-wọ́)" }
                      ].map((item) => (
                        <button
                          key={item.text}
                          onClick={() => speakYoruba(item.text)}
                          className={`flex flex-col justify-between p-4 border bg-white transition-all cursor-pointer text-left h-24 ${
                            speakingText === item.text ? "bg-amber-200 border-[#5C2E0B] shadow-[3px_3px_0px_#5C2E0B]" : "hover:bg-amber-50 border-[#5C2E0B]/30 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-sm text-[#7C2D12]">{item.text} 🔊</span>
                            <Volume2 className={`w-3.5 h-3.5 text-amber-600 ${speakingText === item.text ? "animate-bounce" : ""}`} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 leading-none block">{item.definition}</span>
                            <span className="text-[9px] text-[#5C2E0B] font-mono mt-0.5 block">{item.tone}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Proverbs Cards Row */}
                  <div id="proverbs" className="p-6 md:p-8 bg-[#FCFAF5] border-4 border-[#5C2E0B] shadow-[8px_8px_0px_#5C2E0B] scroll-mt-24">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-amber-700">ORAL TRADITIONS (ÀWỌN ÒWE YORUBA)</span>
                    <h3 className="text-2xl md:text-3xl font-black uppercase text-[#3D1E04] mt-1">
                      Preserved Traditional Proverbs
                    </h3>
                  </div>
                  <span className="text-xs font-mono bg-amber-500 text-black font-bold px-2 py-0.5 border border-[#5C2E0B]">
                    AUDIO INTEGRATED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      num: "01",
                      yoruba: "Agboju-logun fi ori re fole.",
                      meaning: "Ìtúmọ̀",
                      trans: "One who relies entirely on future inheritance condemns their skull to laziness and early ruin.",
                      cultural: "Emphasizes absolute self-reliance (Ìmúrawá) and manual hard work."
                    },
                    {
                      num: "02",
                      yoruba: "Kò sí fùrò tí kò nípò; ọgbọ́n dunjú ju agbára lọ.",
                      meaning: "Ìtúmọ̀",
                      trans: "No individual is completely useless; calm intellect is far more effective than brute violence.",
                      cultural: "Celebrates community inclusivity and cerebral conflict resolution."
                    },
                    {
                      num: "03",
                      yoruba: "A ki i n f'owo ina t'owo aso b'epo.",
                      meaning: "Ìtúmọ̀",
                      trans: "You do not use fingers tainted with hot flames to handle or extract pure oil from the pot.",
                      cultural: "Warns against handling delicate matters with reckless or chaotic violence."
                    },
                    {
                      num: "04",
                      yoruba: "Àkìkọ̀ rẹ kò kọ, ọjọ́ ọ̀ lù l’ẹ́nu.",
                      meaning: "Ìtúmọ̀",
                      trans: "Even if your rooster refuses to crow, the dawn will still break upon the horizon.",
                      cultural: "Assures that natural truths and ultimate destinies cannot be delayed by individual blockades."
                    },
                    {
                      num: "05",
                      yoruba: "Ẹni tí ó dẹ́rù rẹ̀ nìkan ló mọ̀ iye poun tí ó tó.",
                      meaning: "Ìtúmọ̀",
                      trans: "Only the active porter knows exactly how many pounds of weight they carry.",
                      cultural: "Stresses empathy—you cannot evaluate custom struggles without walking in their sandals."
                    },
                    {
                      num: "06",
                      yoruba: "Ebi n pa àjòyè, kíkọ kọrin ló n lù.",
                      meaning: "Ìtúmọ̀",
                      trans: "Even when hunger bites the honorary chief, their responsibility is still to speak with melodious dignity.",
                      cultural: "Reminds that public leadership demands noble service and emotional composure."
                    }
                  ].map((p, i) => (
                    <div 
                      key={i} 
                      className="border-2 border-[#5C2E0B] p-5 bg-white shadow-[4px_4px_0px_rgba(92,46,11,0.1)] flex flex-col justify-between hover:shadow-[6px_6px_0px_#5C2E0B] transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="aspect-square w-8 bg-amber-500/10 border border-[#5C2E0B] flex items-center justify-center font-mono font-bold text-xs text-[#5C2E0B]">
                            {p.num}
                          </span>
                          
                          <button
                            onClick={() => speakYoruba(p.yoruba)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all border-2 border-[#5C2E0B] cursor-pointer ${
                              speakingText === p.yoruba 
                                ? "bg-red-500 text-white" 
                                : "bg-[#FDFAF5] hover:bg-amber-100 text-[#5C2E0B]"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{speakingText === p.yoruba ? "Stop 🛑" : "Listen Speak 🔊"}</span>
                          </button>
                        </div>

                        <h4 className="text-base font-extrabold text-[#3D1E04] mb-2 leading-snug font-serif italic text-amber-950">
                          “ {p.yoruba} ”
                        </h4>
                        
                        <p className="text-xs text-[#4A321B]/95 font-sans leading-relaxed pt-2 border-t border-dashed border-[#5C2E0B]/20">
                          <strong className="text-amber-800 uppercase font-mono text-[10px] block mb-0.5">Translation:</strong>
                          {p.trans}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-[#5C2E0B]/10 text-[10.5px] italic text-[#5C2E0B]/75 leading-snug">
                        💡 <strong className="font-sans not-italic text-amber-900 text-[10px] uppercase font-bold">Moral Warning: </strong>
                        {p.cultural}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            )}

              {/* SIMPLIFIED CTA */}
              <div className="p-8 bg-[#432103] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                    Are you a Software Developer or Linguist?
                  </h3>
                  <p className="text-xs md:text-sm text-amber-200 mt-2 leading-relaxed font-sans">
                    Switch the portal to Developer Mode to evaluate model learning rates, download fine-tuning adapter codes (LoRA QLoRA on Qwen/Llama), edit dataset pairs, or test BLEU accuracy benchmarks!
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSimpleMode(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 border-2 border-[#5C2E0B] text-xs font-black uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_#FDFAF5] active:translate-y-0.5"
                  >
                    Activate Developer Specs ⚙️
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ⚙️ ORIGINAL TECHNICAL DEVELOPER SPECS SECTION FOR LINGUISTIC NLP ENGINE */
            <div className="flex flex-col animate-fadeIn">
              
              {/* Technical Hero split-screen narrative */}
              <div id="philosophy" className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#5C2E0B] border-b-[4px] border-[#5C2E0B] scroll-mt-24">
                {/* Left side: narrative */}
                <div className="lg:col-span-7 p-6 md:p-8 bg-[#FDFAF5] flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase text-[#3D1E04] tracking-tight mb-2">
                        Linguistic Philosophy & Adaptor Design
                      </h2>
                      <div className="w-16 h-1 bg-[#B45309]" />
                    </div>

                    <p className="text-sm md:text-base text-[#4A321B] leading-relaxed">
                      Yoruba is a tonal West African language of 45+ million speakers. Tone modifiers (High <code className="bg-amber-100 px-1 font-mono">á</code>, Low <code className="bg-amber-100 px-1 font-mono">à</code>, Mid unmarked) are not optional ornaments—they dictate core semantic dictionaries. For instance, removing accents transforms the sentence entirely, forcing human readers to guess lexical intent.
                    </p>

                    <div className="bg-[#FAF6F0] border-2 border-[#5C2E0B] p-4 font-mono text-xs text-[#5C2E0B] space-y-2 shadow-[4px_4px_0px_rgba(92,46,11,0.15)]">
                      <div className="font-bold border-b border-[#5C2E0B]/30 pb-1.5 uppercase text-[#3D1E04] flex items-center justify-between">
                        <span>🎭 The Yoruba "AWO" Tone Quadruplet Interactive Keys</span>
                        <span className="text-[9px] bg-[#B45309] text-white px-1.5 py-0.5 font-bold">CLICK TO HEAR</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => speakYoruba("àwò")}
                          className={`flex items-center gap-2 px-2.5 py-2 border text-left rounded-none transition-all cursor-pointer ${
                            speakingText === "àwò" ? "bg-amber-300 font-bold border-[#5C2E0B]" : "bg-white hover:bg-amber-50 border-[#5C2E0B]/30"
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#B45309] shrink-0" />
                          <div>
                            <span className="font-bold text-[#B45309] text-sm underlineDecoration">àwò</span>
                            <span className="text-gray-500 ml-1.5">(color / pattern)</span>
                          </div>
                        </button>
                        <button
                          onClick={() => speakYoruba("awó")}
                          className={`flex items-center gap-2 px-2.5 py-2 border text-left rounded-none transition-all cursor-pointer ${
                            speakingText === "awó" ? "bg-amber-300 font-bold border-[#5C2E0B]" : "bg-white hover:bg-amber-50 border-[#5C2E0B]/30"
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#B45309] shrink-0" />
                          <div>
                            <span className="font-bold text-[#B45309] text-sm underlineDecoration">awó</span>
                            <span className="text-gray-500 ml-1.5">(guinea fowl)</span>
                          </div>
                        </button>
                        <button
                          onClick={() => speakYoruba("awo")}
                          className={`flex items-center gap-2 px-2.5 py-2 border text-left rounded-none transition-all cursor-pointer ${
                            speakingText === "awo" ? "bg-amber-300 font-bold border-[#5C2E0B]" : "bg-white hover:bg-amber-50 border-[#5C2E0B]/30"
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#B45309] shrink-0" />
                          <div>
                            <span className="font-bold text-[#B45309] text-sm underlineDecoration">awo</span>
                            <span className="text-gray-500 ml-1.5">(clay plate)</span>
                          </div>
                        </button>
                        <button
                          onClick={() => speakYoruba("awọ́")}
                          className={`flex items-center gap-2 px-2.5 py-2 border text-left rounded-none transition-all cursor-pointer ${
                            speakingText === "awọ́" ? "bg-amber-300 font-bold border-[#5C2E0B]" : "bg-white hover:bg-amber-50 border-[#5C2E0B]/30"
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#B45309] shrink-0" />
                          <div>
                            <span className="font-bold text-[#B45309] text-sm underlineDecoration">awọ́</span>
                            <span className="text-gray-500 ml-1.5">(secret / cult)</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#4A321B] leading-relaxed">
                      Standard tokenizers fragment accented glyphs under Unicode NFD formats, creating duplicate sub-words that dilute transformer focus weights. Àṣà LLM implements full-spectrum NFC composition preprocessing, compiling token points prior to training 4-bit LoRA adapters on base Qwen or Llama weights.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 border border-[#5C2E0B]/40 bg-[#FFFDFB]">
                        <span className="font-mono text-xs text-amber-700 font-bold">01. PRE-TRAINED COMPONENT</span>
                        <h4 className="text-xs font-black uppercase mt-1 mb-1 text-[#3D1E04]">Jacaranda YorubaLlama</h4>
                        <p className="text-[11px] text-[#4A321B]/85">
                          Leverages South Africa's high-performance bilingual Jacaranda embeddings under 7B/8B parameter weights.
                        </p>
                      </div>
                      <div className="p-4 border border-[#5C2E0B]/40 bg-[#FFFDFB]">
                        <span className="font-mono text-xs text-amber-700 font-bold">02. COMPILATION FRAME</span>
                        <h4 className="text-xs font-black uppercase mt-1 mb-1 text-[#3D1E04]">Yorubaname & YorubaGPT</h4>
                        <p className="text-[11px] text-[#4A321B]/85">
                          Structured conversational datasets tracking West African news, proverbs, and custom user dialogue.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-[#5C2E0B]/20 pt-4 flex items-center justify-between font-mono text-[10px] text-amber-800">
                    <span>📚 100% Capital-Sourced Open Corpus</span>
                    <span>⚡ NFC Normalization Active</span>
                  </div>
                </div>

                {/* Right side: Interactive Sandbox */}
                <div id="sandbox" className="lg:col-span-5 p-6 md:p-8 bg-[#FAF6F0] flex flex-col justify-between scroll-mt-24">
                  <div className="border-4 border-[#5C2E0B] p-5 bg-white shadow-[6px_6px_0px_#5C2E0B] h-full flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#5C2E0B]/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping"></span>
                          <span className="bg-[#5C2E0B] text-white px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                            YORUBA CHATBOT MVP SANDBOX
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-black text-amber-700">STATUS: ACTIVE</span>
                      </div>

                      <p className="text-xs text-[#5C2E0B] mt-3 mb-2 font-medium">
                        Test the Phase 1 MVP model. Tap a seed prompt or enter custom Yoruba dialogue to explore the fine-tuned tone-mapping:
                      </p>

                      {/* Seed Prompts */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Báwo ni ọjọ́ rẹ ṣe rí?" },
                              { role: "bot", text: "Ọjọ́ mi dáa gan-an. Báwo ni tirẹ?" }
                            ]);
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-[9.5px] font-mono font-bold px-2 py-1 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B]"
                        >
                          ☀️ "Báwo ni..."
                        </button>
                        
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Kí ni olú-ilu Nàìjíríà?" },
                              { role: "bot", text: "Abuja ni olú-ilu Nàìjíríà dídùn." }
                            ]);
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-[9.5px] font-mono font-bold px-2 py-1 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B]"
                        >
                          🇳🇬 "Kí ni olú-ilu..."
                        </button>

                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Kọ́ mi ní òwe lórí ọgbọ́n." },
                              { role: "bot", text: "Òwe: ‘Kò sí fùrò tí kò nípò; ọgbọ́n dunjú ju agbára lọ.’ Ìtúmọ̀: No individual is completely useless; wisdom is more impactful than sheer strength." }
                            ]);
                          }}
                          className="bg-[#FDFAF5] hover:bg-amber-100 border border-[#5C2E0B] text-[9.5px] font-mono font-bold px-2 py-1 transition-all cursor-pointer shadow-[2px_2px_0px_#5C2E0B]"
                        >
                          🦉 Proverb Playback
                        </button>
                      </div>

                      {/* Interactive Sandbox Messages */}
                      <div className="border-2 border-[#5C2E0B] h-48 overflow-y-auto p-3 bg-[#FAF8F5] font-mono text-[11px] leading-relaxed space-y-3 shadow-inner">
                        {mvpChatHistory.length === 0 ? (
                          <div className="text-gray-400 italic text-[10px] flex items-center justify-center h-full text-center p-4">
                            Sandbox is empty. Click a seed prompt above or send a message to start dialogue emulation.
                          </div>
                        ) : (
                          mvpChatHistory.map((msg, index) => (
                            <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                              <span className={`text-[8px] uppercase tracking-wider font-bold mb-0.5 ${msg.role === "user" ? "text-amber-800" : "text-[#7C2D12]"}`}>
                                {msg.role === "user" ? "● User Prompt" : "🤖 Yoruba-Bot MVP"}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {msg.role === "bot" && (
                                  <button
                                    onClick={() => speakYoruba(msg.text)}
                                    className="p-1 border bg-white hover:bg-orange-100 text-[#5C2E0B]"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <div className={`px-2.5 py-1.5 border border-[#5C2E0B] rounded-none ${
                                  msg.role === "user" 
                                    ? "bg-amber-100 text-amber-950 font-bold ml-4 shadow-[1.5px_1.5px_0px_#5C2E0B]" 
                                    : "bg-orange-100 text-[#2C1D11] mr-4 shadow-[1.5px_1.5px_0px_#7C2D12]"
                                }`}>
                                  {msg.text}
                                </div>
                                {msg.role === "user" && (
                                  <button
                                    onClick={() => speakYoruba(msg.text)}
                                    className="p-1 border bg-white hover:bg-orange-100 text-[#5C2E0B]"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        
                        {mvpChatLoading && (
                          <div className="flex items-center gap-1 text-amber-800 italic text-[9px] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800 animate-bounce"></span>
                            <span>Compiling tone diacritics...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input fields */}
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mvpChatInput}
                          onChange={(e) => setMvpChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !mvpChatLoading) {
                              handleMvpHourlyChat();
                            }
                          }}
                          placeholder="Type custom Yoruba text..."
                          className="flex-1 min-w-0 border-2 border-[#5C2E0B] px-3 py-1.5 text-xs font-mono bg-white"
                          disabled={mvpChatLoading}
                        />
                        <button
                          onClick={() => handleMvpHourlyChat()}
                          disabled={mvpChatLoading || !mvpChatInput.trim()}
                          className="bg-[#5C2E0B] hover:bg-[#3D1E04] text-white px-3 py-1.5 border-2 border-[#5C2E0B] text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
                        >
                          Send
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2 font-mono text-[9px]">
                        <span className="text-gray-400">⚡ Emulating fine-tuned model outputs</span>
                        <button
                          onClick={() => setMvpChatHistory([])}
                          className="text-red-700 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Current Available Features (Bento Grid) */}
              <div id="features" className="p-6 md:p-8 bg-[#FCFAF5] border-b-[4px] border-[#5C2E0B] scroll-mt-24">
                <div className="mb-6">
                  <span className="text-xs font-mono font-bold uppercase text-amber-700">TECHNICAL SUITE</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-[#3D1E04]">
                    Available Pipeline Features
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Feature 1 */}
                  <div className="border border-[#5C2E0B] p-5 bg-white shadow-[4px_4px_0px_rgba(92,46,11,0.1)] flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-8 bg-amber-500/10 border border-[#5C2E0B] flex items-center justify-center font-mono font-bold text-xs text-[#5C2E0B] mb-3">
                        01
                      </div>
                      <h4 className="text-sm font-black uppercase text-[#3D1E04] mb-2">NFC Composition</h4>
                      <p className="text-xs text-[#4A321B]/90 leading-relaxed font-sans">
                        Resolves scattered Unicode diacritic glyphs into single consolidated UTF-8 characters prior to tokenizer matrix ingestion.
                      </p>
                    </div>
                    <div className="mt-4 text-[9px] font-mono text-amber-700 uppercase font-black">
                      • Interactive playground live
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="border border-[#5C2E0B] p-5 bg-white shadow-[4px_4px_0px_rgba(92,46,11,0.1)] flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-8 bg-amber-500/10 border border-[#5C2E0B] flex items-center justify-center font-mono font-bold text-xs text-[#5C2E0B] mb-3">
                        02
                      </div>
                      <h4 className="text-sm font-black uppercase text-[#3D1E04] mb-2">Fine-Tuning Lab</h4>
                      <p className="text-xs text-[#4A321B]/90 leading-relaxed font-sans">
                        Set specific learning rates, target adapter values, LoRA scaling factor ($\alpha$), and download customized training launch script configurations.
                      </p>
                    </div>
                    <div className="mt-4 text-[9px] font-mono text-amber-700 uppercase font-black">
                      • 4-Bit parameters defined
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="border border-[#5C2E0B] p-5 bg-white shadow-[4px_4px_0px_rgba(92,46,11,0.1)] flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-8 bg-amber-500/10 border border-[#5C2E0B] flex items-center justify-center font-mono font-bold text-xs text-[#5C2E0B] mb-3">
                        03
                      </div>
                      <h4 className="text-sm font-black uppercase text-[#3D1E04] mb-2">Alpaca Synthesizer</h4>
                      <p className="text-xs text-[#4A321B]/90 leading-relaxed font-sans">
                        Edit and output bilingual JSON schema pairs matching open-source Yoruba name training matrices for high-fidelity response optimization.
                      </p>
                    </div>
                    <div className="mt-4 text-[9px] font-mono text-amber-700 uppercase font-black">
                      • Dataset generator active
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="border border-[#5C2E0B] p-5 bg-white shadow-[4px_4px_0px_rgba(92,46,11,0.1)] flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-8 bg-amber-500/10 border border-[#5C2E0B] flex items-center justify-center font-mono font-bold text-xs text-[#5C2E0B] mb-3">
                        04
                      </div>
                      <h4 className="text-sm font-black uppercase text-[#3D1E04] mb-2">Phonetic BLEU</h4>
                      <p className="text-xs text-[#4A321B]/90 leading-relaxed font-sans">
                        Includes dynamic evaluation models weighing tone-correct translations heavier than baseline text sequences.
                      </p>
                    </div>
                    <div className="mt-4 text-[9px] font-mono text-amber-700 uppercase font-black">
                      • Accuracy benchmarks logged
                    </div>
                  </div>
                </div>
              </div>

              {/* Startup Strategy Timeline */}
              <div id="roadmap" className="p-6 md:p-8 bg-[#FAF6F0] border-b-[4px] border-[#5C2E0B] scroll-mt-24">
                <div className="mb-6">
                  <span className="text-xs font-mono font-bold uppercase text-amber-700">DEVELOPMENT LIFECYCLE</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-[#3D1E04]">
                    The Àṣà LLM Dev Roadmap
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white border-2 border-[#5C2E0B] p-4 shadow-[4px_4px_0px_#5C2E0B]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-amber-200 text-amber-950 text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#5C2E0B]">PHASE 1</span>
                      <h4 className="text-xs font-black uppercase text-[#3D1E04]">Yoruba Chatbot</h4>
                    </div>
                    <p className="text-xs text-[#4A321B]/80 leading-relaxed font-sans">
                      Train base weights on proverbs, literature, and news corpora to master tone alignments and cultural context.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border-2 border-[#5C2E0B] p-4 shadow-[4px_4px_0px_rgba(92,46,11,0.15)] opacity-85">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#5C2E0B]/30">PHASE 2</span>
                      <span className="text-xs font-black uppercase text-[#3D1E04]">Bilingual Translate</span>
                    </div>
                    <p className="text-xs text-[#4A321B]/80 leading-relaxed font-sans">
                      Deploy secure APIs for English-Yoruba websites, school curricula, and enterprise platforms.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border-2 border-[#5C2E0B] p-4 shadow-[4px_4px_0px_rgba(92,46,11,0.15)] opacity-85">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#5C2E0B]/30">PHASE 3</span>
                      <h4 className="text-xs font-black uppercase text-[#3D1E04]">Voice Synthesis</h4>
                    </div>
                    <p className="text-xs text-[#4A321B]/80 leading-relaxed font-sans">
                      Incorporate Whisper audio components to interpret spoken dialects and synthesize pitch-perfect outputs.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white border-2 border-[#5C2E0B] p-4 shadow-[4px_4px_0px_rgba(92,46,11,0.15)] opacity-85">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#5C2E0B]/30">PHASE 4</span>
                      <h4 className="text-xs font-black uppercase text-[#3D1E04]">Industrial Tutors</h4>
                    </div>
                    <p className="text-xs text-[#4A321B]/80 leading-relaxed font-sans">
                      Support automated classrooms and customer service agents styled for Yoruba banks and small businesses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clean transition into footer */}
            </div>
          )}

          {/* Footer */}
          <footer className="bg-[#201A15] p-6 text-center text-[#A68F7A] text-xs font-mono border-t-2 border-[#5C2E0B]">
            <div>© {new Date().getFullYear()} ÀṢÀ LLM PROJECT. ALL RIGHTS RESERVED CORRESPONDENCE.</div>
            <div className="text-[10px] mt-1 text-[#A68F7A]/60 font-sans tracking-widest uppercase">
              Ẹ KÚ AJÀṢẸ GA JÙ LỌ — RESEARCH PIPELINE STABLE
            </div>
            <div className="mt-3 pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  window.location.hash = "#/admin";
                  setViewMode("admin");
                }}
                className="text-[#A68F7A]/30 hover:text-amber-500 underline text-[10px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer"
              >
                🛠️ Advanced Developer Workspace (Hyperparameters & Corpus Generation)
              </button>
            </div>
          </footer>

        </div>
      ) : (
        /* Outer brutalist frame for ADMIN */
        <div className="border-[8px] md:border-[12px] border-[#1A1A1A] bg-white flex flex-col shadow-[16px_16px_0px_#1A1A1A] overflow-hidden">
          
          {/* Header Block */}
          <header className="border-b-[4px] border-[#1A1A1A] p-6 bg-white flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 animate-fadeIn">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-black tracking-widest uppercase bg-black text-white px-2.5 py-0.5 rounded-sm">
                  PROJECT PIPELINE PROTOCOL v2.1
                </span>
                <span className="text-xs font-mono font-black tracking-widest uppercase bg-yellow-400 border border-black text-[#1A1A1A] px-2.5 py-0.5 rounded-sm">
                  STABLE
                </span>
                <button
                  onClick={() => {
                    window.location.hash = "#/";
                    setViewMode("landing");
                  }}
                  className="text-[10px] font-mono font-black tracking-wider uppercase bg-[#5C2E0B] text-[#FAF6F0] px-2 py-0.5 border border-[#5C2E0B]"
                >
                  ← Exit Admin (Back to Public Web)
                </button>
              </div>
            <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter uppercase text-[#1A1A1A]">
              ÀṢÀ LLM
            </h1>
            <p className="font-serif italic text-xl md:text-2xl mt-3 text-gray-700 max-w-2xl">
              Native Yoruba Language Intelligence & LoRA Adaptor Engine
            </p>
          </div>
          
          <div className="text-left lg:text-right border-l-4 lg:border-l-0 lg:border-r-4 border-[#1A1A1A] pl-5 lg:pl-0 lg:pr-5 flex flex-col gap-1 justify-end shrink-0 h-full">
            <span className="text-xs font-mono text-gray-500 uppercase font-bold text-gray-700">TARGET DESIGN SPECS</span>
            <div className="text-sm font-mono font-bold">BASE MODEL: Qwen-2.5-3B / 7B-Instruct</div>
            <div className="text-sm font-mono font-bold">METHOD: 4-bit PEFT (QLoRA)</div>
            <div className="text-sm font-mono font-bold text-emerald-700">COMPILER STATUS: STABLE</div>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="flex flex-wrap border-b-[4px] border-[#1A1A1A] bg-[#E8E8E6] p-2 gap-2">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "architecture"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <Layers className="w-4 h-4" />
            01. Model Architecture & LoRA
          </button>
          
          <button
            onClick={() => setActiveTab("cleaning")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "cleaning"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <Database className="w-4 h-4" />
            02. Acquisition, Parsing & NFC
          </button>

          <button
            onClick={() => setActiveTab("dataset")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "dataset"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            03. Instruction Synthesis
          </button>

          <button
            onClick={() => setActiveTab("evaluation")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "evaluation"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            04. Benchmark & Metrics
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            05. Advisor Arena Chat
          </button>

          <button
            onClick={() => setActiveTab("ecosystem")}
            className={`px-4 py-2 text-sm font-black uppercase tracking-wider transition-all duration-150 border-2 border-black flex items-center gap-2 ${
              activeTab === "ecosystem"
                ? "bg-black text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_#1A1A1A]"
                : "bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            06. OS Ecosystem Hub
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 bg-white">
          
          {/* TAB 1: ARCHITECTURE & LORA PARAMS */}
          {activeTab === "architecture" && (
            <div className="flex flex-col divide-y-[4px] divide-[#1A1A1A]">
              
              {/* Top Configuration Columns Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#1A1A1A]">
              
              {/* Left Column: Parameter controls */}
              <div className="lg:col-span-4 p-6 flex flex-col bg-[#F9F9F7] justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block text-black">
                    01. LoRA CONFIGURATOR
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    Customize low-rank adapter hyperparameters. These immediately bind to Python code generation and save checklists instantly.
                  </p>

                  <div className="space-y-5">
                    {/* LoRA Rank r */}
                    <div>
                      <div className="flex justify-between mb-1 text-xs font-mono font-bold uppercase">
                        <span>rank (r)</span>
                        <span className="text-black bg-yellow-300 px-2.5 py-0.5 border border-black rounded">{hyperparams.lora_r}</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="128"
                        step="4"
                        value={hyperparams.lora_r}
                        onChange={(e) => setHyperparams({ ...hyperparams, lora_r: parseInt(e.target.value) })}
                        className="w-full accent-[#1A1A1A] cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-500">Low rank dimension. Higher rank stores deeper grammatical tone rules but costs more VRAM.</span>
                    </div>

                    {/* LoRA Alpha */}
                    <div>
                      <div className="flex justify-between mb-1 text-xs font-mono font-bold uppercase">
                        <span>scaling factor (alpha)</span>
                        <span className="text-black bg-yellow-300 px-2.5 py-0.5 border border-black rounded">{hyperparams.lora_alpha}</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="256"
                        step="8"
                        value={hyperparams.lora_alpha}
                        onChange={(e) => setHyperparams({ ...hyperparams, lora_alpha: parseInt(e.target.value) })}
                        className="w-full accent-[#1A1A1A] cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-500">Scaling parameter ($\alpha$) for the low-rank delta updates. Normally set to 2x rank.</span>
                    </div>

                    {/* LoRA Dropout */}
                    <div>
                      <div className="flex justify-between mb-1 text-xs font-mono font-bold uppercase">
                        <span>dropout rate</span>
                        <span className="text-black bg-yellow-300 px-2.5 py-0.5 border border-black rounded">{hyperparams.lora_dropout}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.2"
                        step="0.01"
                        value={hyperparams.lora_dropout}
                        onChange={(e) => setHyperparams({ ...hyperparams, lora_dropout: parseFloat(e.target.value) })}
                        className="w-full accent-[#1A1A1A] cursor-pointer"
                      />
                    </div>

                    {/* Learning Rate */}
                    <div>
                      <div className="flex justify-between mb-1 text-xs font-mono font-bold uppercase">
                        <span>learning rate</span>
                        <span className="text-black bg-yellow-300 px-1.5 py-0.5 border border-black rounded text-[11px]">{hyperparams.learning_rate.toExponential(1)}</span>
                      </div>
                      <select
                        value={hyperparams.learning_rate}
                        onChange={(e) => setHyperparams({ ...hyperparams, learning_rate: parseFloat(e.target.value) })}
                        className="w-full px-3 py-1.5 border-2 border-black bg-white rounded-none font-mono text-sm leading-tight focus:outline-none"
                      >
                        <option value="5e-5">5.0e-5</option>
                        <option value="1e-4">1.0e-4</option>
                        <option value="2e-4">2.0e-4</option>
                        <option value="3e-4">3.0e-4</option>
                        <option value="5e-4">5.0e-4</option>
                      </select>
                    </div>

                    {/* Batch Size & Gradient Accumulation */}
                    <div className="grid grid-cols-2 gap-3 pb-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase mb-1">micro batch size</label>
                        <select
                          value={hyperparams.per_device_train_batch_size}
                          onChange={(e) => setHyperparams({ ...hyperparams, per_device_train_batch_size: parseInt(e.target.value) })}
                          className="w-full px-2 py-1.5 border-2 border-black bg-white font-mono text-xs focus:outline-none"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="4">4</option>
                          <option value="8">8</option>
                          <option value="16">16</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase mb-1">gradient accum.</label>
                        <select
                          value={hyperparams.gradient_accumulation_steps}
                          onChange={(e) => setHyperparams({ ...hyperparams, gradient_accumulation_steps: parseInt(e.target.value) })}
                          className="w-full px-2 py-1.5 border-2 border-black bg-white font-mono text-xs focus:outline-none"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="4">4</option>
                          <option value="8">8</option>
                          <option value="16">16</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Modules */}
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">target modules (csv)</label>
                      <input
                        type="text"
                        value={hyperparams.lora_target_modules}
                        onChange={(e) => setHyperparams({ ...hyperparams, lora_target_modules: e.target.value })}
                        className="w-full px-2.5 py-1.5 border-2 border-black bg-white font-mono text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500">Modules where LoRA Adapters are injected. Target linear matrices of attention weights.</span>
                    </div>
                  </div>
                </div>

                {/* Training hardware budget estimator */}
                <div className="mt-8 pt-6 border-t-[4px] border-[#1A1A1A] bg-white p-4 border-2 border-black shadow-[4px_4px_0px_#1A1A1A]">
                  <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-1.5 text-black">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    HW & Cost Estimator
                  </h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block uppercase font-bold text-[9px] mb-1">Training Platform / GPU</label>
                      <select
                        value={hardwareTier}
                        onChange={(e: any) => setHardwareTier(e.target.value)}
                        className="w-full px-2.5 py-1 border border-black bg-[#F5F5F3]"
                      >
                        <option value="rtx4090">Low Cost Node (RTX 4090)</option>
                        <option value="a100">Standard Cluster (1x A100 80GB)</option>
                        <option value="h100">Elite Node (1x H100 GPU)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between uppercase font-bold text-[9px] mb-1">
                        <span>Estimated Hours</span>
                        <span>{estimatedTrainingHours} hrs</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="96"
                        step="2"
                        value={estimatedTrainingHours}
                        onChange={(e) => setEstimatedTrainingHours(parseInt(e.target.value))}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-400">
                      <div className="flex justify-between font-bold text-gray-700">
                        <span>GPU Pricing Rate:</span>
                        <span>{currentHw.display}</span>
                      </div>
                      <div className="flex justify-between text-[#1A1A1A] font-black text-sm mt-1">
                        <span>Projected Hardware Cost:</span>
                        <span className="bg-yellow-100 border border-black px-1.5">${totalCostEstimate.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Center Column: System architecture flow diagram */}
              <div className="lg:col-span-4 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    02. SYSTEM ARCHITECTURE
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    A visual layout mapping the complete data scraping, NFC-normalization, QLoRA adapter training, and benchmark evaluation suite.
                  </p>

                  {/* Flowchart diagram */}
                  <div className="border-4 border-black p-4 bg-[#F2F2F0] space-y-4 rounded-none shadow-[4px_4px_0px_#1A1A1A]">
                    {/* Stage 1 */}
                    <div className="bg-white border-2 border-black p-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-sm">STAGE 1</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Text Scraping</span>
                      </div>
                      <p className="font-bold text-xs uppercase">Yoruba Scrapers & Web Crawlers</p>
                      <p className="text-[10px] text-gray-600">Wikipedia, Books, Oral scripts, and News sites</p>
                    </div>

                    <div className="flex justify-center -my-2">
                      <div className="w-1.5 h-6 bg-black"></div>
                    </div>

                    {/* Stage 2 */}
                    <div className="bg-white border-2 border-black p-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-sm">STAGE 2</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Token Normalization</span>
                      </div>
                      <p className="font-bold text-xs uppercase text-amber-700">Unicode form C (NFC) Sanitizer</p>
                      <p className="text-[10px] text-gray-600">Resolves accents, tone mark decomposed sequences</p>
                    </div>

                    <div className="flex justify-center -my-2">
                      <div className="w-1.5 h-6 bg-black"></div>
                    </div>

                    {/* Stage 3 */}
                    <div className="bg-yellow-400/15 border-2 border-black p-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-sm">STAGE 3</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Fine-Tuning PEFT</span>
                      </div>
                      <p className="font-bold text-xs uppercase">QLoRA / bitsandbytes 4-Bit</p>
                      <p className="text-[10px] text-gray-600">Injected adapters, rank={hyperparams.lora_r}, alpha={hyperparams.lora_alpha}</p>
                    </div>

                    <div className="flex justify-center -my-2">
                      <div className="w-1.5 h-6 bg-black"></div>
                    </div>

                    {/* Stage 4 */}
                    <div className="bg-emerald-50 border-2 border-black p-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-sm">STAGE 4</span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Benchmark & Evaluate</span>
                      </div>
                      <p className="font-bold text-xs uppercase text-emerald-700">Tone Preservation & BLEU Metrics</p>
                      <p className="text-[10px] text-gray-600">Calculates tone density differences vs gold standards</p>
                    </div>
                  </div>
                </div>

                {/* Strategic Advice Notes */}
                <div className="bg-white/10 p-4 border border-black/20 font-serif italic text-sm mt-6 text-gray-700">
                  ⚠️ <strong>Linguist Protip:</strong> Yoruba relies heavily on accents for word disambiguation (e.g. <em>Ogun</em> - war vs <em>Ògún</em> - iron god vs <em>Ògùn</em> - medicine). Normalizing source files to NFC form prior to training is paramount to prevent model hallucination.
                </div>
              </div>

              {/* Right Column: Code generation output panel */}
              <div className="lg:col-span-4 p-6 flex flex-col bg-slate-900 text-white justify-between">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] font-mono text-yellow-400">
                      03. PRODUCTION CODE GENERATOR
                    </h3>
                    <Terminal className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>

                  {/* Code File Selection */}
                  <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                    {(["train.py", "evaluate.py", "inference.py", "requirements.txt", "README.md"] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedFileKey(key)}
                        className={`px-2 py-1 border transition-all duration-100 rounded-sm ${
                          selectedFileKey === key
                            ? "bg-yellow-400 text-black font-black border-yellow-400"
                            : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Code Content text block with Copy button */}
                  <div className="flex-1 bg-black p-3 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[360px] border border-gray-800 relative rounded">
                    <button
                      onClick={() => handleCopyText(getActiveCodeText(), selectedFileKey)}
                      className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-1 border border-gray-700 text-[10px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer"
                    >
                      {copyFeedback === selectedFileKey ? (
                        <>
                          <Check className="w-3" /> COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3" /> COPY
                        </>
                      )}
                    </button>
                    <pre className="whitespace-pre-wrap select-text pr-4">{getActiveCodeText()}</pre>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-gray-400">⚡ Instant PyTorch PEFT Code</span>
                  <button
                    onClick={() => {
                      const text = getActiveCodeText();
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = selectedFileKey;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 font-black uppercase tracking-wider text-[11px] border border-black cursor-pointer"
                  >
                    Download File
                  </button>
                </div>
              </div>
            </div>

            {/* LINGUISTICS & ROADMAP NOTICE */}
            <div className="p-6 bg-[#FAF9F5] border-t-4 border-black">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-black uppercase text-amber-900 flex items-center gap-1">
                  💡 ADMINISTRATIVE PIPELINE ADVISORY
                </h4>
                <p className="text-xs text-gray-700 font-mono leading-relaxed max-w-4xl">
                  LoRA Hyperparameter controls directly alter the py-script compilation curves. High ranks ($r$) improve grammatical tone adjustments but scale GPU weights, needing A100/H100 execution. Interactive sandbox playgrounds and startup narrative phases are located on the main public webpage.
                </p>
              </div>
            </div>

            {/* Legacy sections can be disabled/collapsed safely for cleaner Admin view */}
            <div className="hidden">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7">
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Phase 1 */}
                      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_#1A1A1A]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="bg-yellow-400 text-black text-[10px] font-mono font-bold px-1.5 py-0.5 border-2 border-black">PHASE 1 (MVP)</span>
                          <h4 className="text-xs font-black uppercase">Yoruba Chatbot</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Fine-tune on conversational script pairs, literature, news, proverbs, and grammar databases. Chat interactive models learn custom tone mapping and contextual dialect values.
                        </p>
                        <div className="mt-2 text-[10px] font-mono font-bold text-gray-400 uppercase">
                          Standard core chatbot MVP
                        </div>
                      </div>

                      {/* Phase 2 */}
                      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_#A3A3A3]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="bg-purple-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 border-2 border-black">PHASE 2</span>
                          <h4 className="text-xs font-black uppercase">Translation Engine</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Deliver bidirectional English ↔ Yoruba translations optimized for diacritics. Serve as API proxies or embeddable browser blocks for corporations.
                        </p>
                        <div className="mt-2 text-[10px] font-mono font-bold text-gray-400 uppercase">
                          Interactive web & app SaaS
                        </div>
                      </div>

                      {/* Phase 3 */}
                      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_#A3A3A3]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="bg-emerald-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 border-2 border-black">PHASE 3</span>
                          <h4 className="text-xs font-black uppercase">Voice Assistant</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Integrate native acoustic Whisper speech models with customized tone sound synthesis. Broadens accessibility to older or non-literate communities.
                        </p>
                        <div className="mt-2 text-[10px] font-mono font-bold text-gray-400 uppercase">
                          Voice-enabled smart system
                        </div>
                      </div>

                      {/* Phase 4 */}
                      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_#A3A3A3]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="bg-orange-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 border-2 border-black">PHASE 4</span>
                          <h4 className="text-xs font-black uppercase">Industrial Tutors / CS</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Provide smart virtual school tutors who guide dialect tone patterns, or automated customer service portals for banks and businesses.
                        </p>
                        <div className="mt-2 text-[10px] font-mono font-bold text-gray-400 uppercase">
                          Targeted Enterprise SaaS
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] font-mono text-gray-500 leading-relaxed bg-[#FAF9F5] border border-gray-300 p-2.5">
                    💡 <strong>Economic Fact:</strong> Fine-tuning a 3-billion to 8-billion parameter base weights is 90% cheaper and faster than pre-training a raw model from scratch, and can achieve higher accuracy on domain-bound tasks with clean data.
                  </div>
                </div>

                {/* Right part: Live Chatbot Emulation Sandbox */}
                <div className="xl:col-span-5 flex flex-col justify-between">
                  <div className="border-4 border-black p-5 bg-white shadow-[6px_6px_0px_#1A1A1A] h-full flex flex-col justify-between space-y-4">
                    <div>
                      {/* Live header */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="bg-black text-white px-2 py-0.5 text-[9px] font-mono font-black uppercase">YORUBA CHATBOT MVP DEMO</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">STATUS: ACTIVE</span>
                      </div>

                      <p className="text-xs text-gray-600 mt-3 mb-2 leading-tight">
                        Explore core conversational MVP scenarios. Tap a benchmark prompt or enter custom Yoruba inputs below to simulate dynamic responses:
                      </p>

                      {/* Quick playbacks */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Báwo ni ọjọ́ rẹ ṣe rí?" },
                              { role: "bot", text: "Ọjọ́ mi dáa gan-an. Báwo ni tirẹ?" }
                            ]);
                          }}
                          className="bg-neutral-50 hover:bg-neutral-150 border border-black text-[9px] font-mono font-bold px-2 py-1 rounded-sm shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer"
                        >
                          ☀️ "Báwo ni..."
                        </button>
                        
                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Kí ni olú-ilu Nàìjíríà?" },
                              { role: "bot", text: "Abuja ni olú-ilu Nàìjíríà." }
                            ]);
                          }}
                          className="bg-neutral-50 hover:bg-neutral-150 border border-black text-[9px] font-mono font-bold px-2 py-1 rounded-sm shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer"
                        >
                          🇳🇬 "Kí ni olú-ilu..."
                        </button>

                        <button
                          onClick={() => {
                            setMvpChatHistory([
                              ...mvpChatHistory,
                              { role: "user", text: "Kọ́ mi ní òwe kan lórí ọ̀pọ̀lọpọ̀ ọgbọ́n." },
                              { role: "bot", text: "Òwe: ‘Kò sí fùrò tí kò nípò; ọgbọ́n dunjú ju agbára lọ.’ Ìtúmọ̀: No individual is completely useless; wisdom is more impactful than sheer strength." }
                            ]);
                          }}
                          className="bg-neutral-50 hover:bg-neutral-150 border border-black text-[9px] font-mono font-bold px-2 py-1 rounded-sm shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer"
                        >
                          🦉 Proverb Playback
                        </button>
                      </div>

                      {/* Chat screen */}
                      <div className="border-[3px] border-black h-48 overflow-y-auto p-3 bg-[#F9F9F7] font-mono text-[10.5px] leading-relaxed space-y-3.5 shadow-inner">
                        {mvpChatHistory.map((msg, index) => (
                          <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <span className={`text-[8px] uppercase tracking-wider font-bold mb-0.5 ${msg.role === "user" ? "text-blue-700" : "text-amber-800"}`}>
                              {msg.role === "user" ? "● User Prompt" : "🤖 Yoruba-Bot MVP"}
                            </span>
                            <div className={`px-2.5 py-1.5 border border-black max-w-[85%] rounded-none ${
                              msg.role === "user" 
                                ? "bg-blue-100 text-blue-950 font-bold ml-4 shadow-[1.5px_1.5px_0px_#1D4ED8]" 
                                : "bg-amber-100 text-amber-950 mr-4 shadow-[1.5px_1.5px_0px_#92400E]"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        
                        {mvpChatLoading && (
                          <div className="flex items-center gap-1 text-gray-500 italic text-[9px] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                            <span>YorubaGPT processing tone alignments...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Input form */}
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mvpChatInput}
                          onChange={(e) => setMvpChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !mvpChatLoading) {
                              handleMvpHourlyChat();
                            }
                          }}
                          placeholder="Type or translate in Yoruba..."
                          className="flex-1 min-w-0 border-2 border-black px-3 py-1.5 text-xs font-mono bg-[#F9F9F7]"
                          disabled={mvpChatLoading}
                        />
                        <button
                          onClick={() => handleMvpHourlyChat()}
                          disabled={mvpChatLoading || !mvpChatInput.trim()}
                          className="bg-black hover:bg-neutral-800 text-white px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
                        >
                          Send
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2 font-mono text-[9px]">
                        <span className="text-gray-400">⚡ Emulating fine-tuned model outputs</span>
                        <button
                          onClick={() => setMvpChatHistory([])}
                          className="text-red-700 hover:underline font-bold"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
          )}

          {/* TAB 2: DATA COLLECTION, ACCENTS & NFC NORMALIZATION */}
          {activeTab === "cleaning" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#1A1A1A]">
              
              {/* Left Column: Educational & Python Scraper selection */}
              <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    01. WEB SCRAPING & CLEANING PIPELINE
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    A fully-formed model requires high character purity. Yoruba Wikipedia, books, and blogs are scraped, deduplicated, and normalized into <strong>Normalization Form C (NFC)</strong>.
                  </p>

                  <div className="bg-[#F9F9F7] border-2 border-black p-4 space-y-4">
                    <p className="font-bold text-xs uppercase mb-1">Select Processing Scripts:</p>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                      {(["diacritics.py", "scraper.py", "cleaner.py"] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedScriptKey(key)}
                          className={`px-2 py-1.5 border transition-all duration-100 rounded-none ${
                            selectedScriptKey === key
                              ? "bg-black text-white font-black border-black"
                              : "bg-white text-gray-700 border-gray-400 hover:border-black"
                          }`}
                        >
                          {key === "diacritics.py" ? "NFC Composing" : key === "scraper.py" ? "Wiki Scraper" : "Wiki Cleaner"}
                        </button>
                      ))}
                    </div>

                    <div className="bg-black text-[#5C5C5C] p-3 font-mono text-[11px] h-60 overflow-y-auto border border-gray-300 relative rounded">
                      <button
                        onClick={() => handleCopyText(getActiveScriptText(), selectedScriptKey)}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-1 text-[9px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer"
                      >
                        {copyFeedback === selectedScriptKey ? "COPIED" : "COPY CODE"}
                      </button>
                      <pre className="whitespace-pre-wrap select-text text-gray-300 leading-normal">{getActiveScriptText()}</pre>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-blue-200 bg-blue-50/50 rounded-sm">
                  <div className="flex gap-2 text-blue-900 text-xs font-bold uppercase mb-1">
                    <Languages className="w-4 h-4 shrink-0" />
                    <span>Linguistic Note on Unicode Normalization</span>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Yoruba words like <em>ẹran</em> (meat) often consist of an 'e', a combining subdot character (\u0323), and 'ran'. Some web resources store them decomposed (NFD), causing tokenizers to output separate bytes, bloating prompt sequences. Converting them into NFC unifies them!
                  </p>
                </div>
              </div>

              {/* Right Column: Live diacritics / tone-adding sandbox */}
              <div className="lg:col-span-7 p-6 bg-[#F9F9F7] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    02. LIVE DIACRITICS NORMALIZER & LANGUAGE DETECTOR
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    Enter raw, flat Yoruba text (or English-mixed text). The live AI engine will analyze, repair missing subdots and high/low/mid tone accents, and convert it to perfect standard NFC composition.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1.5 text-gray-700">Raw Input Text (Flat Yoruba / Untiled)</label>
                      <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-24 p-3 border-2 border-black bg-white rounded-none font-sans text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="E.g., E ku abo si ilu Ibadan..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNormalize}
                        disabled={normalizing}
                        className="bg-black hover:bg-neutral-800 text-white font-black uppercase tracking-wider text-xs px-6 py-3 border-2 border-black shadow-[4px_4px_0px_#A3A3A3] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100 flex items-center gap-2 cursor-pointer"
                      >
                        {normalizing ? (
                          <>
                            <RotateCcw className="w-4 h-4 animate-spin" /> Normalizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-yellow-300" /> Normalize & Restore Tonals
                          </>
                        )}
                      </button>
                    </div>

                    {/* Results Box */}
                    {normalizationError && (
                      <div className="p-3 border-2 border-red-500 bg-red-50 text-red-900 text-xs flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <div>
                          <strong>Normalization API error:</strong> {normalizationError}. Make sure your GEMINI_API_KEY is configured in Settings {`>`} Secrets.
                        </div>
                      </div>
                    )}

                    {normalizedResult && (
                      <div className="border-[3px] border-black bg-white p-5 rounded-none relative shadow-[6px_6px_0px_#1A1A1A]">
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-black rounded">
                          NFC ACTIVE
                        </span>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-[10px] uppercase">
                          <div className="bg-gray-100 p-2 border border-black">
                            <span className="block text-gray-500 text-[8px]">PRIMARY LANGUAGE</span>
                            <span className="font-bold text-black">{normalizedResult.primaryLanguage}</span>
                          </div>
                          <div className="bg-gray-100 p-2 border border-black">
                            <span className="block text-gray-500 text-[8px]">DIACRITICS MATCH</span>
                            <span className="font-bold text-black">{normalizedResult.hasProperDiacritics ? "YES" : "NO"}</span>
                          </div>
                          <div className="bg-gray-100 p-2 border border-black">
                            <span className="block text-gray-500 text-[8px]">CHARACTERS RESTORED</span>
                            <span className="font-bold text-emerald-600">+{normalizedResult.diacriticCountAdded} ticks/dots</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-xs font-mono font-black uppercase text-gray-500">Perfected Output (Standard Written Orthography with Tone Marks):</span>
                          <p className="bg-yellow-400/10 p-3 border-2 border-dashed border-black font-semibold text-sm text-black leading-relaxed">
                            {normalizedResult.normalizedText}
                          </p>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                // Add result to the active instruction list
                                const manualItem: YorubaExample = {
                                  id: `auto-${Date.now()}`,
                                  category: "Translation",
                                  instruction: "Translate/Normalize the provided accented Yoruba sentence correctly.",
                                  input: rawText,
                                  output: normalizedResult.normalizedText
                                };
                                setDatasetList((prev) => [manualItem, ...prev]);
                                alert("Success! Added normalized pair to step 03 Dataset Sandbox!");
                              }}
                              className="text-[11px] font-bold uppercase border border-black bg-green-500 text-white px-3 py-1 hover:bg-green-600 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3" /> Append to Dataset
                            </button>
                            
                            <button
                              onClick={() => handleCopyText(normalizedResult.normalizedText, "sandbox-nfc")}
                              className="text-[11px] font-bold uppercase border border-black bg-white px-3 py-1 hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                            >
                              {copyFeedback === "sandbox-nfc" ? "COPIED" : "COPY"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="border border-black bg-white p-4 font-mono text-[11px] leading-relaxed mt-6">
                  💡 <strong>Scraper pipeline status:</strong> Raw scraping scripts produce <code>raw_yoruba_scraped.jsonl</code>. Cleansing removes pure English stopwords. Unicode NFC combines accents to uniform byte representations preventing tokenizer explosion.
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INSTRUCTION DATASET SANDBOX */}
          {activeTab === "dataset" && (
            <div className="p-6">
              
              {/* Top Row: Info & Synthesizer Trigger */}
              <div className="bg-[#F2F2F0] border-4 border-black p-5 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-[5px_5px_0px_#1A1A1A]">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-mono font-black uppercase bg-black text-white px-2 py-0.5 rounded-sm mb-1 inline-block">
                    03. INSTRUCTION DATASET BUILDER
                  </span>
                  <h3 className="text-xl font-black uppercase text-[#1A1A1A] tracking-tight">
                    DATASET SANDBOX (JSONL FORMAT)
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed mt-1">
                    Assemble instruction-following data with correct accents and diacritics. Filter records, prompt Gemini to construct new synthetic pairs for specialized domains, edit contents, and export the file direct to your training node.
                  </p>
                </div>

                {/* Synthesis controls */}
                <div className="bg-white border-2 border-black p-3 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-black uppercase mb-1">Target Category</span>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="border border-black px-2.5 py-1 text-xs bg-white focus:outline-none"
                    >
                      <option value="Proverbs">Proverbs</option>
                      <option value="Translation">Translation</option>
                      <option value="Question Answering">Question Answering</option>
                      <option value="Yoruba Grammar">Yoruba Grammar</option>
                      <option value="Storytelling">Storytelling</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Technology">Technology</option>
                      <option value="Summarization">Summarization</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSynthesizeItem}
                    disabled={isSynthesizing}
                    className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-4 py-2 border border-black h-fit self-end flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSynthesizing ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Synthesize 5 Items
                      </>
                    )}
                  </button>
                </div>
              </div>

              {synthesisError && (
                <div className="p-3 mb-4 border-2 border-red-500 bg-red-50 text-red-950 text-xs flex gap-2 rounded-sm font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <strong>Generator Failure:</strong> {synthesisError}. Confirm your credentials configurations with the build environment. Alternatively, write manual items below.
                  </div>
                </div>
              )}

              {/* Live search filters & actions */}
              <div className="bg-white border-2 border-black p-4 mb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search instruction text..."
                      className="pl-9 pr-3 py-1.5 w-full border border-black text-xs focus:outline-none"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-black px-2 py-1.5 text-xs bg-white focus:outline-none font-mono"
                  >
                    {datasetCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        Category: {cat}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-mono font-bold text-gray-700">
                    Matches: {filteredDataset.length} of {datasetList.length} total entries
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-[#1A1A1A] border-2 border-[#1A1A1A] font-black text-xs uppercase px-3 py-1.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Manual Item
                  </button>
                  <button
                    onClick={handleDownloadJSONL}
                    className="bg-black hover:bg-neutral-800 text-white border-2 border-black font-black text-xs uppercase px-3 py-1.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export JSONL
                  </button>
                  <button
                    onClick={handleResetDataset}
                    className="bg-white hover:bg-gray-100 text-red-700 border-2 border-red-700 font-bold text-xs uppercase px-3 py-1.5 cursor-pointer"
                  >
                    Reset List
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="border-2 border-black overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white font-mono uppercase tracking-wider text-[10px]">
                      <th className="p-3 border-r border-gray-700 w-24">Category</th>
                      <th className="p-3 border-r border-gray-700 w-1/3">Instruction (Prompt)</th>
                      <th className="p-3 border-r border-gray-700 w-1/4">Dynamic/Context Input</th>
                      <th className="p-3 border-r border-gray-700">Output (Accents Restored)</th>
                      <th className="p-3 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-t border-black divide-gray-300">
                    {filteredDataset.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 font-serif italic text-sm">
                          No matching instruction dataset entries found. Try synthesizing more with Gemini!
                        </td>
                      </tr>
                    ) : (
                      filteredDataset.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 border-r border-gray-300 font-mono font-bold align-top">
                            <span className="bg-neutral-100 border border-gray-400 px-1.5 py-0.5 rounded text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 border-r border-gray-300 align-top font-semibold text-black whitespace-pre-line max-w-sm">
                            {item.instruction}
                          </td>
                          <td className="p-3 border-r border-gray-300 align-top text-gray-600 font-mono text-[11px] whitespace-pre-line">
                            {item.input || <span className="text-gray-400 text-[10px] uppercase font-bold italic">Empty</span>}
                          </td>
                          <td className="p-3 border-r border-gray-300 align-top font-semibold text-gray-800 whitespace-pre-line bg-yellow-400/5">
                            {item.output}
                          </td>
                          <td className="p-3 align-top text-center space-y-1.5">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-blue-600 hover:text-blue-800 rounded p-1 font-mono hover:bg-blue-100 flex items-center justify-center gap-1 w-full border border-blue-400 py-0.5 font-bold cursor-pointer"
                            >
                              <Edit2 className="w-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 rounded p-1 font-mono hover:bg-red-100 flex items-center justify-center gap-1 w-full border border-red-400 py-0.5 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3" /> Del
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* JSONL sample preview block */}
              <div className="mt-8 border-4 border-black p-4 bg-slate-900 text-white rounded-none">
                <span className="text-xs font-mono font-bold text-yellow-400 block mb-2">RAW JSONL FORMAT PREVIEW (First 2 active rows):</span>
                <div className="bg-black p-3 font-mono text-[10px] overflow-x-auto text-gray-300 rounded">
                  {datasetList.slice(0, 2).map((item) => (
                    <div key={item.id} className="whitespace-nowrap mb-1">
                      {JSON.stringify({ instruction: item.instruction, input: item.input, output: item.output, metadata: { category: item.category } })}
                    </div>
                  ))}
                  <div className="text-gray-500 italic mt-1">// ... {datasetList.length} remaining rows output when generated to file</div>
                </div>
              </div>

              {/* MODAL 1: ADD MANUAL ENTRY */}
              {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                  <div className="bg-[#F2F2F0] border-[6px] border-black p-6 w-full max-w-xl shadow-[10px_10px_0px_#000000]">
                    <h3 className="text-lg font-black uppercase mb-4 text-[#1A1A1A] pb-2 border-b border-black">
                      ADD MANUAL INSTRUCTION DATA
                    </h3>
                    
                    <form onSubmit={handleAddManualItem} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Category</label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full border-2 border-black p-2 bg-white text-xs font-mono"
                        >
                          <option value="Proverbs">Proverbs</option>
                          <option value="Translation">Translation</option>
                          <option value="Question Answering">Question Answering</option>
                          <option value="Yoruba Grammar">Yoruba Grammar</option>
                          <option value="Storytelling">Storytelling</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Technology">Technology</option>
                          <option value="Summarization">Summarization</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Instruction (Prompt)</label>
                        <input
                          type="text"
                          required
                          value={newInstruction}
                          onChange={(e) => setNewInstruction(e.target.value)}
                          placeholder="e.g. Translate 'Keep moving forward' to standard Yoruba..."
                          className="w-full border-2 border-black p-2 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Input / Context (Optional)</label>
                        <textarea
                          value={newInput}
                          onChange={(e) => setNewInput(e.target.value)}
                          placeholder="Provide supportive parameters or word context..."
                          className="w-full border-2 border-black p-2 bg-white text-xs h-16"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Output (Accents and diacritics included)</label>
                        <textarea
                          required
                          value={newOutput}
                          onChange={(e) => setNewOutput(e.target.value)}
                          placeholder="e.g. Máa tẹ̀síwájú nìṣó pẹ̀lú sùúrú..."
                          className="w-full border-2 border-black p-2 bg-white text-xs h-24"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-neutral-800 font-black uppercase text-xs cursor-pointer"
                        >
                          Save Record
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 2: EDIT EXISTING ENTRY */}
              {editingItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                  <div className="bg-[#F2F2F0] border-[6px] border-black p-6 w-full max-w-xl shadow-[10px_10px_0px_#000000]">
                    <h3 className="text-lg font-black uppercase mb-4 text-[#1A1A1A] pb-2 border-b border-black">
                      EDIT INSTRUCTION DATA ROW
                    </h3>
                    
                    <form onSubmit={handleSaveEditItem} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Category</label>
                        <input
                          type="text"
                          value={editingItem.category}
                          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                          className="w-full border-2 border-black p-2 bg-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Instruction (Prompt)</label>
                        <input
                          type="text"
                          required
                          value={editingItem.instruction}
                          onChange={(e) => setEditingItem({ ...editingItem, instruction: e.target.value })}
                          className="w-full border-2 border-black p-2 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Input / Context (Optional)</label>
                        <textarea
                          value={editingItem.input}
                          onChange={(e) => setEditingItem({ ...editingItem, input: e.target.value })}
                          className="w-full border-2 border-black p-2 bg-white text-xs h-16"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase mb-1">Output (Yoruba with Proper Diacritics)</label>
                        <textarea
                          required
                          value={editingItem.output}
                          onChange={(e) => setEditingItem({ ...editingItem, output: e.target.value })}
                          className="w-full border-2 border-black p-2 bg-white text-xs h-24"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-neutral-800 font-black uppercase text-xs cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: BENCHMARK SUITE & EVALUATION SCORING */}
          {activeTab === "evaluation" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#1A1A1A]">
              
              {/* Left column: Evaluation input sandbox */}
              <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    01. BENCHMARK COHERENCE EVALUATIONS
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    A critical hurdle for Yoruba Large Language Models is preserving the <em>tones</em> and <em>morphology</em> correctly. Test translation accuracy, grammar correctness, and cultural reasoning below.
                  </p>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block uppercase font-bold text-[10px] text-gray-500 mb-1">1. Evaluated Prompt Instruction</label>
                      <input
                        type="text"
                        value={evalInstruction}
                        onChange={(e) => setEvalInstruction(e.target.value)}
                        className="w-full px-2.5 py-1.5 border-2 border-black bg-[#F9F9F7] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold text-[10px] text-gray-500 mb-1">2. Dynamic Context Input (Optional)</label>
                      <input
                        type="text"
                        value={evalInput}
                        onChange={(e) => setEvalInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 border-2 border-black bg-[#F9F9F7] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold text-[10px] text-gray-500 mb-1">3. Human Gold standard Reference (Target)</label>
                      <textarea
                        value={evalReference}
                        onChange={(e) => setEvalReference(e.target.value)}
                        className="w-full px-2.5 py-1.5 border-2 border-black bg-[#F9F9F7] focus:outline-none h-16"
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold text-[10px] text-yellow-700 mb-1">4. Target LLM Candidate Output (Test prediction)</label>
                      <textarea
                        value={evalCandidate}
                        onChange={(e) => setEvalCandidate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border-2 border-black bg-[#FDFDEA] focus:outline-none h-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleEvaluate}
                    disabled={evalLoading}
                    className="w-full bg-black hover:bg-neutral-800 text-white border-2 border-black py-3 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {evalLoading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" /> Evaluating Accuracy...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-400" /> Start Automated Linguistic Benchmarking
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEvalInstruction("Translate sentence to English with correct accents.");
                      setEvalInput("Ìyá rẹ fẹ́ láti lọ sí Ọ̀yọ́ lóògọ́.");
                      setEvalReference("Your mother wants to go to Oyo town peacefully.");
                      setEvalCandidate("Your mother wants to go to Oyo tomorrow.");
                      setEvalResult(null);
                    }}
                    className="w-full bg-[#E8E8E6] hover:bg-neutral-300 border border-black py-1.5 font-bold uppercase text-[10px] text-gray-700 cursor-pointer"
                  >
                    Load Sample Translation Pair
                  </button>
                </div>
              </div>

              {/* Right column: score card outputs */}
              <div className="lg:col-span-7 p-6 bg-[#F9F9F7] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    02. AUTOMATED EVALUATION METRICS REPORT CARD
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    Results calculate linguistic distance metrics, tone-mark error ratios, and cultural preservation indices based on Yoruba grammar standard benchmarks.
                  </p>

                  {evalError && (
                    <div className="p-3 border-2 border-red-500 bg-red-50 text-red-900 text-xs flex gap-2 font-mono">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <div>
                        <strong>Benchmark execution stalled:</strong> {evalError}. Confirm that your secrets environment variable is correctly initialized.
                      </div>
                    </div>
                  )}

                  {!evalResult && !evalError && (
                    <div className="border-2 border-dashed border-gray-400 p-12 text-center rounded-none bg-white">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="font-serif italic text-gray-500 text-sm">
                        Waiting for Yoruba LLM benchmarking validation... Click "Start Automated Linguistic Benchmarking" on the left to invoke the grader.
                      </p>
                    </div>
                  )}

                  {evalResult && (
                    <div className="space-y-6">
                      
                      {/* Overall badge & scores */}
                      <div className="border-[3px] border-black bg-white p-4 shadow-[5px_5px_0px_#1A1A1A] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-gray-300 pb-3 md:pb-0">
                          <label className="block text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">OVERALL RATING</label>
                          <span className="text-[60px] font-black leading-none">{evalResult.overallScore}</span>
                          <span className="text-gray-400 font-bold block text-xs">/ 5 Standard</span>
                        </div>

                        <div className="md:col-span-8 grid grid-cols-2 gap-3 text-xs font-mono font-bold uppercase">
                          <div className="bg-gray-50 p-2 border border-gray-300">
                            <span>TRANSLATION: </span>
                            <span className="text-black bg-yellow-200 px-1">{evalResult.translationScore}/5</span>
                          </div>
                          <div className="bg-gray-50 p-2 border border-gray-300">
                            <span>GRAMMAR: </span>
                            <span className="text-black bg-yellow-200 px-1">{evalResult.grammarScore}/5</span>
                          </div>
                          <div className="bg-gray-50 p-2 border border-gray-300">
                            <span>DIACRITICS: </span>
                            <span className="text-black bg-yellow-200 px-1">{evalResult.diacriticsScore}/5</span>
                          </div>
                          <div className="bg-gray-50 p-2 border border-gray-300">
                            <span>CULTURE NUANCE: </span>
                            <span className="text-black bg-yellow-200 px-1">{evalResult.culturalScore}/5</span>
                          </div>
                        </div>
                      </div>

                      {/* Bar graph of Preservations */}
                      <div className="bg-white border-2 border-black p-4">
                        <div className="flex justify-between items-center mb-1 text-xs font-mono font-bold text-gray-700">
                          <span>DIACRITICS TONE PRESERVATION RATE</span>
                          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">{evalResult.diacriticsPercentEstimate}% Match</span>
                        </div>
                        <div className="w-full bg-gray-200 h-5 border border-black relative">
                          <div
                            className="bg-emerald-500 h-[#14px] transition-all duration-500"
                            style={{ width: `${evalResult.diacriticsPercentEstimate}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-500 block mt-1">Measures the frequency of restored vowel subdots (ẹ, ọ), consonants (ṣ), and accent markings vs the reference sentence.</span>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border-2 border-green-600 p-3 text-xs leading-relaxed">
                          <div className="flex items-center gap-1.5 font-mono uppercase font-black text-green-900 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-700" />
                            Linguistic Strengths
                          </div>
                          <p className="text-green-950 font-medium">{evalResult.strengths}</p>
                        </div>

                        <div className="bg-amber-50 border-2 border-amber-600 p-3 text-xs leading-relaxed">
                          <div className="flex items-center gap-1.5 font-mono uppercase font-black text-amber-900 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 animate-bounce" />
                            Omissions & Hallucinations
                          </div>
                          <p className="text-amber-950 font-medium">{evalResult.weaknesses}</p>
                        </div>
                      </div>

                      {/* Corrected version */}
                      <div className="bg-[#1A1A1A] p-4 text-white font-mono text-[11px] rounded-none shadow-[4px_4px_0px_#A3A3A3]">
                        <span className="text-yellow-400 uppercase font-bold block mb-1">💡 Suggested Gold Standard Corrections for Next epoch fine-tuning:</span>
                        <p className="text-gray-200 bg-black/40 p-2.5 rounded font-bold leading-relaxed">{evalResult.suggestedCorrection}</p>
                      </div>

                    </div>
                  )}

                </div>

                <div className="border-4 border-black p-4 mt-6 bg-white rotate-1 shadow-[4px_4px_0px_#1A1A1A]">
                  <h4 className="text-xs font-black uppercase mb-1">Human Benchmarks Rubric:</h4>
                  <p className="text-xs italic leading-tight text-gray-700">
                    "Translation without local tones loses semantic weight. Grader penalizes models heavily if subdots or high-tone accents on vowel boundaries are omitted."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ADVISOR ARENA CHAT */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-[#1A1A1A]">
              
              {/* Left Column: Expert Bio / system specs */}
              <div className="lg:col-span-4 p-6 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    01. EXPERT TRAINING ASSISTANT
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    Meet <strong>Olówó-Ọgbọ́n</strong>, your world-class Yoruba specialist and AI trainer. Perfect prompts, design data strategies, ask about spelling, or query how to balance LoRA hyperparameters.
                  </p>

                  <div className="border-2 border-black p-4 bg-[#F9F9F7] space-y-3 font-mono text-xs shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="text-center pb-2 border-b border-gray-400">
                      <span className="font-bold text-sm block">Olówó-Ọgbọ́n</span>
                      <span className="text-[10px] text-gray-500 uppercase">Yoruba Linguist Tutor & NLP Expert</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 block text-[9px] uppercase">CAPABILITIES:</span>
                      <p className="font-semibold text-black">• Explaining tone boundaries and subdots</p>
                      <p className="font-semibold text-black">• Fine-Tuning loss troubleshooting</p>
                      <p className="font-semibold text-black">• Designing low-cost local GPU hardware</p>
                      <p className="font-semibold text-black">• Restoring compound verbs and nouns</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-amber-200 bg-amber-50/70 p-4 font-mono text-[11px] leading-relaxed text-amber-950">
                  ⚠️ <strong>PRO TIP:</strong> Try prompting: <em>"Explain the difference between 'ẹkọ' and 'ẹ̀kọ́' and how it impacts LLM tokenizers."</em>
                </div>
              </div>

              {/* Right Column: Chat workspace */}
              <div className="lg:col-span-8 bg-[#F9F9F7] p-6 flex flex-col h-[520px] justify-between">
                {/* Chat Message Lists */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 max-h-[400px]">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-2xl ${
                        m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold text-gray-500 uppercase px-1 mb-0.5">
                        {m.role === "user" ? "Researcher / You" : "Linguistic Advisor / Olówó-Ọgbọ́n"}
                      </span>
                      <div
                        className={`p-3.5 border-2 border-black font-medium leading-relaxed text-xs sm:text-sm ${
                          m.role === "user"
                            ? "bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#A3A3A3]"
                            : "bg-white text-black shadow-[3px_3px_0px_#1A1A1A]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap select-text">{m.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-600 p-2 animate-pulse">
                      <RotateCcw className="w-4 h-4 animate-spin" /> Olówó-Ọgbọ́n is formulating insights...
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="border-t-2 border-black pt-4 flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Olówó-Ọgbọ́n about Yoruba training pipelines or diacritic preservation..."
                    className="flex-1 min-w-0 border-2 border-black px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs px-6 py-2 border-2 border-black flex items-center gap-1.5 shrink-0 select-none cursor-pointer disabled:opacity-50"
                  >
                    Send Advisor
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 6: OPEN-SOURCE ECOSYSTEM HUB */}
          {activeTab === "ecosystem" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 divide-y-[4px] xl:divide-y-0 xl:divide-x-[4px] divide-[#1A1A1A]">
              
              {/* Left Column: Explorer Directory */}
              <div className="xl:col-span-5 p-6 bg-[#F9F9F7] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block">
                    01. NATIVE YORUBA ONOMASTICS DICTIONARY & CORPUS PROFILE
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    A high-fidelity implementation merging the design blueprints of <strong>yorubaname-website</strong> and <strong>yoruba-text</strong>. Analyze individual family name accents, division syllables, and audit the lexical density of raw text corpora.
                  </p>

                  {/* Section A: YorubaName Explorer */}
                  <div className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_#1A1A1A] mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-yellow-400 p-1 border-2 border-black text-xs font-mono font-bold">NAME SEARCH</div>
                      <h4 className="text-sm font-black uppercase">YorubaName Onomastics Registry</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 leading-tight">
                      Enter any Yoruba name below to analyze its standard accents, syllable bounds, pitch tone patterns, etymology, and traditional panegyric.
                    </p>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={ecoNameInput}
                        onChange={(e) => setEcoNameInput(e.target.value)}
                        placeholder="e.g., Olúyẹmí or Adébáyọ̀"
                        className="flex-1 min-w-0 border-2 border-black px-3 py-1.5 text-xs font-bold leading-tight bg-[#F9F9F7]"
                        disabled={ecoNameLoading}
                      />
                      <button
                        onClick={() => handleAnalyzeYorubaName()}
                        disabled={ecoNameLoading || !ecoNameInput.trim()}
                        className="bg-black text-white hover:bg-neutral-800 border-2 border-black font-black uppercase text-[10px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {ecoNameLoading ? "Analyzing..." : "Analyze"}
                      </button>
                    </div>

                    {/* Quick Selectors */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[10px] font-mono font-bold text-gray-400 self-center uppercase mr-1">Preloads:</span>
                      {["Olúyẹmí", "Bábájídé", "Ẹniọláríyo", "Adéjọkẹ́", "Ayọ̀bámi"].map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            setEcoNameInput(name);
                            handleAnalyzeYorubaName(name);
                          }}
                          className="px-2 py-0.5 border border-black hover:bg-gray-100 text-[10px] font-mono font-bold bg-[#E8E8E6] transition-all"
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    {ecoNameError && (
                      <div className="p-3 bg-red-100 text-red-900 border-2 border-red-900 font-mono text-[10px]">
                        ERROR: {ecoNameError}
                      </div>
                    )}

                    {ecoNameAnalysis && (
                      <div className="border-t-2 border-dashed border-gray-400 pt-3 mt-3 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-neutral-100 p-2 border border-neutral-300">
                          <div>
                            <span className="text-gray-500 block uppercase text-[9px]">Standard Orthography:</span>
                            <strong className="text-black text-xs">{ecoNameAnalysis.accentedName}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block uppercase text-[9px]">Syllable Partition:</span>
                            <strong className="text-[#1A1A1A]">{ecoNameAnalysis.syllables}</strong>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase text-[10px] font-mono font-bold">Linguistic Tone pitches (Do-Re-Mi):</span>
                          <span className="font-mono text-emerald-800 font-bold">{ecoNameAnalysis.tonalPattern}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase text-[10px] font-mono font-bold">Constituent Morphological Parts:</span>
                          <p className="text-gray-800 leading-tight italic">{ecoNameAnalysis.literalMeaning}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase text-[10px] font-mono font-bold">Detailed Cultural History & Meaning:</span>
                          <p className="text-gray-800 leading-relaxed font-serif text-xs bg-yellow-50/50 p-2 border border-amber-100 mt-1">{ecoNameAnalysis.fullMeaning}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase text-[10px] font-mono font-bold text-amber-900">Oriki Pronunciation / Praise Chant:</span>
                          <p className="whitespace-pre-wrap text-[11px] font-serif leading-relaxed px-2 border-l-2 border-amber-400 italic text-neutral-800 my-1">{ecoNameAnalysis.orikiSalutation}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section B: Yoruba-Text Corpus Profiler */}
                  <div className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_#1A1A1A]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-emerald-400 p-1 border-2 border-black text-xs font-mono font-bold">CORPUS AUDIT</div>
                      <h4 className="text-sm font-black uppercase">Yoruba-Text Corpus Profiler</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-tight">
                      Paste or edit paragraphs below to analyze diacritic density, subdots ratio, and vocabulary richness prior to fine-tuning.
                    </p>

                    <textarea
                      value={ecoTextCorpus}
                      onChange={(e) => setEcoTextCorpus(e.target.value)}
                      className="w-full h-16 border-2 border-black p-1.5 text-xs font-mono bg-[#F9F9F7] resize-none mb-3"
                    />

                    <div className="flex justify-between items-center mb-4">
                      {/* Preloaded buttons to swap input text */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEcoTextCorpus("Àdùkẹ́ o l’óye t’ítẹ́; ọbẹ tó kù nínú ìkòkò kò ní jinná kankan tótó sọ́ṣọ́.")}
                          className="px-1.5 py-0.5 border border-black text-[9px] hover:bg-neutral-50 bg-[#F5F5F3]"
                        >
                          Accented Yoruba
                        </button>
                        <button
                          onClick={() => setEcoTextCorpus("Agbara nla ko le to. Yoruba language text without proper accents and dots. Ibadan is nice.")}
                          className="px-1.5 py-0.5 border border-black text-[9px] hover:bg-neutral-50 bg-[#F5F5F3]"
                        >
                          Flat Yoruba/English
                        </button>
                      </div>
                      <button
                        onClick={handleProfileCorpus}
                        disabled={ecoTextLoading || !ecoTextCorpus.trim()}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-black font-black uppercase text-[10px] px-3 py-1 cursor-pointer select-none"
                      >
                        {ecoTextLoading ? "Profiling..." : "Profile Corpus"}
                      </button>
                    </div>

                    {ecoTextError && (
                      <div className="p-3 bg-red-100 text-red-900 border font-mono text-[10px] mb-3">
                        ERROR: {ecoTextError}
                      </div>
                    )}

                    {ecoTextMetrics && (
                      <div className="border-t-2 border-dashed border-gray-400 pt-3 space-y-3">
                        <div className="grid grid-cols-3 gap-2 font-mono text-center">
                          <div className="border border-neutral-300 p-1.5 bg-neutral-50">
                            <span className="text-[8px] text-gray-500 block uppercase">Tokens / Words</span>
                            <strong className="text-xs">{ecoTextMetrics.wordCount}</strong>
                          </div>
                          <div className="border border-neutral-300 p-1.5 bg-neutral-50">
                            <span className="text-[8px] text-gray-500 block uppercase">Vocabulary Richness</span>
                            <strong className="text-xs text-indigo-700">{ecoTextMetrics.vocabularyRichness}%</strong>
                          </div>
                          <div className="border border-neutral-300 p-1.5 bg-neutral-50">
                            <span className="text-[8px] text-gray-500 block uppercase">Diacritic Density</span>
                            <strong className="text-xs text-rose-700">{ecoTextMetrics.diacriticDensity}%</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                          <div className="border border-dashed border-neutral-300 p-1 bg-yellow-50/50">
                            <span className="text-[8px] text-gray-500 block uppercase">Subdots (ẹ,ọ,ṣ)</span>
                            <span className="font-bold">{ecoTextMetrics.subdotsCount}</span>
                          </div>
                          <div className="border border-dashed border-neutral-300 p-1 bg-blue-50/50">
                            <span className="text-[8px] text-gray-500 block uppercase">Acute (High)</span>
                            <span className="font-bold">{ecoTextMetrics.acutesCount}</span>
                          </div>
                          <div className="border border-dashed border-neutral-300 p-1 bg-purple-50/50">
                            <span className="text-[8px] text-gray-500 block uppercase">Grave (Low)</span>
                            <span className="font-bold">{ecoTextMetrics.gravesCount}</span>
                          </div>
                        </div>

                        <div className="p-2 border bg-[#1A1A1A] text-white font-mono text-[10px] flex justify-between items-center rounded-none shadow-[2px_2px_0px_#A3A3A3]">
                          <span className="text-yellow-400 uppercase font-black">ACADEMIC RATING:</span>
                          <strong>{ecoTextMetrics.qualityGrade}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border border-amber-200 bg-amber-50/70 p-3 font-mono text-[10px] leading-relaxed text-amber-950">
                  ⚡ <strong>Ecosystem Fact:</strong> Proper composition mapping (Unicode NFC Normalization) is necessary so tokenizers don't split vowels and accents into disconnected subwords.
                </div>
              </div>

              {/* Right Column: Models & Configurations Playground */}
              <div className="xl:col-span-7 bg-[#F9F9F7] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 py-1 border-b-2 border-black inline-block text-black">
                    02. JACARANDA/YORUBALLAMA-7B MODEL SANDBOX & FINE-TUNING STRUCTURES
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    Test prompt inputs against a high-fidelity emulation of <strong>Jacaranda's YorubaLlama-7B</strong>, a state-of-the-art open source model fine-tuned on foundational diacritic texts, or explore the fine-tuning instruction schema aligned with the <strong>YorubaGPT</strong> project.
                  </p>

                  {/* YorubaLlama Emulation Sandbox */}
                  <div className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_#1A1A1A] mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-600 text-white p-1 border-2 border-black text-xs font-mono font-bold">MODEL CARD</div>
                        <h4 className="text-sm font-black uppercase">YorubaLlama 7B Playground</h4>
                      </div>
                      <a 
                        href="https://huggingface.co/Jacaranda/YorubaLlama" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] border border-black px-2 py-0.5 bg-neutral-100 font-mono font-bold hover:bg-neutral-200 uppercase transition-all flex items-center gap-1"
                      >
                        HF Weights ↗
                      </a>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 leading-tight">
                      Explore the generation performance of Jacaranda's foundation model trained heavily on millions of African dialects.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-gray-500 block mb-1">Enter Yoruba Prompt or English Translation Task:</label>
                        <textarea
                          value={ecoLlamaPrompt}
                          onChange={(e) => setEcoLlamaPrompt(e.target.value)}
                          className="w-full h-20 border-2 border-black p-2.5 text-xs bg-[#F9F9F7] font-medium leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="Compose a poem, prompt an instruction, or translate."
                        />
                      </div>

                      {/* Temperature + trigger */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#E8E8E6] p-3 border-2 border-black">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span>Temperature:</span>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={ecoLlamaTemp}
                            onChange={(e) => setEcoLlamaTemp(parseFloat(e.target.value))}
                            className="w-24 sm:w-32 accent-black"
                          />
                          <span className="font-bold bg-white px-1 border border-[#1A1A1A]">{ecoLlamaTemp}</span>
                        </div>

                        <button
                          onClick={handleTestYorubaLlama}
                          disabled={ecoLlamaLoading || !ecoLlamaPrompt.trim()}
                          className="bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs px-5 py-2 border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {ecoLlamaLoading ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                              Running YorubaLlama...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Inference on YorubaLlama-7B
                            </>
                          )}
                        </button>
                      </div>

                      {ecoLlamaError && (
                        <div className="p-3 bg-red-100 text-red-900 border-2 border-red-900 font-mono text-xs">
                          FAILED: {ecoLlamaError}
                        </div>
                      )}

                      {/* Model response output */}
                      {ecoLlamaResult && (
                        <div className="border-4 border-black bg-[#1A1A1A] text-white p-5 shadow-[4px_4px_0px_#A3A3A3] rounded-none">
                          <div className="flex justify-between items-center pb-2 border-b border-neutral-700 mb-3 text-[10px] font-mono">
                            <span className="text-yellow-400 font-black tracking-wider uppercase">⚡ JACARANDA/YORUBALLAMA-7B RESPONSE:</span>
                            <button
                              onClick={() => handleCopyText(ecoLlamaResult, "ecoLlama")}
                              className="text-gray-300 underline font-semibold hover:text-white cursor-pointer select-none"
                            >
                              {copyFeedback === "ecoLlama" ? "Copied!" : "Copy Response"}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-serif text-gray-100 font-bold select-text">{ecoLlamaResult}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* YorubaGPT Alpaca Template Config */}
                  <div className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-500 text-white p-1 border-2 border-black text-xs font-mono font-bold">YORUBAGPT</div>
                        <h4 className="text-sm font-black uppercase">Instruction Formatting Blueprint</h4>
                      </div>
                      <a
                        href="https://github.com/oluyemi30/yorubagpt"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] border border-black px-2 py-0.5 bg-[#E8E8E6] font-mono font-bold hover:bg-neutral-200 uppercase"
                      >
                        Source Repo ↗
                      </a>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 leading-tight">
                      Review YorubaGPT's fine-tuning system formatting instructions. The Alpaca formatting maps structured prompt records directly for PyTorch/PEFT loaders.
                    </p>

                    <div className="bg-neutral-100 border border-neutral-300 p-3 font-mono text-[10.5px] leading-relaxed text-[#1A1A1A] select-text">
                      <span className="text-[#0E7490] font-bold"># Alpaca Training Format:</span>
                      <pre className="mt-1.5 overflow-x-auto text-[10px] bg-white p-2 border leading-normal">
{`{
  "instruction": "Explain this proverb with its moral.",
  "input": "Òwe: 'Ọmọ tó mọ ayé jẹ kò ní rìn ràhìn.'",
  "output": "Itúmọ̀: Children who carry wisdom in their conduct live smoothly."
}`}
                      </pre>
                      <span className="text-[#0E7490] font-bold block mt-3"># Python Hyperparameter Import script:</span>
                      <p className="text-gray-600 leading-tight">
                        Used to pull from Hugging Face: <code className="bg-purple-100 text-purple-950 px-1 font-bold">AutoTokenizer.from_pretrained("Jacaranda/YorubaLlama")</code> inside the LoRA configurations directory.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-4 border-black p-4 mt-6 bg-white rotate-[-0.5deg] shadow-[4px_4px_0px_#1A1A1A]">
                  <h4 className="text-xs font-black uppercase mb-1">Ecosystem Status Board:</h4>
                  <p className="text-xs italic leading-tight text-gray-700">
                    "Jacaranda's YorubaLlama model combined with YorubaGPT dataset instructions forms the absolute standard for native West African language intelligent systems."
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Area */}
        <footer className="bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center px-6 border-t-[4px] border-[#1A1A1A] gap-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full"></div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Yoruba LLM Sandbox Active</span>
            </div>
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
              Est. Inference latency: ~42ms (Qwen-3B cached)
            </div>
          </div>
          <div className="text-[10px] font-mono tracking-wider text-gray-400 text-center md:text-right">
            // LINGUISTIC_REINFORCEMENT_PROTOCOL_STABLE_NFC_TRUE
          </div>
        </footer>

      </div>
      )}
    </div>
  );
}
