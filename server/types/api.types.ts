/**
 * Server & API Type Definitions
 * Clean contract between Frontend (Client) and Backend (Next.js API & Services)
 */

export type AiTaskType =
  | 'tiktok_shop'
  | 'ide_konten'
  | 'video_to_prompt'
  | 'prompt_foto'
  | 'general';

export interface GenerateAiRequest {
  taskType: AiTaskType;
  prompt: string;
  extraData?: {
    modelEngine?: 'gemini-3.5-flash' | 'gemini-3.5-pro' | 'gemini-2.5-flash' | string;
    totalDuration?: string;
    splitDuration?: string;
    toneStyle?: string;
    targetMarket?: string;
    category?: string;
    photoType?: string;
    aspectRatio?: string;
    lighting?: string;
    lensType?: string;
    negativePrompt?: string;
    customKnowledge?: string;
    [key: string]: any;
  };
  customApiKey?: string;
}

export interface GenerateAiResponse<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  source: 'gemini_api' | 'smart_fallback' | 'cached_agent';
  modelUsed: string;
  tierUsed?: 'tier_1' | 'tier_2' | 'tier_3' | 'heuristic_fallback';
  keyIndexUsed?: number;
  routingDetails?: {
    modelTier: string;
    modelName: string;
    keyRotationsCount: number;
    searchGroundingActive: boolean;
    highThinkingActive: boolean;
  };
  groundingSources?: string[];
  searchQueries?: string[];
  executionTimeMs: number;
  error?: string;
}

export interface TikTokScrapeRequest {
  url: string;
}

export interface TikTokScrapeResponse {
  success: boolean;
  data?: {
    title: string;
    author: string;
    authorNickname: string;
    authorAvatar: string;
    duration: number;
    videoUrl: string;
    videoUrlHd?: string;
    musicUrl?: string;
    coverUrl: string;
    stats: {
      plays: number;
      likes: number;
      comments: number;
      shares: number;
      downloads?: number;
    };
  };
  error?: string;
}

export interface LicenseValidationRequest {
  code: string;
  machineId?: string;
}

export interface LicenseValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'superadmin';
    tier: 'free' | 'pro' | 'ultra_vip' | 'agency';
    expiryDate: string;
    daysRemaining: number;
  };
  message?: string;
}
