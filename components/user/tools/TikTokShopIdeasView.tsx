'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Copy,
  Download,
  Layers,
  Clipboard,
  Link2,
  Package,
  Clock,
  Scissors,
  Zap,
  Volume2,
  Type,
  Camera,
  ShoppingBag
} from 'lucide-react';

export const TikTokShopIdeasView: React.FC = () => {
  const { addHistoryItem, userApiKey } = useApp();

  const [productUrl, setProductUrl] = useState('');
  const [productDetail, setProductDetail] = useState('');
  const [totalDuration, setTotalDuration] = useState('60 Detik / 1 Menit (Rekomendasi Utama)');
  const [splitDuration, setSplitDuration] = useState('Tiap 10 Detik per Klip');
  const [targetAeo, setTargetAeo] = useState('Keduanya (Short & Long Tail)');
  
  // Prompt structure toggles
  const [includeBackgroundSound, setIncludeBackgroundSound] = useState(true);
  const [includeTextOverlay, setIncludeTextOverlay] = useState(true);

  // Analysis mode & quantity
  const [analysisMode, setAnalysisMode] = useState<'deep' | 'fast'>('deep');
  const [numIdeas, setNumIdeas] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pillar' | 'seo' | 'ideas'>('ideas');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Initial state result is null until user clicks generate
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const promptQuery = productDetail.trim() || productUrl.trim() || 'Produk TikTok Shop Viral';
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'tiktok_shop',
          prompt: `Produk: ${promptQuery}\nURL: ${productUrl}`,
          customApiKey: userApiKey || undefined,
          extraData: {
            totalDuration,
            splitDuration,
            targetAeo,
            analysisMode,
            numIdeas,
            includeBackgroundSound,
            includeTextOverlay
          }
        })
      });
      const data = await res.json();
      const finalData = data && data.success && data.data ? data.data : result;

      if (data && data.success && data.data) {
        setResult(data.data);
      }

      addHistoryItem({
        toolType: 'tiktok_shop',
        title: `TikTok Shop: ${promptQuery.substring(0, 40)}`,
        previewText: `Analisis 5 Pilar & Ide Video Konten (${totalDuration})`,
        fullData: finalData,
        tags: ['TikTok Shop', '5 Pilar', 'Affiliate', 'SEO']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. TOP HEADER BANNER */}
      <div className="rounded-3xl border border-slate-800 bg-[#0f172a] text-white p-6 sm:p-8 shadow-xl space-y-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 shadow-xs">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>TikTok Shop Affiliate Engine</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 shadow-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>Short Link Expansion Active</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            TikTok Shop & Marketplace Ideas Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl font-medium leading-relaxed">
            Ekstrak profil 5 Pilar produk (Kategori, Bahan, Pain Points, Benefit, & Target User), hasilkan 8–12 kata kunci SEO TikTok, dan ciptakan ide konten viral lengkap dengan pecah durasi prompt video per segmen klip.
          </p>
        </div>
      </div>

      {/* 2. MAIN INPUT CONFIGURATION CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Input Link Produk */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Link2 className="h-4 w-4 text-[#5b50e5]" />
            <span>Link Produk</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://vt.tokopedia.com/... atau https://vt.tiktok.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-24 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const txt = await navigator.clipboard.readText();
                  if (txt) setProductUrl(txt);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="absolute right-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer shadow-xs"
            >
              <Clipboard className="h-3.5 w-3.5" />
              <span>Tempel</span>
            </button>
          </div>
        </div>

        {/* Input Detail / Nama / Catatan Khusus Produk */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Package className="h-4 w-4 text-[#5b50e5]" />
            <span>Detail / Nama / Catatan Khusus Produk</span>
          </label>
          <input
            type="text"
            value={productDetail}
            onChange={(e) => setProductDetail(e.target.value)}
            placeholder="Contoh: MOSSDOOM Soleme Bag - Tas Selempang Wanita Kulit PU Sintetis..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* 3 Dropdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Total Durasi Konten */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>TOTAL DURASI KONTEN</span>
            </label>
            <select
              value={totalDuration}
              onChange={(e) => setTotalDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="60 Detik / 1 Menit (Rekomendasi Utama)">60 Detik / 1 Menit (Rekomendasi Utama)</option>
              <option value="30 Detik (Standard FYP)">30 Detik (Standard FYP)</option>
              <option value="15 Detik (Short FYP Express)">15 Detik (Short FYP Express)</option>
              <option value="90 Detik / 1.5 Menit (In-Depth Review)">90 Detik / 1.5 Menit (In-Depth Review)</option>
              <option value="120 Detik / 2 Menit (Long Video Review)">120 Detik / 2 Menit (Long Video Review)</option>
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="Tiap 10 Detik per Klip">Tiap 10 Detik per Klip</option>
              <option value="Tiap 5 Detik per Klip">Tiap 5 Detik per Klip</option>
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="Keduanya (Short & Long Tail)">Keduanya (Short & Long Tail)</option>
              <option value="Short Queries Saja (High Volume)">Short Queries Saja (High Volume)</option>
              <option value="Long-Tail Queries (High Buyer Intent)">Long-Tail Queries (High Buyer Intent)</option>
            </select>
          </div>
        </div>

        {/* Pengaturan Struktur Prompt AI Video */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PENGATURAN STRUKTUR PROMPT AI VIDEO
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1: Background Sound */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition">
              <div className="space-y-0.5 pr-2">
                <div className="text-xs font-bold text-slate-800">
                  Background Sound / Efek Suara
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {includeBackgroundSound
                    ? 'Aktif — Tag [Background Sound] diikutsertakan di prompt'
                    : 'Nonaktif — Tanpa instruksi musik latar'}
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
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition">
              <div className="space-y-0.5 pr-2">
                <div className="text-xs font-bold text-slate-800">
                  Text Overlay / Hook Teks di Layar
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {includeTextOverlay
                    ? 'Aktif — Tag [Text Overlay] diikutsertakan di prompt'
                    : 'Nonaktif — Tanpa instruksi teks di layar'}
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

        {/* Mode Analisis & Jumlah Ide Konten Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 items-end">
          {/* Mode Analisis (Col 7) */}
          <div className="lg:col-span-7 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mode Analisis & Deep Scrape
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Deep Scrape */}
              <button
                type="button"
                onClick={() => setAnalysisMode('deep')}
                className={`rounded-2xl p-3.5 text-left transition cursor-pointer flex flex-col justify-center ${
                  analysisMode === 'deep'
                    ? 'border-2 border-[#5b50e5] bg-indigo-50/20 text-[#5b50e5]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Dalam (Deep Scrape + Reasoning)</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Rekomendasi Terbaik
                </span>
              </button>

              {/* Option 2: Flash */}
              <button
                type="button"
                onClick={() => setAnalysisMode('fast')}
                className={`rounded-2xl p-3.5 text-left transition cursor-pointer flex flex-col justify-center ${
                  analysisMode === 'fast'
                    ? 'border-2 border-[#5b50e5] bg-indigo-50/20 text-[#5b50e5]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Zap className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Cepat (Flash Analysis)</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Analisis Kilat
                </span>
              </button>
            </div>
          </div>

          {/* Jumlah Ide Konten (Col 5) */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Jumlah Ide Konten (Maksimal 5)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumIdeas(n)}
                  className={`h-11 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                    numIdeas === n
                      ? 'bg-[#5b50e5] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {n} Ide
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Action Button on Right */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#a594f9] hover:bg-[#8b78f6] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{loading ? 'Menganalisis & Meracik Ide...' : 'Analisis Produk & Generate Ide Konten'}</span>
          </button>
        </div>
      </div>

      {/* 3. GENERATED RESULT SECTION */}
      {result && (
        <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('pillar')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'pillar'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                1. Analisis Produk (5 Pilar)
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'seo'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                2. Query SEO TikTok
              </button>
              <button
                onClick={() => setActiveTab('ideas')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ideas'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                3. Ide Konten ({result.ideas?.length || 1} Ide & Clip Breakdown)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyText(JSON.stringify(result, null, 2), 'all')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>{copiedSection === 'all' ? 'Tersalin!' : 'Salin Semua Output'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 5 PILAR & ENRICHMENT */}
          {activeTab === 'pillar' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#5b50e5]" />
                  <span>5 Pilar Utama Analisis Produk & Grok Enrichment</span>
                </h3>
                <button
                  onClick={() => copyText(JSON.stringify(result.fivePillars, null, 2), 'pillar')}
                  className="text-xs font-semibold text-[#5b50e5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedSection === 'pillar' ? 'Tersalin' : 'Salin Ringkasan'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    KATEGORI & POSITIONING
                  </span>
                  <p className="font-semibold text-slate-900">{result.fivePillars?.category}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    BAHAN & KEY INGREDIENTS
                  </span>
                  <p className="font-semibold text-slate-900">{result.fivePillars?.ingredients}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-red-500">
                    PAIN POINTS (MASALAH KONSUMEN)
                  </span>
                  <p className="font-semibold text-slate-900">{result.fivePillars?.painPoints}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600">
                    BENEFIT & CLAIM UTAMA
                  </span>
                  <p className="font-semibold text-slate-900">{result.fivePillars?.benefits}</p>
                </div>
              </div>

              {/* Enrichment Extra */}
              {result.grokEnrichment && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Enrichment Extra (Grok-Style Product Intelligence)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Estimasi Harga</div>
                      <div className="font-bold text-slate-900">{result.grokEnrichment.priceRange}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Rating & Review</div>
                      <div className="font-bold text-slate-900">{result.grokEnrichment.rating}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Unique Selling Point</div>
                      <div className="font-bold text-slate-900">{result.grokEnrichment.usp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Mood & Tone Konten</div>
                      <div className="font-bold text-slate-900">{result.grokEnrichment.moodTone}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUERY SEO TIKTOK */}
          {activeTab === 'seo' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#5b50e5]" />
                  <span>Mapping Query SEO TikTok (8–12 Kata Kunci Pencarian)</span>
                </h3>
                <button
                  onClick={() =>
                    copyText(
                      result.seoKeywords?.map((k: any) => `• ${k.query}`).join('\n') || '',
                      'seo'
                    )
                  }
                  className="text-xs font-semibold text-[#5b50e5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedSection === 'seo' ? 'Tersalin' : 'Salin Semua Query'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {result.seoKeywords?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-indigo-50/40 transition"
                  >
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </div>
                      <div className="font-bold text-slate-900">&quot;{item.query}&quot;</div>
                    </div>
                    <button
                      onClick={() => copyText(item.query, `q_${idx}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition cursor-pointer"
                      title="Salin kata kunci"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IDE KONTEN & SEGMENTS */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              {/* Synthetic Query Banner */}
              <div className="rounded-2xl border border-indigo-900/20 bg-[#0f172a] text-white p-5 space-y-3 shadow-md">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>AEO Synthetic Query Fan-Out (AI Search Engine Targeting)</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {result.seoKeywords?.slice(0, 6).map((k: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-slate-200 text-[11px] font-medium"
                    >
                      ✓ {k.query}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ideas Cards */}
              {result.ideas?.map((idea: any, idx: number) => (
                <div
                  key={idea.id || idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5b50e5] text-white text-[10px] font-black">
                          #{idx + 1}
                        </span>
                        <h3 className="text-lg font-black text-slate-900">{idea.title}</h3>
                      </div>
                      <div className="text-xs text-slate-500">
                        Query SEO Acuan: <span className="font-semibold text-indigo-600">&quot;{idea.querySeo}&quot;</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyText(JSON.stringify(idea, null, 2), `idea_${idx}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedSection === `idea_${idx}` ? 'Tersalin' : 'Salin Paket Ide'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hook 3 Detik Box */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-1 text-xs">
                    <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                      HOOK 3 DETIK PERTAMA (0-3S)
                    </div>
                    <p className="font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                      {idea.hook3s}
                    </p>
                  </div>

                  {/* Segments Breakdown */}
                  <div className="space-y-4 pt-2">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Rincian Adegan Video & Prompt AI per Segmen (10 Detik)</span>
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
                          key={`tt_seg_${idx}_${seg.segmentIndex || sIdx}_${sIdx}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                            <span className="font-black text-indigo-700">{seg.timestamp}</span>
                            <button
                              onClick={() => copyText(seg.promptAiVideo, `prompt_${seg.segmentIndex}`)}
                              className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Salin Prompt Klip</span>
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">AKSI & DIALOG / VO</div>
                            <p className="text-slate-800 font-medium">{seg.actionDialogue}</p>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">PROMPT AI VIDEO GENERATOR (SORA/KLING/RUNWAY/VEO)</div>
                            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                              {seg.promptAiVideo}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Caption & Hashtags */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="rounded-xl border border-slate-200 p-3 space-y-1 bg-white shadow-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                        <span>CAPTION RELEVAN PERSUASIF</span>
                        <button
                          onClick={() => copyText(idea.caption, `cap_${idx}`)}
                          className="text-[#5b50e5] hover:underline cursor-pointer"
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
                            className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[11px] font-bold text-indigo-700"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => copyText(idea.hashtags?.join(' ') || '', `hash_${idx}`)}
                        className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
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
      )}
    </div>
  );
};
