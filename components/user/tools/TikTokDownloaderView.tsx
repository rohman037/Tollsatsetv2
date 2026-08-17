'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { TikTokVideoMetadata } from '@/types';
import {
  Download,
  Film,
  Scissors,
  Music,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Sparkles,
  Clipboard,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Play
} from 'lucide-react';

export const TikTokDownloaderView: React.FC = () => {
  const { sendToTool, addHistoryItem } = useApp();

  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<TikTokVideoMetadata | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<TikTokVideoMetadata[]>([]);

  const sampleUrls = [
    {
      label: 'Sample: Review Skincare Viral',
      url: 'https://www.tiktok.com/@yolaniimmm/video/7571316060197014791'
    },
    {
      label: 'Sample: Tas Fashion E-commerce',
      url: 'https://www.tiktok.com/@mossdoom_id/video/739182390192839182'
    }
  ];

  const handleFetchVideo = async (e?: React.FormEvent, directUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = directUrl || inputUrl;
    if (!targetUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tiktok/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (data.data) {
        setVideoData(data.data);
        setRecentDownloads((prev) => [data.data, ...prev.filter((d) => d.id !== data.data.id)]);

        addHistoryItem({
          toolType: 'tiktok_downloader',
          title: `TikTok: ${data.data.authorHandle || data.data.authorName}`,
          previewText: (data.data.caption || data.data.title || '').substring(0, 100),
          fullData: data.data,
          tags: ['TikTok', 'Downloader', 'HD']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputUrl(text);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToVideoPrompt = () => {
    if (!videoData) return;
    sendToTool('video_to_prompt', {
      videoUrl: videoData.videoUrl,
      videoTitle: videoData.title,
      videoCaption: videoData.caption,
      videoDuration: videoData.videoDuration
    });
  };

  const handleSendToFrameExtractor = () => {
    if (!videoData) return;
    sendToTool('ekstraktor_frame', {
      videoUrl: videoData.videoUrl,
      videoTitle: videoData.title,
      videoCaption: videoData.caption,
      videoDuration: videoData.videoDuration
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Input Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
        <form onSubmit={handleFetchVideo} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Tempel tautan video TikTok di sini (contoh: https://v.douyin.com/... atau https://tiktok.com/...)"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition pr-20"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
            >
              <Clipboard className="h-3 w-3" />
              <span>Tempel</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Mengambil Data...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Cari Video</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
          <span>⚡ Bebas Watermark • Kualitas HD • Ekstrak Musik MP3</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-semibold">Coba cepat:</span>
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(s.url);
                  handleFetchVideo(undefined, s.url);
                }}
                className="rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition cursor-pointer border border-slate-200"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Empty State when no video searched */}
      {!videoData && !loading && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Download className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">Belum Ada Video yang Dimuat</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tempel tautan video TikTok atau Douyin pada kolom di atas untuk mengunduh video jernih tanpa watermark, mengekstrak audio MP3, atau menganalisis naskah prompt AI.
            </p>
          </div>
        </div>
      )}

      {/* Video Result Card */}
      {videoData && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Video Player Box */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md relative group aspect-[9/16] max-h-[460px] flex items-center justify-center">
              <video
                src={videoData.videoUrl}
                poster={videoData.coverUrl}
                controls
                className="w-full h-full object-cover"
                playsInline
              />
            </div>

            {/* Right: Creator Info & Stats */}
            <div className="md:col-span-7 space-y-5">
              {/* Creator Profile */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={videoData.avatarUrl}
                    alt={videoData.authorName}
                    className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span>{videoData.authorName}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full">
                        Kreator
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {videoData.authorHandle}
                    </div>
                  </div>
                </div>

                <a
                  href={videoData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition"
                  title="Buka di TikTok"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DESKRIPSI / CAPTION
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {videoData.caption}
                </p>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center">
                <div className="space-y-0.5">
                  <Heart className="h-4 w-4 text-red-500 mx-auto" />
                  <div className="text-xs font-black text-slate-900">{videoData.likes}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Suka</div>
                </div>
                <div className="space-y-0.5">
                  <MessageSquare className="h-4 w-4 text-blue-500 mx-auto" />
                  <div className="text-xs font-black text-slate-900">{videoData.comments}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Komen</div>
                </div>
                <div className="space-y-0.5">
                  <Share2 className="h-4 w-4 text-emerald-500 mx-auto" />
                  <div className="text-xs font-black text-slate-900">{videoData.shares}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Bagikan</div>
                </div>
                <div className="space-y-0.5">
                  <Bookmark className="h-4 w-4 text-amber-500 mx-auto" />
                  <div className="text-xs font-black text-slate-900">{videoData.bookmarks}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Simpan</div>
                </div>
              </div>

              {/* Instant Next-Action Routing Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Next AI Action: Kirim langsung ke Generator Prompt & Ekstraktor Frame</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleSendToVideoPrompt}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-3 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                  >
                    <Film className="h-4 w-4" />
                    <span>Analisis Video Ini dengan AI Prompt Generator</span>
                  </button>

                  <button
                    onClick={handleSendToFrameExtractor}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 p-3 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                  >
                    <Scissors className="h-4 w-4 text-indigo-400" />
                    <span>Ekstrak Frame Video Ini (Manual & Otomatis)</span>
                  </button>
                </div>
              </div>

              {/* Direct Download Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PILIHAN UNDUHAN BERKAS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={videoData.videoUrl}
                    download="tiktok_satset_hd.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 py-2.5 px-3 text-xs font-bold text-emerald-800 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Tanpa Watermark (HD)</span>
                  </a>

                  <a
                    href={videoData.audioUrl}
                    download="audio_tiktok_satset.mp3"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 py-2.5 px-3 text-xs font-bold text-slate-700 transition"
                  >
                    <Music className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Unduh Audio MP3 ({videoData.audioTitle})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Unduhan Terakhir */}
      {recentDownloads.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Riwayat Unduhan Terakhir
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentDownloads.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setVideoData(item)}
                className="group flex gap-3 p-2.5 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 transition cursor-pointer"
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-14 h-18 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="space-y-1 overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {item.caption}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-bold">
                    {item.authorHandle} • {item.likes} likes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
