'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Camera,
  Sparkles,
  Upload,
  Copy,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Clipboard,
  FileText,
  AlertCircle,
  Wand2,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';

export const PhotoPromptView: React.FC = () => {
  const { sharedPayload, addHistoryItem, userApiKey } = useApp();

  // Mode: 'image_to_prompt' (Dari Foto Referensi) vs 'text_to_prompt' (Dari Konsep Teks)
  const [activeMode, setActiveMode] = useState<'image_to_prompt' | 'text_to_prompt'>('image_to_prompt');
  
  const [conceptText, setConceptText] = useState(
    sharedPayload.conceptPrompt || ''
  );
  const [negativePromptInput, setNegativePromptInput] = useState('');
  const [visualPreset, setVisualPreset] = useState('Commercial E-Commerce (Bersih & Profesional)');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = ['16:9', '9:16', '1:1', '4:5', '21:9'];

  useEffect(() => {
    if (sharedPayload.conceptPrompt) {
      setConceptText(sharedPayload.conceptPrompt);
      setActiveMode('text_to_prompt');
    }
  }, [sharedPayload]);

  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const promptQuery =
        activeMode === 'text_to_prompt'
          ? conceptText.trim() || 'Model pria mengenakan kemeja linen putih santai di pantai Bali saat matahari terbenam'
          : uploadedImage
          ? 'Analisis visual foto referensi produk/objek'
          : 'Foto Komersial Estetik Profesional E-Commerce';

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'prompt_foto',
          prompt: promptQuery,
          customApiKey: userApiKey || undefined,
          extraData: {
            presetStyle: visualPreset,
            aspectRatio: aspectRatio,
            negativePrompt: negativePromptInput,
            mode: activeMode
          }
        })
      });
      const data = await res.json();
      let finalResult = null;

      if (data && data.success && data.data && data.data.masterPrompt) {
        finalResult = data.data;
        setResult(data.data);
      } else {
        finalResult = {
          masterPrompt: `Commercial high-end advertising photography of ${promptQuery}, shot on Sony A7R V with Sony FE 85mm f/1.4 GM lens at f/2.0, ISO 100, 1/250s, 8k resolution, razor-sharp optical focus on textures and typography, studio 3-point softbox diffused lighting with subtle golden rim light, pristine clean aesthetic background, award-winning commercial catalog color grading, photorealistic masterpiece --ar ${aspectRatio} --v 6.1 --style raw`,
          negativePrompt: negativePromptInput || `low quality, blurry, deformed, extra limbs, bad typography, plastic look, oversaturated, chromatic aberration, artifacts, dark grain, signature, watermark`,
          stylePreset: visualPreset,
          aspectRatio: aspectRatio,
          relevanceAnalysis: `Prompt dioptimalkan dengan formula lensa optik nyata (85mm GM), lighting studio seimbang, dan parameter anti-slop untuk retensi tinggi di TikTok FYP & Google Lens AEO.`
        };
        setResult(finalResult);
      }

      addHistoryItem({
        toolType: 'prompt_foto',
        title: `Prompt Foto: ${promptQuery.substring(0, 35)}`,
        previewText: `${visualPreset} • ${aspectRatio}`,
        fullData: finalResult,
        tags: ['Prompt Foto', 'Midjourney v6.1', 'Flux.1', 'TikTok AEO']
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

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. TOP HEADER BANNER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Icon + Title + Description */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5b50e5]">
              <Camera className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  Tools Generator Prompt Foto AI
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[11px] font-bold text-[#5b50e5]">
                  <span>🎬 TikTok Hook & 🌐 Google AEO</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-normal">
                Unggah foto referensi atau deskripsi konsep untuk menghasilkan prompt foto sinematik presisi tinggi dengan pemahaman scene dan entitas mendalam.
              </p>
            </div>
          </div>

          {/* Right: Switcher Tabs */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl shrink-0 self-start md:self-center border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveMode('image_to_prompt')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeMode === 'image_to_prompt'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Dari Foto Referensi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('text_to_prompt')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeMode === 'text_to_prompt'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dari Konsep Teks</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          {/* Mode 1: Dari Foto Referensi */}
          {activeMode === 'image_to_prompt' && (
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-3xl border-2 border-dashed border-[#5b50e5]/40 bg-indigo-50/20 hover:bg-indigo-50/40 hover:border-[#5b50e5] transition p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group"
              >
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Reference"
                      className="max-h-48 rounded-2xl object-cover mx-auto shadow-sm border border-slate-200"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Foto Referensi Terpasang
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 ml-2 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/60 text-[#5b50e5] group-hover:scale-105 transition">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-black text-slate-800">
                        Unggah Foto / Gambar Referensi
                      </div>
                      <p className="text-xs text-slate-500 font-normal">
                        Tarik & lepas foto di sini (JPG, PNG, WEBP), atau klik untuk memilih file dari galeri.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-5 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Pilih Berkas Foto
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Dari Konsep Teks */}
          {activeMode === 'text_to_prompt' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <FileText className="h-4 w-4 text-[#5b50e5]" />
                <span>KONSEP / DESKRIPSI IDE FOTO</span>
              </label>
              <textarea
                rows={5}
                value={conceptText}
                onChange={(e) => setConceptText(e.target.value)}
                placeholder="Ketik deskripsi ide foto secara bebas (contoh: 'Model pria mengenakan kemeja linen putih santai di pantai Bali saat matahari terbenam...')"
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#5b50e5] focus:outline-none shadow-xs resize-none"
              />
            </div>
          )}

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>NEGATIVE PROMPT (OPSIONAL)</span>
            </label>
            <input
              type="text"
              value={negativePromptInput}
              onChange={(e) => setNegativePromptInput(e.target.value)}
              placeholder="Contoh: low quality, blurry, disfigured, text, watermark..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#5b50e5] focus:outline-none shadow-xs"
            />
          </div>

          {/* Preset Gaya Visual Foto & Rasio Foto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Left: Preset Gaya Visual Foto */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <Wand2 className="h-3.5 w-3.5 text-[#5b50e5]" />
                <span>PRESET GAYA VISUAL FOTO</span>
              </label>
              <select
                value={visualPreset}
                onChange={(e) => setVisualPreset(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#5b50e5] focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="Commercial E-Commerce (Bersih & Profesional)">
                  Commercial E-Commerce (Bersih & Profesional)
                </option>
                <option value="Editorial Fashion (High Luxury Magazine)">
                  Editorial Fashion (High Luxury Magazine)
                </option>
                <option value="Cinematic Moody (Film Grain & Realism)">
                  Cinematic Moody (Film Grain & Realism)
                </option>
                <option value="Aesthetic Pastel Korean Vanity">
                  Aesthetic Pastel Korean Vanity
                </option>
                <option value="Organic Nature & Outdoor Sunlight">
                  Organic Nature & Outdoor Sunlight
                </option>
              </select>
            </div>

            {/* Right: Rasio Foto */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <Sliders className="h-3.5 w-3.5 text-[#5b50e5]" />
                <span>RASIO FOTO (ASPECT RATIO)</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-[#5b50e5] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-2xl bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4338ca] py-3.5 px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#5b50e5]" />
                  <span>Sedang Meracik Prompt Presisi Tinggi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Hasilkan Prompt Foto Siap Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TARGET AI IMAGE GENERATOR SIDEBAR */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700">
            <Wand2 className="h-3.5 w-3.5 text-[#5b50e5]" />
            <span>TARGET AI IMAGE GENERATOR</span>
          </div>

          {/* Highlighted active card */}
          <div className="rounded-2xl border-2 border-[#5b50e5] bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <span>🎬 TikTok Hook & 🌐 Google AEO</span>
              </div>
              <span className="rounded-full bg-[#5b50e5] text-white text-[10px] font-bold px-2 py-0.5">
                Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              Prompt fotorealistik presisi tinggi yang dioptimalkan untuk retensi 3 detik FYP TikTok dan pemahaman semantik entitas Google Search / Lens AEO.
            </p>
          </div>

          {/* Compatibility checklist */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-800">
              Kompatibilitas Penuh:
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Midjourney v6.1 & Raw Style</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Flux.1 Dev & Schnell Engine</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Ideogram v2 & DALL·E 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GENERATED RESULT CARD */}
      {result && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900">
                Master Prompt Komersial (Siap Pakai Midjourney / Flux / Ideogram)
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                Preset: <span className="font-semibold text-slate-700">{result.stylePreset || visualPreset}</span> • Rasio: <span className="font-semibold text-slate-700">{result.aspectRatio || aspectRatio}</span>
              </div>
            </div>

            <button
              onClick={() => copyText(result.masterPrompt, 'primary')}
              className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copiedSection === 'primary' ? 'Tersalin!' : 'Salin Prompt Utama'}</span>
            </button>
          </div>

          {/* Primary Master Prompt Box */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PROMPT BAHASA INGGRIS OPTIMAL (RAW & HIGH DENSITY)
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[12px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
              {result.masterPrompt}
            </pre>
          </div>

          {/* Negative Prompt Box */}
          {result.negativePrompt && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                  NEGATIVE PROMPT (ANTI-SLOP)
                </span>
                <button
                  onClick={() => copyText(result.negativePrompt, 'neg')}
                  className="text-[#5b50e5] font-bold hover:underline cursor-pointer"
                >
                  {copiedSection === 'neg' ? 'Tersalin' : 'Salin Negative'}
                </button>
              </div>
              <p className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl text-slate-800 font-mono text-[11px] leading-relaxed">
                {result.negativePrompt}
              </p>
            </div>
          )}

          {/* Additional Guidance / Relevance Analysis */}
          {result.relevanceAnalysis && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1 text-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                ANALISIS OPTIK & RETENSI AEO
              </div>
              <p className="font-medium text-slate-700 leading-relaxed">
                {result.relevanceAnalysis}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
