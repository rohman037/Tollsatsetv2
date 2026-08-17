import {
  GenerateAiRequest,
  GenerateAiResponse,
  TikTokScrapeRequest,
  TikTokScrapeResponse,
} from '@/server/types/api.types';

export class ApiClient {
  /**
   * Request AI generation from backend Gemini service
   */
  public static async generateAi<T = any>(
    payload: GenerateAiRequest
  ): Promise<GenerateAiResponse<T>> {
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[ApiClient.generateAi] Error:', error);
      return {
        success: false,
        source: 'smart_fallback',
        modelUsed: 'client-offline-fallback',
        executionTimeMs: 0,
        error: error?.message || 'Gagal terhubung ke API AI Server.',
      };
    }
  }

  /**
   * Scrape and extract TikTok video metadata & direct streams
   */
  public static async scrapeTikTok(
    payload: TikTokScrapeRequest
  ): Promise<TikTokScrapeResponse> {
    try {
      const response = await fetch('/api/tiktok/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[ApiClient.scrapeTikTok] Error:', error);
      return {
        success: false,
        error: error?.message || 'Gagal mengekstrak data TikTok.',
      };
    }
  }
}
