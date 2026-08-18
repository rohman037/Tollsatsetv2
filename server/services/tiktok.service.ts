import { TikTokScrapeResponse } from '../types/api.types';

function formatMetricNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('id-ID');
}

function ensureAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://www.tikwm.com${url}`;
  return `https://www.tikwm.com/${url}`;
}

export class TikTokBackendService {
  /**
   * Resolves short links (vt.tiktok.com, vm.tiktok.com, tiktok.com/t/) to canonical URLs
   */
  public static async expandShortUrl(url: string): Promise<string> {
    if (!url.includes('vt.tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('/t/')) {
      return url;
    }
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });
      if (res.url && res.url !== url) {
        return res.url;
      }
    } catch {
      // Return original if head request fails
    }
    return url;
  }

  /**
   * Scrapes TikTok video metadata and returns clean, watermark-free direct links with full metadata
   * Multi-provider cascade:
   * 1. TikWM API Primary Engine
   * 2. Lovetik / Ssstik Alternate Engine
   * 3. TikTok Official oEmbed (Metadata fallback)
   */
  public static async scrapeVideo(rawUrl: string): Promise<TikTokScrapeResponse> {
    if (!rawUrl || !rawUrl.trim()) {
      return {
        success: false,
        error: 'URL TikTok tidak boleh kosong.',
      };
    }

    let cleanUrl = rawUrl.trim();
    cleanUrl = await this.expandShortUrl(cleanUrl);

    // Extract handle and id from URL pattern if present
    const urlMatch = cleanUrl.match(/@([a-zA-Z0-9_.-]+)/);
    const extractedHandle = urlMatch ? `@${urlMatch[1]}` : '@tiktok.creator';
    const extractedAuthorName = urlMatch
      ? urlMatch[1]
          .split(/[_.-]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Kreator TikTok';

    // 1. Try Primary Engine: TikWM API with timeout protection
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&count=12&cursor=0&web=1&hd=1`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json, text/plain, */*',
          },
          signal: controller.signal,
          cache: 'no-store',
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.code === 0 && json.data) {
          const d = json.data;
          const play = ensureAbsoluteUrl(d.play);
          const wmplay = ensureAbsoluteUrl(d.wmplay);
          const hdplay = ensureAbsoluteUrl(d.hdplay);
          const videoUrl = hdplay || play || wmplay;
          const videoUrlHd = hdplay || play;
          const musicUrl = ensureAbsoluteUrl(d.music || d.music_info?.play);
          const coverUrl = ensureAbsoluteUrl(d.cover || d.origin_cover);

          const authorHandle = d.author?.unique_id
            ? (d.author.unique_id.startsWith('@') ? d.author.unique_id : `@${d.author.unique_id}`)
            : extractedHandle;
          const authorName = d.author?.nickname || d.author?.unique_id || extractedAuthorName;
          const authorAvatar =
            ensureAbsoluteUrl(d.author?.avatar) ||
            `https://picsum.photos/seed/${encodeURIComponent(authorHandle)}/120/120`;

          const caption = d.title || `Konten TikTok oleh ${authorName}`;
          const likesCount = typeof d.digg_count === 'number' ? d.digg_count : 0;
          const commentsCount = typeof d.comment_count === 'number' ? d.comment_count : 0;
          const sharesCount = typeof d.share_count === 'number' ? d.share_count : 0;
          const bookmarksCount =
            typeof d.collect_count === 'number'
              ? d.collect_count
              : typeof d.download_count === 'number'
              ? d.download_count
              : 0;
          const playsCount = typeof d.play_count === 'number' ? d.play_count : 0;

          const audioTitle = d.music_info?.title || d.music_title || `Sound Original - ${authorName}`;
          const audioAuthor = d.music_info?.author || d.music_author || authorName;

          return {
            success: true,
            data: {
              id: d.id ? String(d.id) : `tt_${Date.now()}`,
              url: cleanUrl,
              title: caption,
              caption: caption,
              author: authorHandle,
              authorName: authorName,
              authorNickname: authorName,
              authorHandle: authorHandle,
              avatarUrl: authorAvatar,
              authorAvatar: authorAvatar,
              duration: d.duration || 30,
              videoDuration: d.duration || 30,
              videoUrl: videoUrl,
              videoUrlHd: videoUrlHd,
              videoUrlWatermarked: wmplay,
              play: play,
              wmplay: wmplay,
              hdplay: hdplay,
              coverUrl: coverUrl,
              musicUrl: musicUrl,
              audioUrl: musicUrl,
              audioTitle: audioTitle,
              audioAuthor: audioAuthor,
              likes: formatMetricNumber(likesCount),
              comments: formatMetricNumber(commentsCount),
              shares: formatMetricNumber(sharesCount),
              bookmarks: formatMetricNumber(bookmarksCount),
              stats: {
                plays: playsCount,
                likes: likesCount,
                comments: commentsCount,
                shares: sharesCount,
                downloads: bookmarksCount,
              },
            },
          };
        }
      }
    } catch (e: any) {
      console.warn('[TikTokBackendService] TikWM provider warning:', e?.message);
    }

    // 2. Try Secondary Provider: TikSave API
    try {
      const tiksaveController = new AbortController();
      const tiksaveTimeout = setTimeout(() => tiksaveController.abort(), 8000);

      const tiksaveRes = await fetch(`https://api.tiksave.io/v1/video?url=${encodeURIComponent(cleanUrl)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: tiksaveController.signal,
        cache: 'no-store',
      });
      clearTimeout(tiksaveTimeout);

      if (tiksaveRes.ok) {
        const json = await tiksaveRes.json();
        if (json.videoUrl || json.data?.videoUrl || json.data?.play) {
          const d = json.data || json;
          const directVideo = d.videoUrl || d.play || d.hdplay;
          const authorName = d.authorName || d.nickname || extractedAuthorName;
          const authorHandle = d.authorHandle || extractedHandle;
          const caption = d.title || d.description || `Video TikTok ${authorName}`;

          return {
            success: true,
            data: {
              id: d.id ? String(d.id) : `tt_tiksave_${Date.now()}`,
              url: cleanUrl,
              title: caption,
              caption: caption,
              author: authorHandle,
              authorName: authorName,
              authorNickname: authorName,
              authorHandle: authorHandle,
              avatarUrl: d.avatarUrl || `https://picsum.photos/seed/${encodeURIComponent(authorHandle)}/120/120`,
              authorAvatar: d.avatarUrl || `https://picsum.photos/seed/${encodeURIComponent(authorHandle)}/120/120`,
              duration: d.duration || 30,
              videoDuration: d.duration || 30,
              videoUrl: directVideo,
              videoUrlHd: d.hdplay || directVideo,
              videoUrlWatermarked: d.wmplay || directVideo,
              coverUrl: d.coverUrl || `https://picsum.photos/seed/thumb_${Date.now()}/720/1280`,
              audioUrl: d.audioUrl || d.musicUrl || directVideo,
              audioTitle: d.audioTitle || `Sound Original - ${authorName}`,
              audioAuthor: d.audioAuthor || authorName,
              likes: formatMetricNumber(d.likes || 0),
              comments: formatMetricNumber(d.comments || 0),
              shares: formatMetricNumber(d.shares || 0),
              bookmarks: formatMetricNumber(d.bookmarks || 0),
              stats: {
                plays: d.plays || 0,
                likes: d.likes || 0,
                comments: d.comments || 0,
                shares: d.shares || 0,
                downloads: d.bookmarks || 0,
              },
            },
          };
        }
      }
    } catch (e: any) {
      console.warn('[TikTokBackendService] TikSave provider warning:', e?.message);
    }

    // 3. Try TikTok Official oEmbed API as Fallback (Metadata Only)
    try {
      const oembedController = new AbortController();
      const oembedTimeout = setTimeout(() => oembedController.abort(), 6000);

      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          signal: oembedController.signal,
          cache: 'no-store',
        }
      );
      clearTimeout(oembedTimeout);

      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        if (oembed.title || oembed.author_name) {
          const authorName = oembed.author_name || extractedAuthorName;
          const authorHandle = oembed.author_unique_id
            ? `@${oembed.author_unique_id}`
            : extractedHandle;
          const caption = oembed.title || `Konten TikTok ${authorName}`;

          return {
            success: true,
            data: {
              id: `tt_oembed_${Date.now()}`,
              url: cleanUrl,
              title: caption,
              caption: caption,
              author: authorHandle,
              authorName: authorName,
              authorNickname: authorName,
              authorHandle: authorHandle,
              avatarUrl: oembed.thumbnail_url || '',
              authorAvatar: oembed.thumbnail_url || '',
              duration: 30,
              videoDuration: 30,
              videoUrl: '', // oEmbed does not provide raw stream mp4
              videoUrlHd: '',
              coverUrl: oembed.thumbnail_url || '',
              audioTitle: `Sound Original - ${authorName}`,
              audioAuthor: authorName,
              audioUrl: '',
              likes: '0',
              comments: '0',
              shares: '0',
              bookmarks: '0',
              partialMetadataOnly: true,
              stats: {
                plays: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                downloads: 0,
              },
            },
          };
        }
      }
    } catch (e: any) {
      console.warn('[TikTokBackendService] oEmbed provider warning:', e?.message);
    }

    // 4. Return transparent error if all upstream providers fail
    return {
      success: false,
      error:
        'Gagal mengambil informasi video TikTok. Pastikan URL video publik & valid, atau coba lagi beberapa saat.',
    };
  }
}
