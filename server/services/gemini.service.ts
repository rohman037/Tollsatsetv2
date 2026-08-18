import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { GenerateAiRequest, GenerateAiResponse, MediaFilePayload } from '../types/api.types';
import { GEMINI_MODELS, ModelTierItem } from '../config/model-tiers.config';
import { ProductEnrichmentService } from './product-enrichment.service';

interface KeyHealth {
  key: string;
  index: number;
  lastFailureTime: number;
  failureCount: number;
  isCoolingDown: boolean;
  isPermanentlyDisabled?: boolean;
}

export class GeminiBackendService {
  // Global rotation cursor for balanced round-robin across requests
  private static keyCursor = 0;
  // In-memory key health tracker
  private static keyHealthMap = new Map<string, KeyHealth>();
  // Cooldown period in ms after a rate-limit / 429 error (30 seconds)
  private static readonly COOLDOWN_MS = 30000;

  /**
   * Sanitizes and validates a Gemini API key to ensure it is clean of invalid characters,
   * newlines, quotes, or placeholders before passing to GoogleGenAI SDK.
   */
  public static sanitizeApiKey(key?: any): string | null {
    if (!key || typeof key !== 'string') return null;

    // 1. Remove BOM, zero-width characters, surrounding quotes, whitespace, carriage returns, newlines
    let cleaned = key
      .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
      .trim()
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/[\r\n\t\f\v\0]/g, '')
      .trim();

    // 2. Reject placeholders or invalid keywords
    if (
      !cleaned ||
      cleaned === 'MY_GEMINI_API_KEY' ||
      cleaned === 'undefined' ||
      cleaned === 'null' ||
      cleaned.length < 15
    ) {
      return null;
    }

    // 3. Reject OAuth tokens, Vertex bearer tokens, or invalid prefix keys that cause 401/403
    if (
      cleaned.startsWith('AQ.') ||
      cleaned.startsWith('ya29.') ||
      cleaned.startsWith('Bearer ') ||
      cleaned.includes(' ')
    ) {
      return null;
    }

    // 4. Strict HTTP header safe character filter (alphanumerics, underscores, dashes, dots)
    const strict = cleaned.replace(/[^A-Za-z0-9_\-\.]/g, '');
    if (strict.length < 15) return null;

