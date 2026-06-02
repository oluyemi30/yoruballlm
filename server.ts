/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy reference for Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets or .env");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing support
  app.use(express.json());

  // 1. Health API
  app.get("/api/health", (req, res) => {
    const isKeySet = !!process.env.GEMINI_API_KEY;
    res.json({ status: "healthy", keyConfigured: isKeySet });
  });

  // 2. Yoruba AI Generator API
  app.post("/api/gemini/generate-data", async (req, res) => {
    try {
      const { category, count = 5 } = req.body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate ${count} high-quality, completely unique and linguistically authentic instruction-following dataset entries for the following category: "${category}".
All Yoruba words and texts MUST have proper diacritics (subdots under s, e, o like ẹ, ọ, ṣ and standard high/low/mid tone markers/accents like á, à, é, è, í, ì, ó, ò, ọ́, ọ̀, ụ́, ù to match standard Oyo/literary Yoruba grammar).
Never use flat vowels (like e or o) when subdotted/accented vowels are needed.

Output each item with:
- "instruction": Prompt explaining what the user wants in English or Yoruba.
- "input": Optional secondary contextual text or word to provide context (e.g. source translation sentence, a raw proverb, vocabulary word).
- "output": The correct, complete, premium expert response with proper Yoruba orthography and diacritics. Include translations and cultural annotations when helpful.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instruction: {
                  type: Type.STRING,
                  description: "Domain-specific prompt directing what to do"
                },
                input: {
                  type: Type.STRING,
                  description: "Data/context context parameter or empty string"
                },
                output: {
                  type: Type.STRING,
                  description: "Authentic, expert Yoruba result rich in diacritics and correct grammar"
                }
              },
              required: ["instruction", "input", "output"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      let parsedData = [];
      try {
        parsedData = JSON.parse(responseText);
      } catch (err) {
        // Fallback parse
        console.error("Failed to parse JSON response:", responseText);
        parsedData = [];
      }

      res.json({ success: true, count: parsedData.length, data: parsedData });
    } catch (error: any) {
      console.error("Data generation error:", error);
      res.status(500).json({ success: false, error: error.message || "An error occurred during dataset generation." });
    }
  });

  // 3. Yoruba LLM Evaluator API
  app.post("/api/gemini/evaluate-response", async (req, res) => {
    try {
      const { instruction, input, reference, candidate } = req.body;
      if (!reference || !candidate) {
        return res.status(400).json({ success: false, error: "Missing reference or candidate texts for evaluation" });
      }

      const ai = getGeminiClient();

      const evaluationPrompt = `You are an AI Evaluation Engineer and a Yoruba Academic linguist. Evaluate a Yoruba LLM's response against a high-quality human reference.
Context:
- Instruction: ${instruction || "N/A"}
- Extra Input: ${input || "None"}
- Correct Reference Standard: "${reference}"
- Candidate Model Prediction Output: "${candidate}"

Examine:
1. Translation Accuracy / Semantic Completeness (Did it lose meaning or skew facts?)
2. Yoruba Grammar and Morphology (Are sentence patterns and word combinations correct?)
3. Diacritics Preservation (Did it omit subdots/vowel accents tildes/dots e.g., ẹ, ọ, ṣ and tonal markers? Estimate percentage written vs omitted).
4. Cultural Nuance / Idiomatic alignment (Is the tone natural or too literal/robotic?).

Provide a structured evaluation directly in JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: {
                type: Type.INTEGER,
                description: "Overall Rating on a strict 1 (Poor) to 5 (Masterful/Perfect) scale."
              },
              translationScore: { type: Type.INTEGER },
              grammarScore: { type: Type.INTEGER },
              diacriticsScore: { type: Type.INTEGER },
              culturalScore: { type: Type.INTEGER },
              diacriticsPercentEstimate: {
                type: Type.NUMBER,
                description: "Estimated percentage (0 to 100) of correctly preserved Yoruba subdots and tonal accents"
              },
              strengths: {
                type: Type.STRING,
                description: "Positive notes on the candidate's output"
              },
              weaknesses: {
                type: Type.STRING,
                description: "Specific mistakes, omissions, or unnatural Yoruba phrasing"
              },
              suggestedCorrection: {
                type: Type.STRING,
                description: "Show a corrected perfect response for training further epochs"
              }
            },
            required: [
              "overallScore",
              "translationScore",
              "grammarScore",
              "diacriticsScore",
              "culturalScore",
              "diacriticsPercentEstimate",
              "strengths",
              "weaknesses",
              "suggestedCorrection"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const evaluationResult = JSON.parse(responseText);
      res.json({ success: true, evaluation: evaluationResult });
    } catch (error: any) {
      console.error("Evaluation response error:", error);
      res.status(500).json({ success: false, error: error.message || "An error occurred during response evaluation." });
    }
  });

  // 4. Yoruba Linguistic AI Chat / Translation Sandbox API
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const ai = getGeminiClient();

      const chatMessages = messages.map((m: any) => ({
        role: m.role || "user",
        parts: [{ text: m.content || m.text }]
      }));

      const defaultSystem = `You are 'Olówó-Ọgbọ́n', a world-class Yoruba Linguistic Tutor and AI Trainer. Your focus is to model proper Yoruba orthography (Oyo dialect / Standard written Yoruba), explain grammar, proverbs, translations, and historical cultural contexts.
Always write Yoruba with proper diacritics: subdots under e, o, s (ẹ, ọ, ṣ) and tone marks: acute accent (´, high tone) and grave accent (\`, low tone). Explain errors gently, encourage the user, and help them design pipelines to build Yoruba AI models.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatMessages,
        config: {
          systemInstruction: systemInstruction || defaultSystem,
          temperature: 0.3,
        }
      });

      res.json({ success: true, reply: response.text });
    } catch (error: any) {
      console.error("Linguistic Coach Chat error:", error);
      res.status(500).json({ success: false, error: error.message || "An error occurred during chat reasoning." });
    }
  });

  // 5. Yoruba Diacritics Normalization API
  app.post("/api/gemini/normalize-text", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.json({ success: true, result: "" });
      }

      const ai = getGeminiClient();

      const normalizePrompt = `The following is a raw text fragment which contains either Yoruba with missing/broken accents and diacritics, or raw English/mixed Yoruba. 
Please normalize it. 
Specifically:
1. Correct the Yoruba spelling by adding standard diacritics (subdots: ẹ, ọ, ṣ; tone accents: acute (á), grave (à)) on all appropriate letters.
2. Maintain English segments as-is if they are English. 
3. Perform Unicode NFC normalization on the final output (ensure accents and vowels are unified compositions, not separate decomposed byte characters).
4. Detect the primary language percentage (Yoruba vs English vs Mixed).

Input: "${text}"

Output a clean JSON with the keys below.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: normalizePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              normalizedText: {
                type: Type.STRING,
                description: "The complete normalized sentence with beautiful NFC diacritics"
              },
              primaryLanguage: {
                type: Type.STRING,
                description: "Detected primary language (e.g. Yoruba, English, Mixed)"
              },
              hasProperDiacritics: {
                type: Type.BOOLEAN,
                description: "True if Yoruba content originally had diacritics or if we added them successfully"
              },
              diacriticCountAdded: {
                type: Type.INTEGER,
                description: "Approximate count of dots and accents added"
              }
            },
            required: ["normalizedText", "primaryLanguage", "hasProperDiacritics", "diacriticCountAdded"]
          }
        }
      });

      const responseText = response.text || "{}";
      const resultObj = JSON.parse(responseText);
      res.json({ success: true, ...resultObj });
    } catch (error: any) {
      console.error("Diacritic normalization error:", error);
      res.status(500).json({ success: false, error: error.message || "normalization failure" });
    }
  });

  // 6. YorubaName Corpus & Pronunciation Parser API
  app.post("/api/yorubaname/parse", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Please provide a name to analyze." });
      }

      const ai = getGeminiClient();
      const prompt = `You are a Yoruba naming academic and onomastics specialist. Analyze the Yoruba name "${name}" as structured in the yorubaname-website registry.
      Analyze and breakdown the following:
      1. Correct standard orthography & diacritics representation.
      2. Syllable division (e.g., O-lu-ya-to-si-mi).
      3. Tonal pattern designation using standard Yoruba tones (Low/Mid/High represented as Do, Re, Mi).
      4. Detailed etymological translation and meaning (Break down constituent words e.g., 'oluwa' (lord) + 'to' (enough/worthy)).
      5. Historical background, geographic origin, and oriki (traditional panegyric / spiritual salutation) associated with children given this name.
      
      Provide a beautifully structured JSON response.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accentedName: { type: Type.STRING, description: "Correctly capitalized name with proper tone marks and subdots" },
              syllables: { type: Type.STRING, description: "Hyphenated syllables e.g. A-dé-báyọ̀" },
              tonalPattern: { type: Type.STRING, description: "Pitch tone configuration e.g. Mi-Do-High-Low" },
              literalMeaning: { type: Type.STRING, description: "Word-by-word structural etymological breakdown" },
              fullMeaning: { type: Type.STRING, description: "Full cultural, spiritual, or historical details of the name" },
              orikiSalutation: { type: Type.STRING, description: "Panegyric / Oriki poem in Yoruba with English translation" }
            },
            required: ["accentedName", "syllables", "tonalPattern", "literalMeaning", "fullMeaning", "orikiSalutation"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);
      res.json({ success: true, analysis: result });
    } catch (error: any) {
      console.error("YorubaName lookup error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed parsing Yoruba name." });
    }
  });

  // 7. Jacaranda/YorubaLlama Simulated Weights API
  app.post("/api/yoruballama/simulate", async (req, res) => {
    try {
      const { prompt, temperature = 0.4 } = req.body;
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ success: false, error: "Please enter a model input prompt." });
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are Jacaranda's YorubaLlama-7B, a state-of-the-art open-source 7-billion parameter language model trained natively on billions of Yoruba language tokens. 
      Respond to the user's prompt directly in clean, authentic Yoruba. Always employ flawless Oyo/literary diacritical tone marks (ẹ, ọ, ṣ, à, á). 
      Demonstrate dense vocabulary, fluid grammatical structure, and natural idioms. If they ask in English, provide translation or bilingual response as appropriate. Keep the output focused, concise and impactful.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: parseFloat(temperature.toString()) || 0.4,
          maxOutputTokens: 1024
        }
      });

      res.json({ success: true, response: response.text });
    } catch (error: any) {
      console.error("YorubaLlama simulation error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed running YorubaLlama inference emulation." });
    }
  });

  // 8. Yoruba-Text Corpus Profiler API
  app.post("/api/yorubatext/corpus-profile", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: "Empty corpus content." });
      }

      // Live metrics calculation
      const characterCount = text.length;
      const cleanWords = text.trim().split(/\s+/).filter(Boolean);
      const wordCount = cleanWords.length;

      // Unique tokens list
      const uniqueWords = new Set(cleanWords.map(w => w.toLowerCase().replace(/[.,!?;:()]/g, "")));
      const vocabularyRichness = wordCount > 0 ? (uniqueWords.size / wordCount) * 100 : 0;

      // Diacritics matching
      const subdots = (text.match(/[ẹọṣẸỌṢ]/g) || []).length;
      const acutes = (text.match(/[áéíóúÁÉÍÓÚ]/g) || []).length;
      const graves = (text.match(/[àèìòùÀÈÌÒÙ]/g) || []).length;
      const combinedTones = (text.match(/[ọ́ọ̀ẹ̀ẹ̀ṣ]/g) || []).length; // extra combined tracking
      
      const totalDiacritics = subdots + acutes + graves;
      const diacriticDensity = characterCount > 0 ? (totalDiacritics / characterCount) * 100 : 0;

      // Grade text based on academic quality guidelines
      let structuralQuality = "Low";
      if (diacriticDensity > 8 && vocabularyRichness > 50) {
        structuralQuality = "A+ Academic Grade (Optimal for Fine-Tuning)";
      } else if (diacriticDensity > 4 && vocabularyRichness > 35) {
        structuralQuality = "B Grade (Acceptable with NFC normalizers)";
      } else {
        structuralQuality = "C Grade (Flat or high English-mixing, needs cleansing)";
      }

      const analysis = {
        characterCount,
        wordCount,
        vocabularySize: uniqueWords.size,
        vocabularyRichness: parseFloat(vocabularyRichness.toFixed(1)),
        subdotsCount: subdots,
        acutesCount: acutes,
        gravesCount: graves,
        diacriticDensity: parseFloat(diacriticDensity.toFixed(2)),
        qualityGrade: structuralQuality
      };

      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error("Corpus profiler error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed profiling corpus text." });
    }
  });

  // Vite development server / Production static bundle router
  if (process.env.NODE_ENV !== "production") {
    // Setup Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Direct static path
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Yoruba LLM Suite Server] running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

// Start
startServer().catch((error) => {
  console.error("Failed to start the Express + Vite server:", error);
});
