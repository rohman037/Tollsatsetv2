import {
  GenerateAiRequest,
  GenerateAiResponse,
  MediaFilePayload,
  TikTokScrapeRequest,
  TikTokScrapeResponse,
} from '@/server/types/api.types';

export class ApiClient {
  /**
   * Helper to convert File / Blob to Base64 payload for multimodal requests
   */
  public static async fileToBase64(
    file: File | Blob,
    fileName?: string,
    role?: string
  ): Promise<MediaFilePayload> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Keep mimeType clean
        const mimeType = file.type || 'application/octet-stream';
        const rawBase64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          name: fileName || (file instanceof File ? file.name : 'media_file'),
          mimeType,
          data: result,
          base64Data: rawBase64,
          role,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

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
   * Request AI generation with media files (images, video snapshots, frames)
   */
  public static async generateAiWithMedia<T = any>(
    taskType: GenerateAiRequest['taskType'],
    prompt: string,
    mediaFiles: (MediaFilePayload | File | Blob)[],
    extraData?: GenerateAiRequest['extraData'],
    customApiKey?: string
  ): Promise<GenerateAiResponse<T>> {
    const convertedMedia: MediaFilePayload[] = [];

    for (const item of mediaFiles) {
      if (item instanceof Blob || item instanceof File) {
        const converted = await this.fileToBase64(item);
        convertedMedia.push(converted);
      } else if (item && typeof item === 'object' && (item.data || item.base64Data)) {
        convertedMedia.push(item);
      }
    }

    return this.generateAi<T>({
      taskType,
      prompt,
      mediaFiles: convertedMedia,
      extraData,
      customApiKey,
    });
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