    return strict;
  }

  /**
   * Main entrypoint for processing AI tasks across all tools
   * Supports:
   * 1. Multi-API Key Routing (Key 1 -> Key 2 -> Key 3 -> Key N)
   * 2. Strict Model Tier Prioritization (Tier 1 -> Tier 2 -> Tier 3)
   * 3. Google Search Grounding with gemini-3.5-flash
   * 4. High Thinking Mode with gemini-3.1-pro-preview (ThinkingLevel.HIGH)
   * 5. Ultra Low-Latency with gemini-3.1-flash-lite (ThinkingLevel.MINIMAL)
   * 6. Multimodal media processing (Images, Video frames, Documents)
   */
  public static async processAiTask(
    request: GenerateAiRequest
  ): Promise<GenerateAiResponse> {
    const startTime = Date.now();
    let { taskType, prompt, extraData, customApiKey } = request;

    // Collect media files from top-level or extraData
    const mediaFiles: MediaFilePayload[] = [
      ...(request.mediaFiles || []),
      ...(extraData?.mediaFiles || []),
    ];

    // Pre-enrich product URL for TikTok Shop task
    if (taskType === 'tiktok_shop') {
      const rawProductUrl = extraData?.productUrl || prompt.match(/https?:\/\/[^\s]+/)?.[0];
      if (rawProductUrl && typeof rawProductUrl === 'string') {
        try {
          const enriched = await ProductEnrichmentService.enrichProductUrl(rawProductUrl);
          if (enriched) {
            extraData = {
              ...(extraData || {}),
              productEnrichment: enriched,
              productUrl: rawProductUrl,
            };
          }
        } catch (enrichErr) {
          console.warn('[GeminiBackendService] Product enrichment error (continuing without enrichment):', enrichErr);
        }
      }
    }

    // 1. Gather all available API keys into a prioritized pool
    const keyPool = this.resolveApiKeyPool(customApiKey, extraData);

    // 2-Stage Grounding Pipeline for ide_konten (Vision Grounding + Identity Anchor)
    if (taskType === 'ide_konten' && mediaFiles.length > 0 && keyPool.length > 0) {
      const primaryVideo = mediaFiles.find(
        (m) =>
          (m.role === 'primary' || m.mimeType?.startsWith('video/')) &&
          (m.data || m.base64Data)
      );
      const refImage = mediaFiles.find(
        (m) =>
          (m.role === 'reference' || (m.mimeType?.startsWith('image/') && m !== primaryVideo)) &&
          (m.data || m.base64Data)
      );

      const groundingApiKey = this.getOrderedKeys(keyPool)[0] || keyPool[0];

      if (groundingApiKey && (primaryVideo || refImage)) {
        const groundingAi = new GoogleGenAI({
          apiKey: groundingApiKey,
        });

        // Tahap 1: Vision Grounding (jika ada video)
        let groundingContext = '';
        if (primaryVideo) {
          try {
            const rawData = primaryVideo.data || primaryVideo.base64Data || '';
            const base64Data = rawData.includes(',') ? rawData.split(',')[1] : rawData;

            console.log('[GeminiBackendService] Executing Tahap 1: Vision Grounding on video...');
            const groundRes = await groundingAi.models.generateContent({
              model: GEMINI_MODELS.FLASH_LITE || 'gemini-3.1-flash-lite',
              contents: [
                {
                  role: 'user',
                  parts: [
                    { inlineData: { mimeType: primaryVideo.mimeType, data: base64Data } },
                    { text: 'Ekstrak detail faktual visual & audio dari video ini untuk visual grounding.' },
                  ],
                },
              ],
              config: {
                systemInstruction: `Anda adalah AI Video Grounding & Visual Truth Extractor. Analisis video secara faktual dan ketat tanpa asumsi/halusinasi.
Ekstrak HANYA apa yang BENAR-BENAR terlihat dan terdengar di dalam video:
1. Objek & Produk Nyata: Nama spesifik, warna, bahan, bentuk, detail unik, logo/branding yang terlihat.
2. Aksi & Gerakan Nyata: Aksi tangan, pergerakan subjek, demonstrasi yang benar-benar terjadi.
3. Setting & Environment: Latar belakang ruangan/lokasi, pencahayaan, suasana nyata.
4. Ekspresi & Persona: Ekspresi wajah, gesture, interaksi subjek.
5. Audio / Teks Terlihat: Transkrip dialog atau teks di layar jika terbaca.
PENTING: WAJIB tandai eksplisit "[Kurang yakin/Tidak terdeteksi]" untuk bagian yang tidak jelas. DILARANG MENGARANG atau menambahkan objek fiktif!`,
                temperature: 0.1,
              },
            });
            groundingContext = groundRes.text?.trim() || '';
          } catch (groundErr) {
            console.warn('[GeminiBackendService] Stage 1 Video Grounding notice (falling back to prompt):', groundErr);
          }
        }

        // Tahap 1.5: Identity Anchor (jika ada reference image)
        let identityAnchorDescription = '';
        if (refImage) {
          try {
            const rawData = refImage.data || refImage.base64Data || '';
            const base64Data = rawData.includes(',') ? rawData.split(',')[1] : rawData;

            console.log('[GeminiBackendService] Executing Tahap 1.5: Identity Anchor on reference image...');
            const anchorRes = await groundingAi.models.generateContent({
              model: GEMINI_MODELS.FLASH_LITE || 'gemini-3.1-flash-lite',
              contents: [
                {
                  role: 'user',
                  parts: [
                    { inlineData: { mimeType: refImage.mimeType, data: base64Data } },
                    { text: 'Deskripsikan profil ciri khas visual subjek/produk untuk visual identity anchor.' },
                  ],
                },
              ],
              config: {
                systemInstruction: `You are an expert AI Visual Anchor & Consistency Specialist.
Write exactly ONE dense paragraph in English describing the distinctive visual features of the subject/product in this reference image (colors, exact materials, geometry, distinctive logos, facial features if a person, lighting style). This will be used as a hard identity anchor across all video prompts to maintain absolute character/product consistency and prevent visual flickering across shots.`,
                temperature: 0.1,
              },
            });
            identityAnchorDescription = anchorRes.text?.trim() || '';
          } catch (anchorErr) {
            console.warn('[GeminiBackendService] Stage 1.5 Identity Anchor notice:', anchorErr);
          }
        }

        extraData = {
          ...(extraData || {}),
          groundingContext: groundingContext || undefined,
          identityAnchorDescription: identityAnchorDescription || undefined,
          hasVisualMedia: Boolean(primaryVideo || refImage),
        };
      }
    }

    // 2. Resolve Model Tiers (Strictly Tier 1 -> Tier 2 -> Tier 3)
    const tiers = this.resolveModelTiers(taskType, extraData);

    if (keyPool.length === 0) {
      console.warn('[GeminiBackendService] No API Keys found in pool or env. Using Smart Resilient Fallback.');
      const fallbackData = this.generateSmartFallback(taskType, prompt, extraData);
      return {
        success: true,
        data: fallbackData,
        source: 'smart_fallback',
        modelUsed: 'heuristic-engine-v2',
        tierUsed: 'heuristic_fallback',
        executionTimeMs: Date.now() - startTime,
      };
    }

    let keyRotationsCount = 0;
    const errorsLog: string[] = [];

    // 3. Sequential Tier Execution: Prioritize Tier 1 first, fallback to Tier 2, then Tier 3
    for (const tierConfig of tiers) {
      // For each tier, attempt calls across available API Keys in sequence
      const orderedKeys = this.getOrderedKeys(keyPool);
      if (orderedKeys.length === 0) {
        console.warn('[GeminiBackendService] No active/valid keys remaining in pool. Skipping to domain fallback.');
        break;
      }

      for (let i = 0; i < orderedKeys.length; i++) {
        const currentKey = orderedKeys[i];
        const keyDisplayIndex = i + 1;

        try {
          console.log(
            `[GeminiBackendService] Executing [${tierConfig.tier.toUpperCase()}] Model: ${tierConfig.model} using API Key #${keyDisplayIndex} (Task: ${taskType}, MediaParts: ${mediaFiles.length})`
          );

          const ai = new GoogleGenAI({
            apiKey: currentKey,
          });

          const systemInstruction = this.buildSystemInstruction(taskType, extraData);
          const userPrompt = this.buildUserPrompt(taskType, prompt, extraData);

          // Build parts (multimodal media files + user text prompt)
          const parts: any[] = [];

          if (mediaFiles && mediaFiles.length > 0) {
            for (const media of mediaFiles) {
              if (media.data && media.mimeType) {
                const base64Data = media.data.includes(',')
                  ? media.data.split(',')[1]
                  : media.data;
                parts.push({
                  inlineData: {
                    mimeType: media.mimeType,
                    data: base64Data,
                  },
                });
              }
            }
          }

          parts.push({ text: userPrompt });

          // Build configuration
          const config: any = {
            systemInstruction,
            temperature: 0.7,
          };

          // Configure High Thinking or Low Latency
          if (tierConfig.useHighThinking && tierConfig.model.includes('gemini-3.1-pro')) {
            config.thinkingConfig = {
              thinkingLevel: ThinkingLevel.HIGH,
            };
            // Per system rules: Do not set maxOutputTokens when using High Thinking
          } else if (tierConfig.useLowLatency && tierConfig.model.includes('flash-lite')) {
            config.thinkingConfig = {
              thinkingLevel: ThinkingLevel.MINIMAL,
            };
          }

          // Configure Search Grounding (only for models that support it and without image parts)
          if (tierConfig.useSearchGrounding && mediaFiles.length === 0) {
            config.tools = [{ googleSearch: {} }];
          }

          const response = await ai.models.generateContent({
            model: tierConfig.model,
            contents: [{ role: 'user', parts }],
            config,
          });

          const rawText = response.text || '';
          const parsedData = this.parseJsonOrCleanText(rawText, taskType, prompt, extraData);

          // Record key success
          this.recordKeySuccess(currentKey);

          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const searchGroundingQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;

          return {
            success: true,
            data: parsedData,
            rawText,
            source: 'gemini_api',
            modelUsed: tierConfig.model,
            tierUsed: tierConfig.tier,
            keyIndexUsed: keyDisplayIndex,
            routingDetails: {
              modelTier: tierConfig.tier,
              modelName: tierConfig.model,
              keyRotationsCount,
              searchGroundingActive: tierConfig.useSearchGrounding && mediaFiles.length === 0,
              highThinkingActive: tierConfig.useHighThinking,
            },
            groundingSources: groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean),
            searchQueries: searchGroundingQueries,
            executionTimeMs: Date.now() - startTime,
          };
        } catch (err: any) {
          keyRotationsCount++;
          const errorMsg = err?.message || String(err);
          errorsLog.push(`[${tierConfig.tier} | Key #${keyDisplayIndex} (${tierConfig.model})]: ${errorMsg}`);
          console.warn(
            `[GeminiBackendService] Failed on [${tierConfig.tier}] with Key #${keyDisplayIndex}: ${errorMsg}. Auto-routing to next key/tier...`
          );

          // Record key failure with temporary cooldown for rate limit / 429
          this.recordKeyFailure(currentKey, errorMsg);
        }
      }
    }

    // 4. If all Tiers and all API Keys are exhausted, seamlessly deliver resilient smart domain fallback
    console.warn(
      `[GeminiBackendService] All Model Tiers and API Keys exhausted. Activating Resilient Domain Fallback. Errors summary:`,
      errorsLog.slice(-3)
    );

    const fallbackData = this.generateSmartFallback(taskType, prompt, extraData);
    return {
      success: true,
      data: fallbackData,
      source: 'smart_fallback',
      modelUsed: 'heuristic-engine-v2',
      tierUsed: 'heuristic_fallback',
      keyIndexUsed: 0,
      routingDetails: {
        modelTier: 'heuristic_fallback',
        modelName: 'heuristic-engine-v2',
        keyRotationsCount,
        searchGroundingActive: false,
        highThinkingActive: false,
      },
      executionTimeMs: Date.now() - startTime,
      error: errorsLog.join(' | '),
    };
  }

  /**
   * Builds the prioritized list of API keys from custom input, client pools, and environment
   */
  private static resolveApiKeyPool(customApiKey?: string, extraData?: any): string[] {
    const pool: string[] = [];

    const addKey = (rawKey: any) => {
      const sanitized = this.sanitizeApiKey(rawKey);
      if (sanitized && !pool.includes(sanitized)) {
        pool.push(sanitized);
      }
    };

    // 1. Custom client key (Highest priority if provided)
    if (customApiKey) {
      addKey(customApiKey);
    }

    // 2. Extra data key pool
    if (Array.isArray(extraData?.apiKeysPool)) {
      for (const k of extraData.apiKeysPool) {
        addKey(k);
      }
    }

    // 3. Primary server environment keys (Key 1, Key 2, Key 3, Key 4, Key 5)
    [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].forEach((k) => {
      addKey(k);
    });

    // 4. Delimited list in GEMINI_API_KEYS (e.g. key1,key2,key3)
    if (process.env.GEMINI_API_KEYS) {
      const splitKeys = process.env.GEMINI_API_KEYS.split(/[\r\n,;]+/);
      for (const k of splitKeys) {
        addKey(k);
      }
    }

    return pool;
  }

  /**
   * Sorts keys prioritizing healthy keys and rotates starting index.
   * Completely filters out permanently disabled keys (401 unauthenticated, 403 suspended, etc.)
   */
  private static getOrderedKeys(keys: string[]): string[] {
    const now = Date.now();
    const healthy: string[] = [];
    const coolingDown: string[] = [];

    for (const key of keys) {
      const health = this.keyHealthMap.get(key);
      // Strictly skip permanently disabled keys (suspended / invalid auth / 401 / 403)
      if (health?.isPermanentlyDisabled) {
        continue;
      }
      if (health && health.isCoolingDown && now - health.lastFailureTime < this.COOLDOWN_MS) {
        coolingDown.push(key);
      } else {
        healthy.push(key);
      }
    }

    if (healthy.length === 0 && coolingDown.length === 0) {
      return [];
    }

    if (healthy.length === 0) {
      return coolingDown;
    }

    // Rotate cursor for healthy keys
    const startIdx = this.keyCursor % healthy.length;
    this.keyCursor = (this.keyCursor + 1) % 1000000;

    const rotatedHealthy = [
      ...healthy.slice(startIdx),
      ...healthy.slice(0, startIdx),
    ];

    return [...rotatedHealthy, ...coolingDown];
  }

  private static recordKeySuccess(key: string) {
    const existing = this.keyHealthMap.get(key);
    if (existing) {
      existing.failureCount = 0;
      existing.isCoolingDown = false;
    }
  }

  private static recordKeyFailure(key: string, errorMsg: string) {
    const lower = (errorMsg || '').toLowerCase();
    const isPermanent =
      lower.includes('consumer_suspended') ||
      lower.includes('permission_denied') ||
      lower.includes('permission denied') ||
      lower.includes('api_key_invalid') ||
      lower.includes('api key not valid') ||
      lower.includes('access_token_type_unsupported') ||
      lower.includes('unauthenticated') ||
      lower.includes('invalid authentication credentials') ||
      lower.includes('headers.append') ||
      lower.includes('401') ||
      lower.includes('403');

    const isRateLimit =
      lower.includes('429') ||
      lower.includes('resource_exhausted') ||
      lower.includes('quota exceeded') ||
      lower.includes('overloaded');

    const existing = this.keyHealthMap.get(key) || {
      key,
      index: 0,
      lastFailureTime: 0,
      failureCount: 0,
      isCoolingDown: false,
      isPermanentlyDisabled: false,
    };

    existing.lastFailureTime = Date.now();
    existing.failureCount += isPermanent ? 100 : 1;
    existing.isPermanentlyDisabled = isPermanent;
    existing.isCoolingDown = isPermanent || isRateLimit || existing.failureCount >= 2;
    this.keyHealthMap.set(key, existing);
  }

  /**
   * Model Tier Strategy Builder
   * Prioritizes Tier 1 first, then Tier 2, then Tier 3 using GEMINI_MODELS constants
   */
  private static resolveModelTiers(taskType: string, extraData?: any): ModelTierItem[] {
    const requestedModel = extraData?.model || extraData?.modelEngine;
    const isDeepMode = extraData?.analysisMode === 'deep';
    const isFastMode = extraData?.analysisMode === 'fast';

    // 1. TikTok Shop:
    // Tier 1: gemini-3.5-flash with Search Grounding (or gemini-3.1-pro-preview with High Thinking in Deep Mode)
    // Tier 2: gemini-3.1-pro-preview or gemini-3.5-flash
    // Tier 3: gemini-3.1-flash-lite (Minimal latency)
    if (taskType === 'tiktok_shop') {
      if (isDeepMode) {
        return [
          { tier: 'tier_1', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
          { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
        ];
      }
      if (isFastMode) {
        return [
          { tier: 'tier_1', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: GEMINI_MODELS.FLASH_2_5, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: GEMINI_MODELS.FLASH, useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 2. Ide Konten AEO:
    // Tier 1: gemini-3.5-flash with Search Grounding (Live UGC queries & TikTok trends)
    // Tier 2: gemini-3.1-pro-preview (Deep reasoning on script formulas)
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'ide_konten') {
      if (isDeepMode) {
        return [
          { tier: 'tier_1', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
          { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
        ];
      }
      return [
        { tier: 'tier_1', model: GEMINI_MODELS.FLASH, useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 3. Video-to-Prompt (Multimodal & Scene Decomposition):
    // Tier 1: gemini-3.1-pro-preview with High Thinking (ThinkingLevel.HIGH)
    // Tier 2: gemini-3.5-flash
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'video_to_prompt') {
      if (isFastMode || requestedModel === GEMINI_MODELS.FLASH_LITE) {
        return [
          { tier: 'tier_1', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: GEMINI_MODELS.FLASH_2_5, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 4. Prompt Foto Nano:
    // Tier 1: gemini-3.5-flash (High-fidelity camera optical formulations)
    // Tier 2: gemini-3.1-pro-preview
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'prompt_foto') {
      if (isFastMode) {
        return [
          { tier: 'tier_1', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: GEMINI_MODELS.FLASH_2_5, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // General default fallback tiers
    return [
      { tier: 'tier_1', model: requestedModel || GEMINI_MODELS.FLASH, useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
      { tier: 'tier_2', model: GEMINI_MODELS.PRO, useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
      { tier: 'tier_3', model: GEMINI_MODELS.FLASH_LITE, useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
    ];
  }

  /**
   * Builds custom system instructions per task type with strict anti-slop guidelines
   */
  private static buildSystemInstruction(taskType: string, config: any): string {
    const customKnowledge = config?.customKnowledge
      ? `\nKNOWLEDGE BASE AKTIF:\n${config.customKnowledge}\n`
      : '';

    switch (taskType) {
      case 'tiktok_shop': {
        const totalIdeas = Math.min(Math.max(Number(config?.numIdeas || config?.ideaCount || 3), 1), 5);
        return `Anda adalah AI Top-Tier TikTok Shop Growth & Conversion Architect.
Tugas Anda:
1. Ekstraksi 5 Pilar Produk: Category, Ingredients/Material, Pain Points, Benefits, Target User.
2. Enrichment Grok: priceRange, rating, usp, moodTone.
3. Hasilkan 8-12 TikTok SEO Keywords terbagi dalam 5 kategori: Problem/Pain Point, Ingredients/Spesifikasi, Benefit & Solution, Target User Specific, Comparison & Recommendation.
4. GENERATE PERSIS ${totalIdeas} IDE KONTEN VIRAL (Wajib ada TEPAT ${totalIdeas} elemen di array 'ideas', tidak boleh kurang atau lebih) dengan klip terpecah (${config?.splitDuration || 'Tiap 10 Detik'}) lengkap dengan Hook 3s visual motion, dialog VO natural, prompt video AI siap render (gaya e-commerce komersial tanpa glitch), caption, dan hashtag.

Format WAJIB JSON persis seperti berikut (tanpa teks pembuka):
{
  "fivePillars": {
    "category": string,
    "ingredients": string,
    "painPoints": string,
    "benefits": string,
    "targetUser": string
  },
  "grokEnrichment": {
    "priceRange": string,
    "rating": string,
    "usp": string,
    "moodTone": string
  },
  "seoKeywords": [
    { "category": string, "query": string }
  ],
  "ideas": [
    /* Wajib berisi TEPAT ${totalIdeas} elemen ide */
    {
      "id": string,
      "title": string,
      "querySeo": string,
      "angle": string,
      "targetAudience": string,
      "hook3s": string,
      "segments": [
        {
          "segmentIndex": number,
          "timestamp": string,
          "actionDialogue": string,
          "promptAiVideo": string
        }
      ],
      "caption": string,
      "hashtags": string[]
    }
  ]
}${customKnowledge}`;
      }

      case 'ide_konten': {
        const count = Math.min(Math.max(Number(config?.ideaCount || config?.ideasCount || 5), 1), 5);
        return `Anda adalah AI TikTok AEO (Answer Engine Optimization) & Viral Video Architect dengan Pipeline 2-Tahap Grounding Faktual.
TUGAS UTAMA:
- Hasilkan TEPAT ${count} ide konten unik dan terstruktur (Jumlah ide yang dihasilkan = ${count}).
- Gunakan bahasa percakapan UGC Indonesia yang sangat natural, tanpa kata-kata klise/kaku (Anti-Slop).
- ATURAN KETAT ANTI-HALUSINASI VISUAL: Gunakan HANYA informasi dari [TAHAP 1: HASIL VISION & FACTUAL GROUNDING] di bawah untuk mendeskripsikan objek/produk, aksi tangan, dan environment asli pada setiap segmen prompt AI video. DILARANG KERAS MENGARANG atau menambahkan detail visual/produk fiktif yang tidak disebutkan di groundingContext.
- ATURAN KONSISTENSI VISUAL (IDENTITY ANCHOR): Jika tersedia [TAHAP 1.5: IDENTITY ANCHOR VISUAL PROFILE], sertakan deskripsi ciri visual subjek/produk tersebut secara konsisten pada setiap prompt video AI untuk mencegah flickering karakter/produk antar klip.
- Setiap ide memiliki Hook 3 detik awal, breakdown adegan per segmen (${config?.splitDuration || '10s'}), prompt AI Video Generator presisi (Style, Environment, Camera, Lighting, Actions, Dialogue, Text Overlay, Negative Prompt), caption estetik, dan hashtag relevan.
- Total durasi target: ${config?.totalDuration || '60 Detik'}.

Format WAJIB JSON array dengan TEPAT ${count} item:
[
  {
    "id": string,
    "title": string,
    "typeAngle": string,
    "targetAudience": string,
    "aeoQueryMapping": {
      "shortQuery": string,
      "longQuery": string
    },
    "relevanceReason": string,
    "atomicSummary": string,
    "consensusTrigger": string,
    "hook3s": string,
    "visualAudioGuide": string,
    "segments": [
      {
        "segmentIndex": number,
        "timestamp": string,
        "actionDialogue": string,
        "promptAiVideo": string
      }
    ],
    "caption": string,
    "hashtags": string[]
  }
]${customKnowledge}`;
      }

      case 'video_to_prompt':
        return `Anda adalah AI Master Video Analyst & Multimodal Video Prompt Architect.
Tugas Anda:
Analisis alur video atau visual yang diberikan secara runtut, pecah menjadi klip terstruktur (${config?.splitDuration || '10s'}), dan hasilkan prompt visual sinematik presisi tinggi (Style, Environment, Camera, Lighting, Actions, Dialogue, Text Overlay, Negative Prompt).

Format WAJIB JSON persis seperti berikut:
{
  "title": string,
  "splitDuration": string,
  "modelUsed": string,
  "segments": [
    {
      "segmentIndex": number,
      "timestamp": string,
      "actionDialogue": string,
      "promptAiVideo": string
    }
  ]
}${customKnowledge}`;

      case 'prompt_foto':
        return `Anda adalah Master Commercial Photographer & Optical Prompt Engineer untuk Midjourney v6.1, Flux.1, dan SDXL.
Hasilkan prompt foto komersial dengan formula optik kamera nyata (sensor, focal length, aperture f-stop, ISO, shutter speed, lighting 3-point softbox, rim light, aspect ratio).

Format WAJIB JSON persis seperti berikut:
{
  "masterPrompt": string,
  "negativePrompt": string,
  "stylePreset": string,
  "aspectRatio": string,
  "relevanceAnalysis": string,
  "cameraGear": string,
  "lightingSetup": string
}${customKnowledge}`;

      default:
        return `Anda adalah asisten AI Creator & Marketing Intelligence. Berikan output yang terstruktur, padat, dan berkualitas tinggi.${customKnowledge}`;
    }
  }

  /**
   * Formats user prompt with full parameter configuration
   */
  private static buildUserPrompt(taskType: string, rawPrompt: string, config: any): string {
    let enrichmentBlock = '';
    if (taskType === 'tiktok_shop' && config?.productEnrichment) {
      const e = config.productEnrichment;
      enrichmentBlock = `\n\n[DATA HASIL ENRICHMENT PRODUK REALTIME]
- Platform: ${e.platform || 'E-Commerce Marketplace'}
- Final URL: ${e.finalUrl || config?.productUrl || 'N/A'}
${e.pageTitle ? `- Judul / Nama Produk: ${e.pageTitle}` : ''}
${e.metaDescription ? `- Deskripsi / Metadata: ${e.metaDescription}` : ''}
${e.priceEstimate ? `- Estimasi Harga: ${e.priceEstimate}` : ''}
${e.tiktokSummary ? `- Data Konteks TikTok: ${e.tiktokSummary}` : ''}`;
    }

    if (taskType === 'ide_konten') {
      if (config?.groundingContext) {
        enrichmentBlock += `\n\n[TAHAP 1: HASIL VISION & FACTUAL GROUNDING]\n${config.groundingContext}`;
      }
      if (config?.identityAnchorDescription) {
        enrichmentBlock += `\n\n[TAHAP 1.5: IDENTITY ANCHOR VISUAL PROFILE (Wajib digunakan konsisten pada deskripsi subjek/produk di prompt video)]\n${config.identityAnchorDescription}`;
      }
    }

    const totalIdeas = config?.numIdeas || config?.ideaCount || config?.ideasCount;

    return `Input Pengguna:
${rawPrompt}${enrichmentBlock}

Konfigurasi Eksekusi:
- Task: ${taskType}
${config?.productUrl ? `- URL Produk: ${config.productUrl}\n` : ''}${totalIdeas ? `- Target Jumlah Ide: ${totalIdeas} Ide\n` : ''}- Durasi Total: ${config?.totalDuration || '30 Detik'}
- Durasi Split Klip: ${config?.splitDuration || 'Tiap 10 Detik'}
- Target AEO: ${config?.targetAeo || 'Keduanya (Short & Long Tail)'}
- Mode Analisis: ${config?.analysisMode || 'Deep Reasoning & Search Grounded'}
- Background Sound Tag: ${config?.includeBackgroundSound ? 'Wajib Disertakan' : 'Tidak Perlu'}
- Text Overlay Tag: ${config?.includeTextOverlay ? 'Wajib Disertakan' : 'Tidak Perlu'}
- Preset Gaya Visual: ${config?.presetStyle || 'Commercial E-Commerce (Bersih & Profesional)'}
- Rasio Aspek: ${config?.aspectRatio || '9:16'}

Instruksi: Berikan respon HANYA dalam JSON format valid yang sesuai spesifikasi.`;
  }

  /**
   * Safely parses JSON string or converts raw text into structured tool schema with multi-stage recovery
   */
  private static parseJsonOrCleanText(
    text: string,
    taskType: string,
    rawPrompt: string,
    config: any
  ): any {
    if (!text || typeof text !== 'string') {
      return this.generateSmartFallback(taskType, rawPrompt, config);
    }

    try {
      // 1. Remove markdown code blocks if any
      let clean = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      // 2. Extract substring between first JSON open bracket and last JSON close bracket
      const firstBrace = clean.indexOf('{');
      const firstBracket = clean.indexOf('[');
      let startIndex = -1;
      let isArray = false;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIndex = firstBrace;
        isArray = false;
      } else if (firstBracket !== -1) {
        startIndex = firstBracket;
        isArray = true;
      }

      if (startIndex !== -1) {
        const lastIndex = isArray ? clean.lastIndexOf(']') : clean.lastIndexOf('}');
        if (lastIndex > startIndex) {
          clean = clean.substring(startIndex, lastIndex + 1);
        }
      }

      // 3. Clean single line comments // ... that AI sometimes includes
      clean = clean.replace(/^[ \t]*\/\/.*$/gm, '');

      // 4. Clean trailing commas before closing braces/brackets: ,} -> } or ,] -> ]
      clean = clean.replace(/,\s*([\}\]])/g, '$1');

      const parsed = JSON.parse(clean);

      // Validate schema according to task type
      if (taskType === 'tiktok_shop') {
        const totalIdeas = Math.min(Math.max(Number(config?.numIdeas || config?.ideaCount || 3), 1), 5);
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !parsed.fivePillars ||
          !Array.isArray(parsed.ideas) ||
          parsed.ideas.length !== totalIdeas
        ) {
          console.warn(
            `[GeminiBackendService] TikTok Shop schema validation mismatch (expected ${totalIdeas} ideas, got ${parsed?.ideas?.length}), falling back to resilient generator.`
          );
          return this.generateSmartFallback(taskType, rawPrompt, config);
        }
      }

      if (taskType === 'ide_konten' && !Array.isArray(parsed)) {
        // If wrapped in an object like { ideas: [...] }
        if (parsed && Array.isArray(parsed.ideas)) return parsed.ideas;
        return this.generateSmartFallback(taskType, rawPrompt, config);
      }

      return parsed;
    } catch (parseErr) {
      console.warn('[GeminiBackendService] JSON repair failed, falling back to heuristic engine:', parseErr);
      return this.generateSmartFallback(taskType, rawPrompt, config);
    }
  }

  /**
   * Resilient smart fallback engine with high-quality contextual outputs
   */
  public static generateSmartFallback(type: string, inputPrompt: string, config: any): any {
    const sanitized = inputPrompt.replace(/Judul:|Produk:|URL:|Caption:|Manual Queries:/g, '').trim() || 'Produk Kreator Viral';
    const cleanTitle = sanitized.split('\n')[0].substring(0, 60);
    const splitDur = config?.splitDuration || '10s';

    if (type === 'tiktok_shop') {
      const totalIdeas = Math.min(Math.max(Number(config?.numIdeas || config?.ideaCount || 3), 1), 5);
      const enrichment = config?.productEnrichment;
      const detectedTitle = enrichment?.pageTitle || cleanTitle;
      const detectedPrice = enrichment?.priceEstimate || 'Rp 49.000 - Rp 189.000 (Sangat Kompetitif)';

      const angleTemplates = [
        {
          angle: 'Honest UGC Review + Problem-Solution Demo',
          hookTitle: `Review Jujur & Solusi Praktis`,
          hookVo: `"Stop buang-buang uang kalau produk satu ini hasilnya jauh lebih juara!"`,
          hookVisual: `Visual Motion zoom-in cepat menampakkan ${detectedTitle} dipegang tangan.\nText On Screen: "JANGAN BELI INI SEBELUM LIAT HASILNYA!"\nVoice Over: "Stop buang-buang uang kalau produk satu ini hasilnya jauh lebih juara!"`,
          cta: `"Mumpung lagi ada promo diskon dan gratis ongkir, langsung amankan di keranjang kuning ya!"`
        },
        {
          angle: 'Unboxing & Aesthetic Texture / Quality Zoom-in',
          hookTitle: `Unboxing Estetik & Review Kualitas Asli`,
          hookVo: `"Paket yang paling ditunggu-tunggu akhirnya sampai juga, dan jujur kaget banget sama kualitasnya!"`,
          hookVisual: `Kreator membuka paket estetik dengan suara crisp ASMR unboxing.\nText On Screen: "UNBOXING VIRAL ✨"\nVoice Over: "Paket yang paling ditunggu-tunggu akhirnya sampai juga, dan jujur kaget banget sama kualitasnya!"`,
          cta: `"Stoknya terbatas banget, buruan checkout di keranjang kuning sebelum kehabisan!"`
        },
        {
          angle: 'Battle / Komparasi Produk & Solusi Hemat',
          hookTitle: `Battle Komparasi: Kenapa Ini Lebih Worth It`,
          hookVo: `"Daripada beli yang mahal tapi zonk, mending cobain yang satu ini deh!"`,
          hookVisual: `Split screen perbandingan produk biasa vs ${detectedTitle}.\nText On Screen: "LEBIH HEMAT & WORTH IT 🔥"\nVoice Over: "Daripada beli yang mahal tapi zonk, mending cobain yang satu ini deh!"`,
          cta: `"Cek keranjang kuning sekarang mumpung voucher diskon masih aktif!"`
        },
        {
          angle: 'POV Storytelling Emosional & Relatable Experience',
          hookTitle: `POV: Nemu Solusi Setelah Berbulan-bulan Ragu`,
          hookVo: `"POV: Nyesel baru tahu produk ini sekarang padahal udah viral dari kemarin!"`,
          hookVisual: `Kreator menunjukkan reaksi ekspresif memegang produk dengan latar rapi.\nText On Screen: "POV: NYESEL BARU TAHU SEKARANG 😱"\nVoice Over: "POV: Nyesel baru tahu produk ini sekarang padahal udah viral dari kemarin!"`,
          cta: `"Yuk jangan sampai nyesel, klik keranjang kuning di kiri bawah!"`
        },
        {
          angle: 'Flash Sale Urgency & Keranjang Kuning Hack',
          hookTitle: `Spill Promo Flash Sale Keranjang Kuning`,
          hookVo: `"Gak sengaja nemu promo rahasia di keranjang kuning buat ${detectedTitle}!"`,
          hookVisual: `Tangan menunjuk keranjang kuning dengan stiker diskon flash sale.\nText On Screen: "PROMO RAHASIA AKTIF! ⚡"\nVoice Over: "Gak sengaja nemu promo rahasia di keranjang kuning buat produk ini!"`,
          cta: `"Langsung klik keranjang kuning sekarang sebelum harga kembali normal!"`
        }
      ];

      const generatedIdeas = Array.from({ length: totalIdeas }).map((_, idx) => {
        const tpl = angleTemplates[idx % angleTemplates.length];
        return {
          id: `idea_${idx + 1}`,
          title: `Ide ${idx + 1}: ${tpl.hookTitle} (${detectedTitle})`,
          querySeo: `${detectedTitle.toLowerCase()} viral tiktok shop`,
          angle: tpl.angle,
          targetAudience: `Audiens TikTok yang mencari rekomendasi produk terpercaya dan promo terbaik.`,
          hook3s: tpl.hookVisual,
          segments: [
            {
              segmentIndex: 1,
              timestamp: `00:00 - 00:${splitDur.includes('5') ? '05' : '10'} (Klip 1: Hook)`,
              actionDialogue: `Kreator memegang ${detectedTitle} ke arah kamera dengan ekspresi penasaran dan antusias.`,
              promptAiVideo: `[Style]: Bright, commercial e-commerce product video, clean aesthetic.\n[Environment]: Modern aesthetic indoor room setup with soft daylight.\n[Camera]: Medium close-up shot, fast zoom in 1.2x at start framing ${detectedTitle}.\n[Lighting]: Soft studio lighting with clear highlights on product.\n[Actions]: Creator presents ${detectedTitle} to the lens with confidence.\n[Dialogue]: ${tpl.hookVo}\n[Text Overlay]: "JANGAN SALAH PILIH! 🔥"\n[Background Sound]: Upbeat trending lofi pop music.\n[Negative Prompt]: flickering, flicker, strobing, morphing face, glitch`
            },
            {
              segmentIndex: 2,
              timestamp: `00:10 - 00:20 (Klip 2: Demo & USP)`,
              actionDialogue: `Demonstrasi detail pemakaian produk secara nyata memperlihatkan kualitas dan keunggulannya.`,
              promptAiVideo: `[Style]: High-end commercial product demonstration.\n[Environment]: Aesthetic studio vanity setup.\n[Camera]: Macro close-up shot focusing on detail.\n[Lighting]: Diffused softbox studio illumination.\n[Actions]: Hands demonstrating practical application of ${detectedTitle}.\n[Dialogue]: "Lihat sendiri deh kualitasnya, super praktis dan nyaman dipakai!"\n[Text Overlay]: "KUALITAS TERBAIK ✨"\n[Negative Prompt]: blurry, lowres, distorted fingers`
            },
            {
              segmentIndex: 3,
              timestamp: `00:20 - 00:30 (Klip 3: CTA)`,
              actionDialogue: `Kreator tersenyum puas sambil menunjuk ke keranjang kuning di kiri bawah.`,
              promptAiVideo: `[Style]: Persuasive influencer call to action.\n[Environment]: Bright aesthetic room.\n[Camera]: Eye level portrait shot.\n[Lighting]: Warm daylight illumination.\n[Actions]: Creator gestures towards bottom left yellow cart icon.\n[Dialogue]: ${tpl.cta}\n[Text Overlay]: "KLIK KERANJANG KUNING SEKARANG! 🛒"\n[Negative Prompt]: glitch, distorted face`
            }
          ],
          caption: `Akhirnya nemu solusi yang bener-bener mantap! ${detectedTitle} ini wajib banget kalian checkout mumpung ada diskon spesial & gratis ongkir. Jangan sampai kehabisan! 👇✨`,
          hashtags: [`#TikTokShopViral`, `#RacunTikTok`, `#${detectedTitle.replace(/[^a-zA-Z0-9]/g, '') || 'TikTokShop'}`, `#PromoSpesial`, `#ReviewJujur`]
        };
      });

      return {
        fivePillars: {
          category: `E-Commerce & Lifestyle Pilihan (${detectedTitle})`,
          ingredients: enrichment?.metaDescription ? enrichment.metaDescription.substring(0, 150) : `Bahan / Material berkualitas tinggi dengan finishing rapi, tahan lama, dan aman untuk pemakaian harian.`,
          painPoints: `Konsumen sering kecewa dengan produk serupa yang mahal namun kualitas tidak sesuai ekspektasi atau cepat rusak.`,
          benefits: `Memberikan solusi praktis, estetika modern, dan nilai kepuasan penggunaan tinggi dengan harga terjangkau.`,
          targetUser: `Pria & Wanita usia 18–35 tahun yang aktif di media sosial dan mengutamakan efisiensi & gaya hidup estetik.`
        },
        grokEnrichment: {
          priceRange: detectedPrice,
          rating: `4.9 / 5.0 (Ribuan Ulasan Positif)`,
          usp: `Desain minimalis modern dengan efektivitas terbukti sejak penggunaan pertama.`,
          moodTone: `Honest Review, Clean, Relatable, Enthusiastic & Persuasive`
        },
        seoKeywords: [
          { category: 'Problem / Pain Point', query: `${detectedTitle.toLowerCase()} murah berkualitas` },
          { category: 'Problem / Pain Point', query: `solusi masalah ${detectedTitle.toLowerCase()}` },
          { category: 'Ingredients / Spesifikasi', query: `review bahan spesifikasi ${detectedTitle.toLowerCase()}` },
          { category: 'Ingredients / Spesifikasi', query: `kualitas ${detectedTitle.toLowerCase()} original` },
          { category: 'Benefit & Solution', query: `manfaat pakai ${detectedTitle.toLowerCase()}` },
          { category: 'Benefit & Solution', query: `rekomendasi ${detectedTitle.toLowerCase()} viral` },
          { category: 'Target User Specific', query: `rekomendasi ${detectedTitle.toLowerCase()} anak muda` },
          { category: 'Comparison & Recommendation', query: `perbandingan ${detectedTitle.toLowerCase()} terbaik` }
        ],
        ideas: generatedIdeas
      };
    }

    if (type === 'ide_konten') {
      const ideaCount = Math.min(Math.max(Number(config?.ideaCount || config?.ideasCount || 5), 1), 5);
      const angles = [
        {
          name: 'Problem-Solution & Battle Review',
          hook: `"Banyak yang belum tahu kalau rahasia satu ini bisa ubah segalanya dalam hitungan detik! Tonton sampai habis!"`,
          query: 'fyp, cara pakai, solusi cepat'
        },
        {
          name: 'Storytelling Emosional & POV Viral',
          hook: `"POV: Kamu nemu trik ini setelah berbulan-bulan struggle dan hasilnya beneran se-mindblowing itu!"`,
          query: 'rekomendasi viral, cerita pengalaman, review jujur'
        },
        {
          name: 'Bongkar Mitos vs Fakta AEO',
          hook: `"Stop percaya mitos yang bilang ini ribet! Faktanya cuma butuh 1 menit dan hasilnya langsung terasa!"`,
          query: 'fakta mitos, kelebihan kekurangan, tips hemat'
        },
        {
          name: 'Tutorial Cepat 3 Langkah Praktis',
          hook: `"3 Langkah satset yang bakal bikin kamu geleng-geleng kepala karena semudah ini! Catat sekarang!"`,
          query: 'tutorial mudah, cara kerja, panduan pemula'
        },
        {
          name: 'Transformasi Nyata Sebelum vs Sesudah',
          hook: `"Lihat perbandingan sebelum vs sesudah pakai metode ini! Beda banget kan? Ini rahasianya!"`,
          query: 'hasil sebelum sesudah, perbandingan nyata, pembuktian'
        }
      ];

      return Array.from({ length: ideaCount }).map((_, idx) => {
        const item = angles[idx % angles.length];
        return {
          id: `idea_${idx + 1}`,
          title: `Ide ${idx + 1}: ${item.name} (${cleanTitle})`,
          typeAngle: item.name,
          targetAudience: `Kreator konten & pengguna media sosial yang mencari solusi praktis dan terbukti viral.`,
          aeoQueryMapping: {
            shortQuery: `${cleanTitle.toLowerCase()} ${item.query.split(',')[0]}`,
            longQuery: `rekomendasi terbaik ${cleanTitle.toLowerCase()} paling dicari 2026`
          },
          relevanceReason: `Topik ${cleanTitle} dengan angle ${item.name} memiliki retensi tinggi pada algoritma TikTok & Google Search.`,
          atomicSummary: `${cleanTitle} menawarkan efisiensi tinggi dengan formula penyampaian ${item.name}.`,
          consensusTrigger: `Mayoritas kreator dan ulasan memvalidasi bahwa teknik ini memberikan hasil nyata.`,
          hook3s: item.hook,
          visualAudioGuide: `Pencahayaan studio terang, jump cut dinamis, background music upbeat pop clean.`,
          segments: [
            {
              segmentIndex: 1,
              timestamp: `00:00 - 00:10 (Klip 1: Hook)`,
              actionDialogue: `Kreator menunjukkan objek utama dengan ekspresi terkejut di depan kamera.`,
              promptAiVideo: `[Style]: High engagement social media short video, clean aesthetic.\n[Environment]: Aesthetic studio room with soft lighting.\n[Camera]: Fast push-in zoom to eye level.\n[Lighting]: Studio ring light illumination.\n[Actions]: Expressive gesture demonstrating immediate excitement.\n[Dialogue]: ${item.hook}\n[Text Overlay]: "RAHASIA CEPAT! 🚀"\n[Background Sound]: Upbeat trending background music.\n[Negative Prompt]: flickering, morphing face, low quality`
            },
            {
              segmentIndex: 2,
              timestamp: `00:10 - 00:20 (Klip 2: Step-by-Step)`,
              actionDialogue: `Menjelaskan langkah demi langkah dengan visual close-up yang jelas.`,
              promptAiVideo: `[Style]: Clear educational tutorial format.\n[Environment]: Clean tabletop setup.\n[Camera]: Over-the-shoulder macro angle.\n[Lighting]: Bright natural daylight.\n[Actions]: Hands showing step by step method smoothly.\n[Dialogue]: "Cukup ikuti langkah ini, dan perubahannya langsung kelihatan jelas."\n[Text Overlay]: "LANGKAH PRAKTIS ✨"\n[Negative Prompt]: blurry, extra limbs`
            },
            {
              segmentIndex: 3,
              timestamp: `00:20 - 00:30 (Klip 3: Kesimpulan & CTA)`,
              actionDialogue: `Memberikan kesimpulan dan mengajak audiens berkomentar.`,
              promptAiVideo: `[Style]: Warm conversational influencer sign-off.\n[Environment]: Cozy bright studio space.\n[Camera]: Relaxed eye level medium shot.\n[Lighting]: Warm golden hour tone.\n[Actions]: Creator smiling, pointing to comment section.\n[Dialogue]: "Gimana menurut kalian? Tulis pendapat kalian di kolom komentar ya!"\n[Text Overlay]: "KOMEN DI BAWAH YA! 👇"\n[Negative Prompt]: flickering, distorted`
            }
          ],
          caption: `Trik simpel yang bikin semua orang kaget sama hasilnya! Cobain sekarang dan jangan lupa save biar gak hilang 🔥 #idekonten #fypviral #${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}`,
          hashtags: [`#IdeKontenViral`, `#TipsTikTok`, `#FYPIndonesia`, `#Trending2026`]
        };
      });
    }

    if (type === 'video_to_prompt') {
      return {
        title: `Analisis Alur Video: ${cleanTitle}`,
        splitDuration: splitDur,
        modelUsed: config?.model || GEMINI_MODELS.PRO,
        segments: [
          {
            segmentIndex: 1,
            timestamp: `00:00 - 00:${splitDur.includes('5') ? '05' : '10'} (Klip 1: Opening Hook)`,
            actionDialogue: `Subjek memulai video dengan gerakan dinamis memperkenalkan fokus utama.`,
            promptAiVideo: `[Style]: Commercial 8K ultra-realistic video clip, photorealistic cinematic grade.\n[Environment]: Modern minimalist room with diffused natural light.\n[Camera]: Dynamic slow push-in medium close-up shot.\n[Lighting]: Studio 3-point softbox with subtle rim light.\n[Actions]: Subject presents ${cleanTitle} with confident eye contact.\n[Dialogue]: "Nih liat deh hasilnya, beneran bikin kaget dalam hitungan hari!"\n[Text Overlay]: "HASIL NYATA! 🔥"\n[Negative Prompt]: flickering, strobing, morphing face, artifacts, blur`
          },
          {
            segmentIndex: 2,
            timestamp: `00:10 - 00:20 (Klip 2: Core Demonstration)`,
            actionDialogue: `Pengambilan gambar jarak dekat (macro) memperlihatkan aksi detail dari subjek/produk.`,
            promptAiVideo: `[Style]: Crisp commercial macro demonstration, 4K resolution.\n[Environment]: Pristine surface setup with minimalist aesthetic.\n[Camera]: Overhead 90-degree flat lay panning shot.\n[Lighting]: Clean natural daylight simulation.\n[Actions]: Smooth demonstration of core feature and texture.\n[Dialogue]: "Lihat detailnya, halus dan presisi banget."\n[Text Overlay]: "DETAIL MAKSIMAL ✨"\n[Negative Prompt]: morphing fingers, extra limbs, jittery motion`
          },
          {
            segmentIndex: 3,
            timestamp: `00:20 - 00:30 (Klip 3: Climax & CTA)`,
            actionDialogue: `Penutup video dengan pesan kesimpulan yang meyakinkan dan ajakan bertindak.`,
            promptAiVideo: `[Style]: High-energy resolution and influencer wrap-up.\n[Environment]: Bright studio background.\n[Camera]: Eye level portrait shot with gentle camera breathing.\n[Lighting]: Warm frontal daylight.\n[Actions]: Presenter smiles warmly with satisfying conclusion.\n[Dialogue]: "Jangan sampai kelewatan kesempatan ini ya!"\n[Text Overlay]: "CEK SEKARANG! 🛒"\n[Negative Prompt]: flickering, text errors`
          }
        ]
      };
    }

    if (type === 'prompt_foto') {
      const ratio = config?.aspectRatio || '9:16';
      const preset = config?.presetStyle || 'Commercial E-Commerce (Bersih & Profesional)';
      return {
        masterPrompt: `Commercial high-end advertising photography of ${cleanTitle}, shot on Sony A7R V with Sony FE 85mm f/1.4 GM lens at f/2.0, ISO 100, 1/250s, 8k resolution, razor-sharp optical focus on textures and typography, studio 3-point softbox diffused lighting with subtle golden rim light, pristine clean aesthetic background, award-winning commercial catalog color grading, photorealistic masterpiece --ar ${ratio} --v 6.1 --style raw`,
        negativePrompt: config?.negativePrompt || `low quality, blurry, deformed, extra limbs, bad typography, plastic look, oversaturated, chromatic aberration, artifacts, dark grain, signature, watermark`,
        stylePreset: preset,
        aspectRatio: ratio,
        relevanceAnalysis: `Prompt dioptimalkan dengan formula lensa optik nyata (85mm GM), lighting studio seimbang, dan parameter anti-slop untuk retensi tinggi di TikTok FYP & Google Lens AEO.`,
        cameraGear: `Sony A7R V + 85mm f/1.4 GM Lens`,
        lightingSetup: `High-Key 3-Point Studio Softbox + Honeycomb Grid Rim Light`
      };
    }

    return { result: `Analisis AI selesai untuk ${cleanTitle}.` };
  }
}
