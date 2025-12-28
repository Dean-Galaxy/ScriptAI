import { GoogleGenerativeAI} from "@google/generative-ai";
import { PersonaProfile, Platform } from "../types";

// 延迟初始化，只在需要时创建实例
let ai: GoogleGenerativeAI | null = null;

const getAI = (): GoogleGenerativeAI => {
  if (!ai) {
    // 统一使用 import.meta.env.VITE_GEMINI_API_KEY
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // 添加这行，部署后看控制台输出的长度对不对
    console.log("Current API Key Length:", apiKey ? apiKey.length : "empty");

    if (!apiKey) {
      // 这里的 log 也同步修改，方便你调试时看提示
      console.error("API Key check failed. VITE_GEMINI_API_KEY is missing.");
      throw new Error("API Key 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY,或在 GitHub Secrets 中配置。");
    }
    
    console.log("Initializing GoogleGenAI with API key (length:", apiKey.length, ")");
    ai = new GoogleGenerativeAI(apiKey); // 注意：这里根据你引用的库版本，可能直接传字符串，也可能传对象 { apiKey }
  }
  return ai;
};

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
    const aiInstance = getAI();
    
    // 检测图片 MIME 类型
    const mimeType = imageDataUrl.startsWith('data:image/png') ? 'image/png' : 
                     imageDataUrl.startsWith('data:image/jpeg') || imageDataUrl.startsWith('data:image/jpg') ? 'image/jpeg' :
                     'image/jpeg'; // 默认为 jpeg

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64(imageDataUrl),
      },
    };

    const prompt = `Analyze this person's style. 
    Name: ${name}
    Text Sample: "${textSample}"
    
    Extract their style profile according to the system instructions.`;

    // 调用 Gemini API
    // 第一步：先获取模型实例（指定你要用的模型名称）
    const model = aiInstance.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // 如果你有系统指令，放在这里
      systemInstruction: PERSONA_SYSTEM_PROMPT, 
    });

    // 第二步：通过模型实例调用 generateContent
    // 修正后的调用方式：直接传入一个数组，不需要外层包裹 { contents: ... }
    const result = await model.generateContent([
      imagePart,           // 图片部分
      { text: prompt }     // 文字部分
    ]);

    // 然后获取响应
    const response = await result.response;
    const text = response.text();

    const jsonText = (typeof response.text === 'function' ? response.text() : response.text) || "{}";
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

  } catch (error: any) {
    console.error("Persona Analysis Error:", error);
    // 提供更详细的错误信息
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    if (errorMessage.includes("API Key") || errorMessage.includes("apiKey")) {
      throw new Error("API Key 未配置或无效。请检查环境变量 VITE_GEMINI_API_KEY。");
    }
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      throw new Error("网络连接失败。请检查您的网络连接。");
    }
    throw new Error(`创建角色失败: ${errorMessage}`);
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
  // 注意：这里我们只用一个 try-catch，结构更清晰
  try {
    const aiInstance = getAI();
    
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

    // 1. 获取模型实例
    const model = aiInstance.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SCRIPT_SYSTEM_PROMPT 
    });

    // 2. 调用 generateContent
    const result = await model.generateContent(prompt);

    // 3. 等待响应并调用 .text() 方法
    const response = await result.response;
    return response.text() || "Failed to generate script.";

  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error("Failed to generate script.");
  } 
}; // <-- 这一行补齐了函数的结束括号