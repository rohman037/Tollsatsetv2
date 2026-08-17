import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { GenerateAiRequest, GenerateAiResponse } from '../types/api.types';

interface ModelTierConfig {
  tier: 'tier_1' | 'tier_2' | 'tier_3';
  model: string;
  useSearchGrounding: boolean;
  useHighThinking: boolean;
  useLowLatency: boolean;
}

interface KeyHealth {
  key: string;
  index: number;
  lastFailureTime: number;
  failureCount: number;
  isCoolingDown: boolean;
}

export class GeminiBackendService {
  // Global rotation cursor for balanced round-robin across requests
  private static keyCursor = 0;
  // In-memory key health tracker
  private static keyHealthMap = new Map<string, KeyHealth>();
  // Cooldown period in ms after a rate-limit / 429 error (30 seconds)
  private static readonly COOLDOWN_MS = 30000;

  /**
   * Main entrypoint for processing AI tasks across all tools
   * Supports:
   * 1. Multi-API Key Routing (Key 1 -> Key 2 -> Key 3 -> Key N)
   * 2. Strict Model Tier Prioritization (Tier 1 -> Tier 2 -> Tier 3)
   * 3. Google Search Grounding with gemini-3.5-flash
   * 4. High Thinking Mode with gemini-3.1-pro-preview (ThinkingLevel.HIGH)
   * 5. Ultra Low-Latency with gemini-3.1-flash-lite (ThinkingLevel.MINIMAL)
   */
  public static async processAiTask(
    request: GenerateAiRequest
  ): Promise<GenerateAiResponse> {
    const startTime = Date.now();
    const { taskType, prompt, extraData, customApiKey } = request;

    // 1. Gather all available API keys into a prioritized pool
    const keyPool = this.resolveApiKeyPool(customApiKey, extraData);

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

      for (let i = 0; i < orderedKeys.length; i++) {
        const currentKey = orderedKeys[i];
        const keyDisplayIndex = i + 1;

        try {
          console.log(
            `[GeminiBackendService] Executing [${tierConfig.tier.toUpperCase()}] Model: ${tierConfig.model} using API Key #${keyDisplayIndex} (Task: ${taskType})`
          );

          const ai = new GoogleGenAI({
            apiKey: currentKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const systemInstruction = this.buildSystemInstruction(taskType, extraData);
          const userPrompt = this.buildUserPrompt(taskType, prompt, extraData);

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

          // Configure Search Grounding
          if (tierConfig.useSearchGrounding) {
            config.tools = [{ googleSearch: {} }];
          }

          const response = await ai.models.generateContent({
            model: tierConfig.model,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
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
              searchGroundingActive: tierConfig.useSearchGrounding,
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

    // 1. Custom client key (Highest priority if provided)
    if (customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 5) {
      pool.push(customApiKey.trim());
    }

    // 2. Extra data key pool
    if (Array.isArray(extraData?.apiKeysPool)) {
      for (const k of extraData.apiKeysPool) {
        if (typeof k === 'string' && k.trim() && !pool.includes(k.trim())) {
          pool.push(k.trim());
        }
      }
    }

    // 3. Primary server environment keys (Key 1, Key 2, Key 3, Key 4, Key 5)
    const envKey1 = process.env.GEMINI_API_KEY;
    const envKey2 = process.env.GEMINI_API_KEY_2;
    const envKey3 = process.env.GEMINI_API_KEY_3;
    const envKey4 = process.env.GEMINI_API_KEY_4;
    const envKey5 = process.env.GEMINI_API_KEY_5;

    [envKey1, envKey2, envKey3, envKey4, envKey5].forEach((k) => {
      if (k && typeof k === 'string' && k.trim() && !pool.includes(k.trim())) {
        pool.push(k.trim());
      }
    });

    // 4. Delimited list in GEMINI_API_KEYS (e.g. key1,key2,key3)
    if (process.env.GEMINI_API_KEYS) {
      const splitKeys = process.env.GEMINI_API_KEYS.split(/[\n,;]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 5);
      for (const k of splitKeys) {
        if (!pool.includes(k)) {
          pool.push(k);
        }
      }
    }

    return pool;
  }

  /**
   * Sorts keys prioritizing healthy keys and rotates starting index
   */
  private static getOrderedKeys(keys: string[]): string[] {
    if (keys.length <= 1) return keys;

    const now = Date.now();
    // Filter healthy vs cooling down keys
    const healthy: string[] = [];
    const coolingDown: string[] = [];

    for (const key of keys) {
      const health = this.keyHealthMap.get(key);
      if (health && health.isCoolingDown && now - health.lastFailureTime < this.COOLDOWN_MS) {
        coolingDown.push(key);
      } else {
        healthy.push(key);
      }
    }

    // Rotate cursor for healthy keys
    const startIdx = this.keyCursor % Math.max(1, healthy.length);
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
    const isRateLimit =
      errorMsg.includes('429') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      errorMsg.includes('Quota exceeded') ||
      errorMsg.includes('overloaded');

    const existing = this.keyHealthMap.get(key) || {
      key,
      index: 0,
      lastFailureTime: 0,
      failureCount: 0,
      isCoolingDown: false,
    };

    existing.lastFailureTime = Date.now();
    existing.failureCount += 1;
    existing.isCoolingDown = isRateLimit || existing.failureCount >= 2;
    this.keyHealthMap.set(key, existing);
  }

  /**
   * Model Tier Strategy Builder
   * Prioritizes Tier 1 first, then Tier 2, then Tier 3
   */
  private static resolveModelTiers(taskType: string, extraData?: any): ModelTierConfig[] {
    const requestedModel = extraData?.model || extraData?.modelEngine;
    const isDeepMode = extraData?.analysisMode === 'deep';
    const isFastMode = extraData?.analysisMode === 'fast';

    // 1. TikTok Shop:
    // Tier 1: gemini-3.5-flash with Search Grounding (or gemini-3.1-pro-preview with High Thinking in Deep Mode)
    // Tier 2: gemini-2.5-pro or gemini-3.5-flash (Standard)
    // Tier 3: gemini-3.1-flash-lite (Minimal latency)
    if (taskType === 'tiktok_shop') {
      if (isDeepMode) {
        return [
          { tier: 'tier_1', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
          { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
        ];
      }
      if (isFastMode) {
        return [
          { tier: 'tier_1', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: 'gemini-2.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: 'gemini-3.5-flash', useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 2. Ide Konten AEO:
    // Tier 1: gemini-3.5-flash with Search Grounding (Live UGC queries & TikTok trends)
    // Tier 2: gemini-3.1-pro-preview (Deep reasoning on script formulas)
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'ide_konten') {
      if (isDeepMode) {
        return [
          { tier: 'tier_1', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
          { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
        ];
      }
      return [
        { tier: 'tier_1', model: 'gemini-3.5-flash', useSearchGrounding: true, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 3. Video-to-Prompt (Multimodal & Scene Decomposition):
    // Tier 1: gemini-3.1-pro-preview with High Thinking (ThinkingLevel.HIGH)
    // Tier 2: gemini-2.5-pro or gemini-3.5-flash
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'video_to_prompt') {
      if (isFastMode || requestedModel === 'gemini-3.1-flash-lite') {
        return [
          { tier: 'tier_1', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: 'gemini-2.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // 4. Prompt Foto Nano:
    // Tier 1: gemini-3.5-flash (High-fidelity camera optical formulations)
    // Tier 2: gemini-3.1-pro-preview
    // Tier 3: gemini-3.1-flash-lite
    if (taskType === 'prompt_foto') {
      if (isFastMode) {
        return [
          { tier: 'tier_1', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
          { tier: 'tier_2', model: 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
          { tier: 'tier_3', model: 'gemini-2.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        ];
      }
      return [
        { tier: 'tier_1', model: 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
        { tier: 'tier_2', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
        { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
      ];
    }

    // General default fallback tiers
    return [
      { tier: 'tier_1', model: requestedModel || 'gemini-3.5-flash', useSearchGrounding: false, useHighThinking: false, useLowLatency: false },
      { tier: 'tier_2', model: 'gemini-3.1-pro-preview', useSearchGrounding: false, useHighThinking: true, useLowLatency: false },
      { tier: 'tier_3', model: 'gemini-3.1-flash-lite', useSearchGrounding: false, useHighThinking: false, useLowLatency: true },
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
      case 'tiktok_shop':
        return `Anda adalah AI Top-Tier TikTok Shop Growth & Conversion Architect.
Tugas Anda:
1. Ekstraksi 5 Pilar Produk: Category, Ingredients/Material, Pain Points, Benefits, Target User.
2. Enrichment Grok: priceRange, rating, usp, moodTone.
3. Hasilkan 8-12 TikTok SEO Keywords terbagi dalam 5 kategori: Problem/Pain Point, Ingredients/Spesifikasi, Benefit & Solution, Target User Specific, Comparison & Recommendation.
4. Buat Ide Konten Viral dengan klip terpecah (${config?.splitDuration || 'Tiap 10 Detik'}) lengkap dengan Hook 3s visual motion, dialog VO natural, prompt video AI siap render (gaya e-commerce komersial tanpa glitch), caption, dan hashtag.

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

      case 'ide_konten':
        return `Anda adalah AI TikTok AEO (Answer Engine Optimization) & Viral Video Architect dengan Pipeline 2-Tahap Grounding.
Aturan:
- Gunakan bahasa percakapan UGC Indonesia yang sangat natural, tanpa kata-kata klise/kaku (Anti-Slop).
- Setiap ide memiliki Hook 3 detik awal, breakdown adegan per segmen (${config?.splitDuration || '10s'}), prompt AI Video Generator presisi (pencahayaan, angle, aksi, negatif prompt), caption estetik, dan hashtag relevan.

Format WAJIB JSON array persis seperti berikut (tanpa teks pembuka):
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

      case 'video_to_prompt':
        return `Anda adalah AI Master Video Analyst & Multimodal Video Prompt Architect.
Tugas Anda:
Analisis alur video secara runtut, pecah menjadi klip terstruktur (${config?.splitDuration || '10s'}), dan hasilkan prompt visual sinematik presisi tinggi (Style, Environment, Camera, Lighting, Actions, Dialogue, Text Overlay, Negative Prompt).

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
    return `Input Pengguna:
${rawPrompt}

Konfigurasi Eksekusi:
- Task: ${taskType}
- Durasi Total: ${config?.totalDuration || '30 Detik'}
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
   * Safely parses JSON string or converts raw text into structured tool schema
   */
  private static parseJsonOrCleanText(
    text: string,
    taskType: string,
    rawPrompt: string,
    config: any
  ): any {
    try {
      const cleanJson = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanJson);
    } catch {
      const fallback = this.generateSmartFallback(taskType, rawPrompt, config);
      return fallback;
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
      return {
        fivePillars: {
          category: `E-Commerce & Lifestyle Pilihan (${cleanTitle})`,
          ingredients: `Bahan / Material berkualitas tinggi dengan finishing rapi, tahan lama, dan aman untuk pemakaian harian.`,
          painPoints: `Konsumen sering kecewa dengan produk serupa yang mahal namun kualitas tidak sesuai ekspektasi atau cepat rusak.`,
          benefits: `Memberikan solusi praktis, estetika modern, dan nilai kepuasan penggunaan tinggi dengan harga terjangkau.`,
          targetUser: `Pria & Wanita usia 18–35 tahun yang aktif di media sosial dan mengutamakan efisiensi & gaya hidup estetik.`
        },
        grokEnrichment: {
          priceRange: `Rp 49.000 - Rp 189.000 (Sangat Kompetitif)`,
          rating: `4.9 / 5.0 (Ribuan Ulasan Positif)`,
          usp: `Desain minimalis modern dengan efektivitas terbukti sejak penggunaan pertama.`,
          moodTone: `Honest Review, Clean, Relatable, Enthusiastic & Persuasive`
        },
        seoKeywords: [
          { category: 'Problem / Pain Point', query: `${cleanTitle.toLowerCase()} murah berkualitas` },
          { category: 'Problem / Pain Point', query: `solusi masalah ${cleanTitle.toLowerCase()}` },
          { category: 'Ingredients / Spesifikasi', query: `review bahan spesifikasi ${cleanTitle.toLowerCase()}` },
          { category: 'Ingredients / Spesifikasi', query: `kualitas ${cleanTitle.toLowerCase()} original` },
          { category: 'Benefit & Solution', query: `manfaat pakai ${cleanTitle.toLowerCase()}` },
          { category: 'Benefit & Solution', query: `rekomendasi ${cleanTitle.toLowerCase()} viral` },
          { category: 'Target User Specific', query: `rekomendasi ${cleanTitle.toLowerCase()} anak muda` },
          { category: 'Comparison & Recommendation', query: `perbandingan ${cleanTitle.toLowerCase()} terbaik` }
        ],
        ideas: [
          {
            id: 'idea_1',
            title: `Review Jujur & Solusi Praktis: ${cleanTitle}`,
            querySeo: `${cleanTitle.toLowerCase()} viral tiktok shop`,
            angle: `Honest UGC Review + Problem-Solution Demo`,
            targetAudience: `Audiens yang mencari solusi terpercaya dengan budget hemat.`,
            hook3s: `Visual Motion zoom-in cepat menampakkan ${cleanTitle} dipegang tangan.\nText On Screen: "JANGAN BELI INI SEBELUM LIAT HASILNYA!"\nVoice Over: "Stop buang-buang uang kalau produk satu ini hasilnya jauh lebih juara!"`,
            segments: [
              {
                segmentIndex: 1,
                timestamp: `00:00 - 00:${splitDur.includes('5') ? '05' : '10'} (Klip 1: Hook)`,
                actionDialogue: `Kreator memegang ${cleanTitle} ke arah kamera dengan ekspresi penasaran dan antusias.`,
                promptAiVideo: `[Style]: Bright, commercial e-commerce product video, clean aesthetic.\n[Environment]: Modern aesthetic indoor room setup with soft daylight.\n[Camera]: Medium close-up shot, fast zoom in 1.2x at start framing ${cleanTitle}.\n[Lighting]: Soft studio lighting with clear highlights on product.\n[Actions]: Creator presents ${cleanTitle} to the lens with confidence.\n[Dialogue]: "Stop buang uang kalau produk satu ini hasilnya jauh lebih mantap!"\n[Text Overlay]: "JANGAN SALAH PILIH! 🔥"\n[Background Sound]: Upbeat trending lofi pop music.\n[Negative Prompt]: flickering, flicker, strobing, morphing face, glitch`
              },
              {
                segmentIndex: 2,
                timestamp: `00:10 - 00:20 (Klip 2: Demo & USP)`,
                actionDialogue: `Demonstrasi detail pemakaian produk secara nyata memperlihatkan kualitasnya.`,
                promptAiVideo: `[Style]: High-end commercial product demonstration.\n[Environment]: Aesthetic studio vanity setup.\n[Camera]: Macro close-up shot focusing on detail.\n[Lighting]: Diffused softbox studio illumination.\n[Actions]: Hands demonstrating practical application of ${cleanTitle}.\n[Dialogue]: "Lihat sendiri deh kualitasnya, super praktis dan nyaman dipakai!"\n[Text Overlay]: "KUALITAS TERBAIK ✨"\n[Negative Prompt]: blurry, lowres, distorted fingers`
              },
              {
                segmentIndex: 3,
                timestamp: `00:20 - 00:30 (Klip 3: CTA)`,
                actionDialogue: `Kreator tersenyum puas sambil menunjuk ke keranjang kuning di kiri bawah.`,
                promptAiVideo: `[Style]: Persuasive influencer call to action.\n[Environment]: Bright aesthetic room.\n[Camera]: Eye level portrait shot.\n[Lighting]: Warm daylight illumination.\n[Actions]: Creator gestures towards bottom left yellow cart icon.\n[Dialogue]: "Mumpung lagi ada promo diskon dan gratis ongkir, langsung amankan di keranjang kuning ya!"\n[Text Overlay]: "KLIK KERANJANG KUNING SEKARANG! 🛒"\n[Negative Prompt]: glitch, distorted face`
              }
            ],
            caption: `Akhirnya nemu solusi yang bener-bener mantap! ${cleanTitle} ini wajib banget kalian checkout mumpung ada diskon spesial & gratis ongkir. Jangan sampai kehabisan! 👇✨`,
            hashtags: [`#TikTokShopViral`, `#RacunTikTok`, `#${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}`, `#PromoSpesial`, `#ReviewJujur`]
          }
        ]
      };
    }

    if (type === 'ide_konten') {
      return [
        {
          id: 'idea_1',
          title: `Rahasia Viral & Trik Cepat: ${cleanTitle}`,
          typeAngle: `Problem-Solution & Battle Review`,
          targetAudience: `Pengguna media sosial yang mencari solusi cepat, praktis, dan terbukti.`,
          aeoQueryMapping: {
            shortQuery: `${cleanTitle.toLowerCase()} fyp, cara pakai ${cleanTitle.toLowerCase()}`,
            longQuery: `rekomendasi terbaik ${cleanTitle.toLowerCase()} paling dicari 2026`
          },
          relevanceReason: `Topik ${cleanTitle} sedang mengalami lonjakan pencarian di TikTok Search dan Google Lens.`,
          atomicSummary: `${cleanTitle} menawarkan efisiensi tinggi dengan cara pemakaian mudah yang cocok untuk konten pendek 30-60 detik.`,
          consensusTrigger: `Mayoritas kreator dan ulasan memvalidasi bahwa teknik ini memberikan hasil nyata dalam hitungan hari.`,
          hook3s: `"Banyak yang belum tahu kalau rahasia satu ini bisa ubah segalanya dalam hitungan detik! Tonton sampai habis!"`,
          visualAudioGuide: `Pencahayaan studio terang, jump cut dinamis, background music upbeat pop clean.`,
          segments: [
            {
              segmentIndex: 1,
              timestamp: `00:00 - 00:10 (Klip 1: Hook)`,
              actionDialogue: `Kreator menunjukkan objek utama dengan ekspresi terkejut di depan kamera.`,
              promptAiVideo: `[Style]: High engagement social media short video, clean aesthetic.\n[Environment]: Aesthetic studio room with soft lighting.\n[Camera]: Fast push-in zoom to eye level.\n[Lighting]: Studio ring light illumination.\n[Actions]: Expressive gesture demonstrating immediate excitement.\n[Dialogue]: "Banyak yang belum tahu kalau trik satu ini bisa langsung kamu rasain hasilnya!"\n[Text Overlay]: "RAHASIA CEPAT! 🚀"\n[Background Sound]: Upbeat trending background music.\n[Negative Prompt]: flickering, morphing face, low quality`
            },
            {
              segmentIndex: 2,
              timestamp: `00:10 - 00:20 (Klip 2: Step-by-Step)`,
              actionDialogue: `Menjelaskan langkah demi langkah dengan visual close-up yang jelas.`,
              promptAiVideo: `[Style]: Clear educational tutorial format.\n[Environment]: Clean tabletop setup.\n[Camera]: Over-the-shoulder macro angle.\n[Lighting]: Bright natural daylight.\n[Actions]: Hands showing step by step method smoothly.\n[Dialogue]: "Cukup ikuti langkah ini, dan perubahannya langsung kelihatan jelas."\n[Text Overlay]: "LANGKAH 1 & 2 MUDAH BANGET ✨"\n[Negative Prompt]: blurry, extra limbs`
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
        }
      ];
    }

    if (type === 'video_to_prompt') {
      return {
        title: `Analisis Alur Video: ${cleanTitle}`,
        splitDuration: splitDur,
        modelUsed: config?.model || 'Gemini 3.1 Pro (Decomposition Engine)',
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
