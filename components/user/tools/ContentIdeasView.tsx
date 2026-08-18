'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import { ApiClient } from '@/services/client/api-client';
import { GEMINI_MODELS } from '@/server/config/model-tiers.config';
import {
  Sparkles,
  Search,
  Copy,
  LayoutGrid,
  Download,
  Camera,
  Upload,
  Clock,
  Scissors,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Loader2
} from 'lucide-react';

export const ContentIdeasView: React.FC = () => {
  const { addHistoryItem, sendToTool, userApiKey } = useApp();

  const [ideaCount, setIdeaCount] = useState<number>(5);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [videoTitleCaption, setVideoTitleCaption] = useState('');
  const [topicName, setTopicName] = useState('');
  const [totalDuration, setTotalDuration] = useState('60 Detik / 1 Menit (Rekomendasi Utama)');
  const [splitDuration, setSplitDuration] = useState('Tiap 5 Detik per Klip');
  const [targetAeo, setTargetAeo] = useState('Keduanya (Short & Long Tail)');
  
  // Prompt Anti-Slop toggles
  const [includeBackgroundSound, setIncludeBackgroundSound] = useState(true);
  const [includeTextOverlay, setIncludeTextOverlay] = useState(true);

  // Upload files state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Manual Queries
  const [manualQueries, setManualQueries] = useState('');
  const [fetchingTiktok, setFetchingTiktok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Count lines in manual queries
  const queryCount = manualQueries
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean).length;

  // Handle Fetch TikTok Video Info
  const handleFetchTikTok = async () => {
    if (!tiktokUrl.trim()) return;
    setFetchingTiktok(true);
    try {
      const data = await ApiClient.scrapeTikTok({ url: tiktokUrl.trim() });
      if (data && data.success && data.data) {
        setVideoTitleCaption(data.data.caption || data.data.title || '');
        if (!topicName) {
          setTopicName(data.data.title || data.data.authorName || '');
        }
      }
    } catch (err) {
      console.error('Error fetching tiktok info:', err);
    } finally {
      setFetchingTiktok(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [ideasResult, setIdeasResult] = useState<any[]>([]);

  const handleGenerateIdeas = async () => {
    setLoading(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 600);

    try {
      const promptQuery = topicName.trim() || videoTitleCaption.trim() || tiktokUrl.trim() || manualQueries.trim() || 'Ide Konten Kreator Viral';

      const mediaFiles: any[] = [];
      if (videoFile) {
        const { mimeType, base64Data, data } = await ApiClient.fileToBase64(videoFile, videoFile.name, 'primary');
        mediaFiles.push({
          name: videoFile.name,
          mimeType,
          data,
          base64Data,
          role: 'primary',
        });
      }
      if (referenceImage) {
        const mimeMatch = referenceImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = referenceImage.replace(/^data:[^;]+;base64,/, '');
        mediaFiles.push({
          name: 'reference_image',
          mimeType,
          data: base64Data,
          base64Data,
          role: 'reference',
        });
      }

      const data = await ApiClient.generateAiWithMedia(
        'ide_konten',
        `Judul: ${promptQuery}\nCaption: ${videoTitleCaption}\nURL: ${tiktokUrl}\nManual Queries: ${manualQueries}`,
        mediaFiles,
        {
          ideaCount,
          ideasCount: ideaCount,
          totalDuration,
          splitDuration,
          targetAeo,
          enableAntiSlop: includeBackgroundSound,
          enableTextOverlay: includeTextOverlay,
          includeBackgroundSound,
          includeTextOverlay,
          modelEngine: GEMINI_MODELS.FLASH,
        },
        userApiKey || undefined
      );

      let finalIdeas = ideasResult;

      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setIdeasResult(data.data);
        finalIdeas = data.data;
      }

      addHistoryItem({
        toolType: 'ide_konten',
        title: `Ide Konten: ${promptQuery.substring(0, 40)}`,
        previewText: `${finalIdeas.length} Ide Konten & Hashtag Siap Pakai (${totalDuration})`,
        fullData: finalIdeas,
        tags: ['Ide Konten', 'AEO', 'TikTok Viral', '2-Stage Pipeline']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setActiveStep(0);
    }
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* MAIN INPUT CONTAINER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Sumber Data / Video TikTok
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Analisis dari Link TikTok, Video, Judul, atau Topik Produk
          </span>
        </div>

        {/* 1. Amber/Yellow Highlighted Input Link TikTok Box */}
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/20 p-4 sm:p-5 space-y-2.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Search className="h-3.5 w-3.5" />
            <span>INPUT LINK VIDEO TIKTOK (OTOMATIS AMBIL DATA)</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="Tempel link video TikTok di sini (contoh: https://vt.tiktok.com/...)"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none shadow-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchTikTok}
              disabled={fetchingTiktok}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
            >
              {fetchingTiktok ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Ambil Data TikTok</span>
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-amber-800/80 font-medium">
            Cukup tempelkan link video TikTok, AI akan otomatis mengambil judul, caption, dan video untuk dianalisis.
          </p>
        </div>

        {/* 2. Middle Row: Video Upload (Left) & Title/Topic Inputs (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Left Column: Unggah File Video (Opsional) */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              UNGGAH FILE VIDEO (OPSIONAL)
            </label>

            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setVideoFile(e.target.files[0]);
              }}
            />

            <div
              onClick={() => videoInputRef.current?.click()}
              className="flex-1 min-h-[140px] rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50/50 hover:border-amber-400 transition p-6 flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              {videoFile ? (
                <div className="space-y-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 max-w-xs truncate">
                    {videoFile.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk ganti
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 mx-auto group-hover:scale-105 transition">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Klik / Tarik & Lepas Video di Sini
                  </div>
                  <div className="text-[11px] text-slate-400">
                    MP4, MOV, WebM untuk analisis adegan visual AI
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Judul & Topik */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                JUDUL / CAPTION VIDEO TIKTOK
              </label>
              <input
                type="text"
                value={videoTitleCaption}
                onChange={(e) => setVideoTitleCaption(e.target.value)}
                placeholder="Contoh: Rekomendasi blender portable mini bisa dicharge..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                TOPIK UTAMA / NAMA PRODUK AFILIASI
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Contoh: Sunscreen SPF 50 ringan tidak lengket untuk kulit berminyak..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Configuration Row: Jumlah Ide, Durasi, Pecah Klip, Mode AEO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Jumlah Ide Konten (1, 2, 3, 4, 5) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-[#5b50e5]" />
                <span>JUMLAH IDE (1 - 5)</span>
              </label>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                {ideaCount} Ide
              </span>
            </div>
            
            {/* Interactive 1-5 Pill Buttons */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setIdeaCount(num)}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    ideaCount === num
                      ? 'bg-[#5b50e5] text-white shadow-xs scale-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title={`${num} Ide Konten`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Total Durasi Konten */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>TOTAL DURASI KONTEN</span>
            </label>
            <select
              value={totalDuration}
              onChange={(e) => setTotalDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="60 Detik / 1 Menit (Rekomendasi Utama)">60 Detik / 1 Menit (Rekomendasi Utama)</option>
              <option value="30 Detik (Standard FYP)">30 Detik (Standard FYP)</option>
              <option value="15 Detik (Short Video Express)">15 Detik (Short Video Express)</option>
              <option value="90 Detik / 1.5 Menit (In-Depth Review)">90 Detik / 1.5 Menit (In-Depth Review)</option>
              <option value="120 Detik / 2 Menit (Maksimal Durasi)">120 Detik / 2 Menit (Maksimal Durasi)</option>
            </select>
          </div>

          {/* Pecah Durasi Prompt */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Scissors className="h-3.5 w-3.5 text-cyan-500" />
              <span>PECAH DURASI PROMPT</span>
            </label>
            <select
              value={splitDuration}
              onChange={(e) => setSplitDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="Tiap 5 Detik per Klip">Tiap 5 Detik per Klip</option>
              <option value="Tiap 10 Detik per Klip">Tiap 10 Detik per Klip</option>
              <option value="Tiap 15 Detik per Klip">Tiap 15 Detik per Klip</option>
              <option value="Pecah Otomatis Berdasarkan Adegan">Pecah Otomatis Berdasarkan Adegan</option>
            </select>
          </div>

          {/* Mode AEO Target */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Search className="h-3.5 w-3.5 text-[#5b50e5]" />
              <span>MODE AEO TARGET</span>
            </label>
            <select
              value={targetAeo}
              onChange={(e) => setTargetAeo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="Keduanya (Short & Long Tail)">Keduanya (Short & Long Tail)</option>
              <option value="Short Queries Saja (1-4 Kata)">Short Queries Saja (1-4 Kata)</option>
              <option value="Long-Tail Queries Saja (Conversational)">Long-Tail Queries Saja (Conversational)</option>
            </select>
          </div>
        </div>

        {/* 4. Row: Pengaturan Prompt Anti-Slop (Left) & Reference Image (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch pt-2">
          {/* Left Column: Pengaturan Prompt Anti-Slop */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              PENGATURAN PROMPT ANTI-SLOP
            </div>

            <div className="space-y-2.5">
              {/* Toggle 1: Background Sound */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 p-3.5 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold text-slate-800">
                    Background Sound / Efek Suara
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {includeBackgroundSound
                      ? 'Aktif — Tag [Background Sound] diikutsertakan'
                      : 'Nonaktif — Tanpa tag sound'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeBackgroundSound(!includeBackgroundSound)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    includeBackgroundSound ? 'bg-[#5b50e5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      includeBackgroundSound ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Text Overlay */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 p-3.5 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold text-slate-800">
                    Text Overlay / Hook Teks di Layar
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {includeTextOverlay
                      ? 'Aktif — Tag [Text Overlay] diikutsertakan'
                      : 'Nonaktif — Tanpa tag text overlay'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeTextOverlay(!includeTextOverlay)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    includeTextOverlay ? 'bg-[#5b50e5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      includeTextOverlay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Reference Image */}
          <div className="space-y-2.5 flex flex-col">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              REFERENCE IMAGE (CEGAH FLICKER IDENTITAS)
            </div>

            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <div
              onClick={() => imageInputRef.current?.click()}
              className="flex-1 min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50/50 hover:border-amber-400 transition p-4 flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              {referenceImage ? (
                <div className="flex items-center gap-3">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div className="text-left space-y-1">
                    <div className="text-xs font-bold text-slate-800">
                      Gambar Terpasang
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReferenceImage(null);
                      }}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus Gambar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500 mx-auto group-hover:scale-105 transition">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Unggah Gambar Karakter/Produk (Opsional)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Query Pencarian Manual */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="space-y-0.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              QUERY PENCARIAN MANUAL (OPSIONAL, MAKS 10)
            </label>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Ketik query yang Anda YAKIN dicari audiens Anda (1 query per baris). Kalau diisi, AI akan fokus memperluas dari query ini.
            </p>
          </div>

          <div className="space-y-1">
            <textarea
              rows={3}
              value={manualQueries}
              onChange={(e) => setManualQueries(e.target.value)}
              placeholder={'Contoh:\nskincare murah\nrekomendasi skincare jerawat'}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
            />
            <div className="flex justify-end">
              <span className="text-[11px] font-semibold text-slate-400">
                {queryCount}/10 query terisi
              </span>
            </div>
          </div>
        </div>

        {/* 6. Big Generate Action Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerateIdeas}
            disabled={loading}
            className="w-full rounded-xl bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4338ca] py-3.5 px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-[#5b50e5]" />
            <span>
              {loading
                ? `Pipeline 2-Tahap: Menganalisis & Meracik ${ideaCount} Ide Konten...`
                : `Hasilkan ${ideaCount} Ide Konten, Prompt Adegan (${totalDuration.split('(')[0].trim()}) & Hashtag Relevan`}
            </span>
          </button>
        </div>
      </div>

      {/* Loading Progression State */}
      {loading && (
        <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-md text-center space-y-4 animate-in fade-in duration-200">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Pipeline 2-Tahap: Menganalisis Video & Grounding
            </h3>
            <p className="text-xs text-slate-500">
              {activeStep === 1
                ? 'Tahap 1: Ekstraksi objek, aksi & setting visual video...'
                : `Tahap 2: Meracik ${ideaCount} Ide Konten Grounded & Dialog Natural Anti-Slop...`}
            </p>
          </div>
        </div>
      )}

      {/* Generated Ideas Output Section */}
      {!loading && ideasResult.length > 0 && (
        <div className="space-y-6">
          {/* Header Bar with Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5b50e5] text-white font-bold text-xs">
                {ideasResult.length}
              </span>
              <span className="text-xs font-black text-slate-900 uppercase">
                Ide Konten TikTok & Hashtag SIAP PAKAI
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  copyText(
                    ideasResult
                      .map(
                        (i, idx) =>
                          `# IDE ${idx + 1}: ${i.title}\n\n[HOOK 3s]:\n${i.hook3s}\n\n[PROMPT ADEGAN]:\n${i.segments
                            ?.map((s: any) => `Klip ${s.segmentIndex} (${s.timestamp}):\n${s.promptAiVideo}`)
                            .join('\n\n')}\n\n[CAPTION]:\n${i.caption}\n\n${i.hashtags?.join(' ')}`
                      )
                      .join('\n\n---\n\n'),
                    'all'
                  )
                }
                className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedSection === 'all' ? 'Tersalin Semua!' : 'Salin Semua Ide'}</span>
              </button>
            </div>
          </div>

          {/* Cards List */}
          {ideasResult.map((idea, idx) => (
            <div
              key={idea.id || idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Card Title & Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#5b50e5] text-white px-2 py-0.5 text-[10px] font-black">
                      #{idx + 1}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{idea.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#5b50e5]">{idea.typeAngle}</span>
                    <span>• Target: {idea.targetAudience}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(JSON.stringify(idea, null, 2), `idea_${idx}`)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>{copiedSection === `idea_${idx}` ? 'Tersalin' : 'Salin Paket Ide'}</span>
                  </button>
                </div>
              </div>

              {/* AEO Query Mapping & Grounded Consensus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    AEO QUERY MAPPING
                  </div>
                  <div className="space-y-1">
                    <div>Short: <span className="font-semibold text-slate-800">&quot;{idea.aeoQueryMapping?.shortQuery}&quot;</span></div>
                    <div>Long: <span className="font-semibold text-slate-800">&quot;{idea.aeoQueryMapping?.longQuery}&quot;</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ALASAN RELEVANSI
                  </div>
                  <p className="text-slate-700 leading-relaxed">{idea.relevanceReason}</p>
                </div>
              </div>

              {/* Hook 3 Detik Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                    HOOK PIKAT 3 DETIK PERTAMA VIDEO
                  </span>
                  <button
                    onClick={() => copyText(idea.hook3s, `hook_${idx}`)}
                    className="text-[#5b50e5] font-bold hover:underline cursor-pointer"
                  >
                    {copiedSection === `hook_${idx}` ? 'Tersalin' : 'Salin Hook'}
                  </button>
                </div>
                <p className="font-bold text-slate-900 whitespace-pre-line leading-relaxed text-sm">
                  {idea.hook3s}
                </p>
              </div>

              {/* Visual & Audio Guide */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-1 text-xs bg-slate-50/40">
                <div className="text-[10px] font-bold text-slate-400 uppercase">PANDUAN VISUAL & AUDIO</div>
                <p className="text-slate-800">{idea.visualAudioGuide}</p>
              </div>

              {/* Segments Breakdown List */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>RINCIAN ADEGAN VIDEO & PROMPT AI PER SEGMEN</span>
                  <button
                    onClick={() =>
                      copyText(
                        idea.segments?.map((s: any) => `[${s.timestamp}]\n${s.promptAiVideo}`).join('\n\n') || '',
                        `all_seg_${idx}`
                      )
                    }
                    className="text-[#5b50e5] font-bold hover:underline cursor-pointer"
                  >
                    Salin Semua Klip
                  </button>
                </div>

                <div className="space-y-4">
                  {idea.segments?.map((seg: any, sIdx: number) => (
                    <div
                      key={`seg_${idx}_${seg.segmentIndex || sIdx}_${sIdx}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-black text-[#5b50e5]">{seg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              sendToTool('prompt_foto', {
                                conceptPrompt: seg.promptAiVideo
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                          >
                            <Camera className="h-3 w-3" />
                            <span>Kirim ke Prompt Foto</span>
                          </button>
                          <button
                            onClick={() => copyText(seg.promptAiVideo, `prompt_${seg.segmentIndex}`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                          >
                            <Copy className="h-3 w-3 text-slate-500" />
                            <span>Salin Prompt Klip</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">AKSI & DIALOG / VO</div>
                        <p className="text-slate-800 font-medium">{seg.actionDialogue}</p>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">PROMPT AI VIDEO GENERATOR (SORA/KLING/RUNWAY/VEO)</div>
                        <pre className="p-3 bg-[#0f172a] text-slate-200 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {seg.promptAiVideo}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption & Hashtags */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                    <span>CAPTION RELEVAN PERSUASIF</span>
                    <button
                      onClick={() => copyText(idea.caption, `cap_${idx}`)}
                      className="text-[#5b50e5] hover:underline cursor-pointer font-bold"
                    >
                      Salin Caption
                    </button>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{idea.caption}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {idea.hashtags?.map((h: string, hIdx: number) => (
                      <span
                        key={hIdx}
                        className="rounded-lg bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => copyText(idea.hashtags?.join(' ') || '', `hash_${idx}`)}
                    className="text-[11px] font-bold text-slate-600 hover:text-[#5b50e5] cursor-pointer"
                  >
                    Salin Hashtag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
