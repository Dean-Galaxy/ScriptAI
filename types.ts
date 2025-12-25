export enum Platform {
  DOUYIN = 'Douyin (TikTok China)',
  KUAISHOU = 'Kuaishou',
  REDNOTE = 'RedNote (Xiaohongshu)',
  WECHAT_CHANNELS = 'WeChat Channels',
  WECHAT_OFFICIAL = 'WeChat Official Account',
  BILIBILI = 'Bilibili',
  YOUTUBE = 'YouTube'
}

export interface PersonaProfile {
  id: string;
  name: string;
  avatarUrl?: string; // Data URL for display
  description: string; // Short bio
  analysis: {
    languageFeatures: string[];
    visualFeatures: string[];
    platformAdvice: Record<string, string>;
    sampleSentences: string[];
  };
  rawAnalysisText: string; // The full text returned by AI for context
}

export interface ScriptRequest {
  platform: Platform;
  personaId: string;
  topicOrContent: string;
  mode: 'rewrite' | 'create';
}

export interface GeneratedScript {
  content: string; // Markdown content
  timestamp: number;
}
