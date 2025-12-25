import { GoogleGenAI } from "@google/genai";
import { PersonaProfile, Platform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert base64 string to clean data for sending
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

const PERSONA_SYSTEM_PROMPT = `
You are an expert Persona Analyst for a Video Script Writing System.
Your task is to analyze text samples and an image of a person to create a structured "Style Profile".

Analyze the input based on:
1. Text Features: Sentence structure preference, vocabulary habits (slang/technical), emotional pattern, opening/closing routines.
2. Visual Features (from image): Appearance description, suggested scene/setting, facial expression/posture.

Output the result in strict JSON format matching this schema:
{
  "languageFeatures": ["feature1", "feature2"],
  "visualFeatures": ["feature1", "feature2"],
  "platformAdvice": {"General": "advice"},
  "sampleSentences": ["example1", "example2"]
}
Only output the JSON.
`;

export const analyzePersona = async (
  name: string,
  textSample: string,
  imageDataUrl: string
): Promise<PersonaProfile> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Assuming jpeg/png handling
        data: cleanBase64(imageDataUrl),
      },
    };

    const prompt = `Analyze this person's style. 
    Name: ${name}
    Text Sample: "${textSample}"
    
    Extract their style profile according to the system instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        systemInstruction: PERSONA_SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "{}";
    let analysisData;
    try {
        analysisData = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        analysisData = {
            languageFeatures: ["Analysis failed to parse"],
            visualFeatures: [],
            platformAdvice: {},
            sampleSentences: []
        };
    }

    return {
      id: crypto.randomUUID(),
      name,
      avatarUrl: imageDataUrl,
      description: `Persona based on ${name}`,
      analysis: analysisData,
      rawAnalysisText: jsonText
    };

  } catch (error) {
    console.error("Persona Analysis Error:", error);
    throw new Error("Failed to analyze persona. Please try again.");
  }
};

const SCRIPT_SYSTEM_PROMPT = `
You are a Professional Cross-Platform Video Script AI Agent.
Your goal is to generate optimized video scripts based on a specific "Persona Style" and a target "Platform".

Core Capabilities:
1. Platform Adaptation (TikTok, YouTube, RedNote, etc.)
2. Persona Mimicry (Apply analyzed style traits)
3. Script Optimization (Hooks, CTAs, Structure)

Output Format (Markdown):
# Script for [Platform]
## 1. Style Match Analysis
- [How specific traits from the profile were used]
- [Specific phrases mimicking the persona]

## 2. Visual/Acting Suggestions
- [Outfit/Look based on persona visual features]
- [Scene/Background suggestions]
- [Acting cues]

## 3. The Script
(The actual script content, formatted for the platform. e.g., Scene headers, Dialogue, On-screen text)

## 4. Metadata
- **Titles:** (3 options)
- **Tags:** (Platform specific hashtags)
- **Risk Check:** (Potential shadowban keywords)
`;

export const generateScript = async (
  platform: Platform,
  persona: PersonaProfile,
  topic: string,
  mode: 'rewrite' | 'create'
): Promise<string> => {
  try {
    const prompt = `
    TASK: ${mode === 'rewrite' ? 'Rewrite the provided text' : 'Create a new script from topic'}
    TARGET PLATFORM: ${platform}
    TOPIC/CONTENT: "${topic}"

    PERSONA PROFILE TO MIMIC:
    Name: ${persona.name}
    Language Traits: ${JSON.stringify(persona.analysis.languageFeatures)}
    Visual Traits: ${JSON.stringify(persona.analysis.visualFeatures)}
    Sample Sentences: ${JSON.stringify(persona.analysis.sampleSentences)}

    Specific Instructions:
    - If RedNote (Xiaohongshu): Use emojis, keywords, emotional resonance.
    - If TikTok/Douyin: Fast pace, 3-second hook, trending BGM suggestions.
    - If Bilibili: Cultural memes, longer form, community engagement.
    - If YouTube: SEO keywords, clear structure.

    Please generate the full response following the standard output format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SCRIPT_SYSTEM_PROMPT
      }
    });

    return response.text || "Failed to generate script.";

  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error("Failed to generate script.");
  }
};