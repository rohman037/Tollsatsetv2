import { TikTokBackendService } from './tiktok.service';

export interface ProductEnrichmentResult {
  platform: string;
  finalUrl: string;
  pageTitle?: string;
  metaDescription?: string;
  priceEstimate?: string;
  tiktokSummary?: string;
}

export class ProductEnrichmentService {
  /**
   * Detects e-commerce platform name based on URL hostname
   */
  public static detectPlatform(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com') || lower.includes('vt.tiktok.com') || lower.includes('shop.tiktok.com')) {
      return 'TikTok Shop';
    }
    if (lower.includes('tokopedia.com') || lower.includes('tokopedia.link')) {
      return 'Tokopedia';
    }
    if (lower.includes('shopee.co.id') || lower.includes('shopee.com') || lower.includes('s.shopee.co.id') || lower.includes('shp.ee')) {
      return 'Shopee';
    }
    if (lower.includes('lazada.co.id') || lower.includes('lazada.com')) {
      return 'Lazada';
    }
    if (lower.includes('blibli.com')) {
      return 'Blibli';
    }
    return 'E-Commerce Marketplace';
  }

  /**
   * Enriches raw product URL by fetching live metadata (og:title, og:description, price)
   * and integrates TikWM scraping if it's a TikTok URL.
   */
  public static async enrichProductUrl(rawUrl: string): Promise<ProductEnrichmentResult | null> {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim().startsWith('http')) {
      return null;
    }

    const cleanUrl = rawUrl.trim();
    const platform = this.detectPlatform(cleanUrl);

    let pageTitle: string | undefined;
    let metaDescription: string | undefined;
    let priceEstimate: string | undefined;
    let finalUrl = cleanUrl;
    let tiktokSummary: string | undefined;

    // 1. If it's a TikTok URL, attempt TikWM scrape for rich context
    if (platform === 'TikTok Shop' || cleanUrl.includes('tiktok.com')) {
      try {
        const ttResult = await TikTokBackendService.scrapeVideo(cleanUrl);
        if (ttResult.success && ttResult.data) {
          const d = ttResult.data;
          pageTitle = d.title || d.caption;
          metaDescription = d.caption || `Video kreator oleh ${d.authorName} (${d.authorHandle})`;
          tiktokSummary = `Kreator: ${d.authorName} (${d.authorHandle}), Judul/Caption: "${d.title || d.caption}", Plays: ${d.stats?.plays ? d.stats.plays.toLocaleString('id-ID') : d.likes}, Likes: ${d.likes}, Sound: "${d.audioTitle}"`;
        }
      } catch (ttErr) {
        console.warn('[ProductEnrichmentService] TikTok contextual fetch notice:', ttErr);
      }
    }

    // 2. Fetch live HTML to parse OpenGraph meta tags & pricing
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        finalUrl = response.url || cleanUrl;
        const html = await response.text();

        // Extract og:title or <title>
        if (!pageTitle) {
          const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i) ||
            html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:title["']/i);
          if (ogTitleMatch && ogTitleMatch[1]) {
            pageTitle = this.decodeHtmlEntities(ogTitleMatch[1].trim());
          } else {
            const titleTagMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
            if (titleTagMatch && titleTagMatch[1]) {
              pageTitle = this.decodeHtmlEntities(titleTagMatch[1].trim());
            }
          }
        }

        // Extract og:description or meta description
        if (!metaDescription) {
          const ogDescMatch = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["'](.*?)["']/i) ||
            html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:description["']/i) ||
            html.match(/<meta\s+(?:property|name)=["']description["']\s+content=["'](.*?)["']/i);
          if (ogDescMatch && ogDescMatch[1]) {
            metaDescription = this.decodeHtmlEntities(ogDescMatch[1].trim());
          }
        }

        // Extract Price (product:price:amount, og:price:amount, or regex Rp/IDR pattern)
        const priceMetaMatch = html.match(/<meta\s+(?:property|name)=["'](?:product:price:amount|og:price:amount)["']\s+content=["'](.*?)["']/i);
        if (priceMetaMatch && priceMetaMatch[1]) {
          const rawNum = parseFloat(priceMetaMatch[1]);
          if (!isNaN(rawNum) && rawNum > 0) {
            priceEstimate = `Rp ${rawNum.toLocaleString('id-ID')}`;
          } else {
            priceEstimate = priceMetaMatch[1].trim();
          }
        } else {
          const rupiahMatch = html.match(/(?:Rp\.?|IDR)\s*([\d.,]{3,12})/i);
          if (rupiahMatch && rupiahMatch[0]) {
            priceEstimate = rupiahMatch[0].trim();
          }
        }
      }
    } catch (fetchErr: any) {
      console.warn(`[ProductEnrichmentService] Direct fetch warning for ${cleanUrl}:`, fetchErr?.message || fetchErr);
    }

    // If we gathered any meaningful contextual data or at least identified the platform
    if (pageTitle || metaDescription || priceEstimate || tiktokSummary) {
      return {
        platform,
        finalUrl,
        pageTitle,
        metaDescription,
        priceEstimate,
        tiktokSummary,
      };
    }

    // Return platform & URL at minimum if reachable
    return {
      platform,
      finalUrl,
    };
  }

  private static decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
}
