import { GoogleGenerativeAI} from "@google/generative-ai";
import { PersonaProfile, Platform } from "../types";

// 延迟初始化，只在需要时创建实例
let ai: GoogleGenerativeAI | null = null;

const getAI = (): GoogleGenerativeAI => {
  if (!ai) {
    // 统一使用 import.meta.env.VITE_GEMINI_API_KEY
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // 加这行！！！如果网页控制台没打印出 "V3-DEPLOY-CHECK"，说明代码没更新成功
    console.log("V3-DEPLOY-CHECK: Version V1 manual force");
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
    
    // 1. 处理图片 (这部分保持不变)
    const mimeType = imageDataUrl.startsWith('data:image/png') ? 'image/png' : 
                     imageDataUrl.startsWith('data:image/jpeg') || imageDataUrl.startsWith('data:image/jpg') ? 'image/jpeg' :
                     'image/jpeg';

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64(imageDataUrl),
      },
    };

    // 2. 构造用户具体的请求内容
    const userPrompt = `Analyze this person's style. 
    Name: ${name}
    Text Sample: "${textSample}"
    
    Extract their style profile according to the instructions above.`;

    // 3. 获取模型实例（注意：删掉了 systemInstruction 参数）
    const model = (aiInstance as any).getGenerativeModel(
      { model: "gemini-1.5-pro" },
      { apiVersion: 'v1beta' }
    );

    // 4. 调用生成（手动合并：把 PERSONA_SYSTEM_PROMPT 作为第一段文本传入）
    const result = await model.generateContent([
      { text: PERSONA_SYSTEM_PROMPT }, // 第一部分：你的身份和规则说明
      imagePart,                       // 第二部分：图片
      { text: userPrompt }             // 第三部分：具体的任务请求
    ]);

    // 后续处理...
    const response = await result.response;
    const text = response.text();
    // ...

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
      model: 'gemini-1.5-pro'
    },
    { apiVersion: 'v1beta' } as any // 重点：把版本配置放在第二个参数
    );

    // 2. 调用 generateContent
    const fullPrompt = `${SCRIPT_SYSTEM_PROMPT}\n\n以下是需要分析的内容：\n${prompt}`;
    const result = await model.generateContent(fullPrompt);

    // 3. 等待响应并调用 .text() 方法
    const response = await result.response;
    return response.text() || "Failed to generate script.";

  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error("Failed to generate script.");
  } 
}; // <-- 这一行补齐了函数的结束括号

// --- 调试专用代码 ---
export const debugListModels = async () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("正在查询可用模型列表...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("=== Google 官方返回的可用模型列表 ===");
    console.log(data);
    
    if (data.models) {
      console.log("建议尝试使用的模型名称：");
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    }
  } catch (e) {
    console.error("查询失败:", e);
  }
};

// 为了方便触发，把它挂载到 window 对象上
(window as any).checkModels = debugListModels;