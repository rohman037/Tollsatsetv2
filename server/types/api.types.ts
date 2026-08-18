/**
 * Server & API Type Definitions
 * Clean contract between Frontend (Client) and Backend (Next.js API & Services)
 */

import { SupportedModelEngine } from '../config/model-tiers.config';

export type AiTaskType =
  | 'tiktok_shop'
  | 'ide_konten'
  | 'video_to_prompt'
  | 'prompt_foto'
  | 'general';

export interface MediaFilePayload {
  name?: string;
  mimeType: string;
  data?: string; // base64 string or data URL
  base64Data?: string; // raw base64 string
  role?: 'primary' | 'reference' | 'context' | string;
}

export interface GenerateAiRequest {
  taskType: AiTaskType;
  prompt: string;
  mediaFiles?: MediaFilePayload[];
  extraData?: {
    modelEngine?: SupportedModelEngine;
    mediaFiles?: MediaFilePayload[];
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
    productUrl?: string;
    productDetail?: string;
    numIdeas?: number;
    ideaCount?: number;
    ideasCount?: number;
    productEnrichment?: any;
    groundingContext?: string;
    identityAnchorDescription?: string;
    hasVisualMedia?: boolean;
    analysisMode?: 'deep' | 'fast' | 'standard';
    includeBackgroundSound?: boolean;
    includeTextOverlay?: boolean;
    presetStyle?: string;
    targetAeo?: string;
    apiKeysPool?: string[];
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
    id?: string;
    url?: string;
    title: string;
    caption?: string;
    author: string;
    authorName?: string;
    authorNickname: string;
    authorHandle?: string;
    avatarUrl?: string;
    authorAvatar: string;
    duration: number;
    videoDuration?: number;
    videoUrl: string;
    videoUrlHd?: string;
    videoUrlWatermarked?: string;
    partialMetadataOnly?: boolean;
    play?: string;
    wmplay?: string;
    hdplay?: string;
    musicUrl?: string;
    audioUrl?: string;
    audioTitle?: string;
    audioAuthor?: string;
    coverUrl: string;
    likes?: string;
    comments?: string;
    shares?: string;
    bookmarks?: string;
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
