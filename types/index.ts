export type UserRole = 'user' | 'superadmin';

export type PlanType = 'mingguan' | 'bulanan' | 'lifetime' | 'upgrade';

export interface UserSession {
  accessCode: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  planId: string;
  planName: string;
  status: 'aktif' | 'expired' | 'suspended';
  expiresAt: string; // ISO date
  daysRemaining: number;
  totalGenerations: number;
  customApiKey?: string;
  createdAt: string;
}

export interface PackagePlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  durationDays: number;
  badge?: string;
  targetCategory?: string; // 'Public (Calon Pembeli)' | 'Khusus Member VIP'
  isPopular?: boolean;
  features: string[];
  active: boolean;
}

export interface Transaction {
  id: string; // TRX-XXXXXX-SAT
  customerName: string;
  whatsapp: string;
  email: string;
  planId: string;
  planName: string;
  price: number;
  adminFee: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  proofUrl?: string;
  createdAt: string;
  approvedAt?: string;
  issuedAccessCode?: string;
}

export interface GenerationHistoryItem {
  id: string;
  toolType: 'ide_konten' | 'video_to_prompt' | 'prompt_foto' | 'tiktok_downloader' | 'tiktok_shop' | 'ekstraktor_frame';
  title: string;
  previewText: string;
  fullData: any;
  createdAt: string;
  timestamp?: string;
  tags: string[];
}

export interface SegmentPrompt {
  segmentIndex: number;
  timestamp: string; // e.g. "00:00 - 00:10"
  hookTitle?: string;
  actionDialogue: string;
  promptAiVideo: string;
  sceneAnalysis?: string;
  lightingCamera?: string;
  voiceOverText?: string;
  callToAction?: string;
  negativePrompt?: string;
}

export interface ContentIdeaItem {
  id: string;
  title: string;
  typeAngle: string;
  targetAudience: string;
  aeoQueryMapping: {
    shortQuery: string;
    longQuery: string;
  };
  relevanceReason: string;
  atomicSummary: string;
  consensusTrigger: string;
  hook3s: string;
  visualAudioGuide: string;
  segments: SegmentPrompt[];
  captionPersuasive: string;
  hashtags: string[];
}

export interface VideoToPromptResult {
  videoTitle: string;
  duration: string;
  splitDuration: string; // '5s' | '10s' | '15s' | 'full'
  modelUsed: string;
  analysisOverview: string;
  segments: SegmentPrompt[];
}

export interface PhotoPromptResult {
  title: string;
  masterPrompt: string;
  presetStyle: string;
  aspectRatio: string;
  targetEngine: string;
  negativePrompt: string;
  promptDetails: {
    subjectIdentity: string;
    lightingAtmosphere: string;
    cameraOptics: string;
    textureRendering: string;
  };
  sceneRelevanceAnalysis: string;
}

export interface TikTokVideoMetadata {
  id: string;
  url: string;
  title: string;
  caption: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  likes: string;
  comments: string;
  shares: string;
  bookmarks: string;
  videoDuration: number;
  videoUrl: string;
  videoUrlHd?: string;
  videoUrlWatermarked?: string;
  partialMetadataOnly?: boolean;
  coverUrl: string;
  audioTitle: string;
  audioAuthor: string;
  audioUrl: string;
}

export interface ExtractedFrameItem {
  id: string;
  timestamp: number; // in seconds
  timeStr?: string; // "00:02.40"
  dataUrl: string;
  label?: string;
  selected?: boolean;
  type?: 'auto' | 'manual';
}

export interface MemoryAgentSkill {
  id: string;
  name: string;
  category: 'Content Ideas' | 'Video AI' | 'Photo Prompt' | 'Guardrail' | 'Splitter';
  confidenceScore: number;
  executionCount: number;
  status: 'CONNECTED' | 'LEARNING' | 'INACTIVE';
  description: string;
  injectionSnippet: string;
  color: string;
}

export interface SystemKnowledgeRule {
  id: string;
  title: string;
  category: 'HOOK' | 'LIGHTING' | 'ALGORITHM' | 'COPYWRITING' | 'SAFETY';
  source: 'MANUAL' | 'AUTO_LEARNED';
  content: string;
  tag: string;
  confidence: number;
  createdAt: string;
}

export interface SafeLearningPattern {
  id: string;
  title: string;
  category: 'Umum' | 'Fashion/Beauty' | 'Herbal & Kesehatan' | 'Rumah Tangga' | 'Teknologi';
  sourceQuery: string;
  extractedPattern: string;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  isHighRiskMedical?: boolean;
  date: string;
}

export interface LoginAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  ip: string;
  device: string;
  status: 'SUCCESS' | 'FAILED' | 'VERIFIKASI_PEMBAYARAN';
  detail: string;
}

export interface LiveGenerationEvent {
  id: string;
  timestamp: string;
  userCode: string;
  userName: string;
  aiTool: string;
  category: string;
  modelUsed: string;
  latencyMs: number;
  status: 'SUCCESS' | 'FLAGGED' | 'OPTIMIZING';
  tokenCount: number;
  promptSnippet: string;
}

export interface AdminSettingsState {
  // Login UI
  loginHeaderBrand: string;
  loginBadgeInitial: string;
  loginCustomLogoUrl: string;
  loginBrandAccentColor: string;
  loginHelpButtonText: string;
  loginHeroTitle: string;
  loginVisualCardTitle: string;
  loginVisualCardDesc: string;
  loginCardGradientFrom: string;
  loginCardGradientTo: string;
  loginBentoPills: string[];
  loginFormTitle: string;
  loginFormSubtitle: string;
  loginFormCodePlaceholder: string;
  loginButtonText: string;
  loginButtonLoadingText: string;
  loginButtonColor: string;
  loginShowPricingLink: boolean;
  loginShowWhatsAppBtn: boolean;
  loginShowQuickAccess?: boolean;
  loginThemeMode?: 'light' | 'dark';
  loginBgColor: string;
  loginFooterBadges: string[];

  // User UI Dashboard
  userHeaderBrand: string;
  userBadgeInitial: string;
  userCustomLogoUrl: string;
  userBrandAccentColor: string;
  userHelpButtonText: string;
  userShowAntiLimitBadge: boolean;
  userAntiLimitText: string;
  userEnableAnnouncement: boolean;
  userAnnouncementText: string;
  userAnnouncementBgColor: string;
  userAnnouncementTextColor: string;
  userSidebarTools: {
    id: string;
    title: string;
    customLabel: string;
    badgeLabel: string;
    badgeColor: string;
    enabled: boolean;
  }[];
  userWelcomeTitle: string;
  userWelcomeDesc: string;
  userShowWelcomeCard: boolean;
  userThemeBgColor: string;
  userThemeAccentColor: string;
  userCopyrightText: string;

  // QRIS & WhatsApp
  qrisMerchantName: string;
  qrisImageUrl: string;
  waAdminPhone: string;
  waDefaultTemplate: string;

  // Gemini API Pool
  geminiPoolKeys: {
    id: string;
    alias: string;
    keyMasked: string;
    fullKey?: string;
    dailyLimit: number;
    usageToday: number;
    status: 'ACTIVE' | 'LIMIT' | 'REVOKED';
  }[];
  autoRotateKey: boolean;
}
