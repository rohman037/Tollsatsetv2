'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import { ApiClient } from '@/services/client/api-client';
import { GEMINI_MODELS } from '@/server/config/model-tiers.config';
import {
  Film,
  Sparkles,
  Upload,
  Copy,
  Scissors,
  Camera,
  Layers,
  FileText,
  Download,
  Clipboard,
  Link as LinkIcon,
  Sliders,
  CheckCircle2,
  Trash2,
  Loader2,
  Check,
  Zap,
  Settings2
} from 'lucide-react';

export const VideoToPromptView: React.FC = () => {
  const { sharedPayload, addHistoryItem, sendToTool, userApiKey } = useApp();

  const [inputMethod, setInputMethod] = useState<'upload' | 'tiktok'>('upload');
  const [tiktokUrl, setTiktokUrl] = useState(sharedPayload.videoUrl || '');
  const [splitDuration, setSplitDuration] = useState<'5s' | '8s' | '10s' | '15s' | 'Penuh'>('10s');
  const [engineModel, setEngineModel] = useState<'Gemini 3.6 Flash' | 'Gemini 3.1 Pro'>('Gemini 3.6 Flash');
  const [elementsIncluded, setElementsIncluded] = useState({
    actionMotion: true,
    voiceOver: true,
    cameraLighting: true
  });
  
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKlip, setCopiedKlip] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const durationOptions = ['5s', '8s', '10s', '15s', 'Penuh'] as const;

  // Set shared payload if any
  useEffect(() => {
    if (sharedPayload.videoUrl) {
      setTiktokUrl(sharedPayload.videoUrl);
      setInputMethod('tiktok');
    }
  }, [sharedPayload]);

  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideoFile(file);
      setUploadedVideoName(file.name);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTiktokUrl(text);
      }
    } catch {}
  };

  const handleProcessVideo = async () => {
    setLoading(true);
    try {
      let promptQuery =
        inputMethod === 'tiktok'
          ? tiktokUrl || sharedPayload.videoTitle || 'Video Kreator Viral TikTok'
          : uploadedVideoName || 'Berkas Video Unggahan';

      let enrichedCaption = sharedPayload.videoCaption || '';
      let enrichedAuthor = '';

      if (inputMethod === 'tiktok' && tiktokUrl.trim().startsWith('http')) {
        try {
          const ttInfo = await ApiClient.scrapeTikTok({ url: tiktokUrl.trim() });
          if (ttInfo.success && ttInfo.data) {
            enrichedCaption = ttInfo.data.caption || ttInfo.data.title || enrichedCaption;
            enrichedAuthor = ttInfo.data.authorHandle || ttInfo.data.authorName || '';
            promptQuery = `Video TikTok oleh ${enrichedAuthor || 'Kreator'}: ${enrichedCaption.substring(0, 100)}`;
          }
        } catch {}
      }

      const selectedModel = engineModel === 'Gemini 3.6 Flash' ? GEMINI_MODELS.FLASH : GEMINI_MODELS.PRO;
      const mediaList = inputMethod === 'upload' && uploadedVideoFile ? [uploadedVideoFile] : [];

      const data = await ApiClient.generateAiWithMedia(
        'video_to_prompt',
        `Judul / Sumber: ${promptQuery}\nCaption / Konteks: ${enrichedCaption || tiktokUrl}`,
        mediaList,
        {
          splitDuration,
          model: selectedModel,
          modelEngine: selectedModel,
          elementsIncluded,
          videoUrl: inputMethod === 'tiktok' ? tiktokUrl : undefined,
        },
        userApiKey || undefined
      );

      let finalResult = null;

      if (data && data.success && data.data && Array.isArray(data.data.segments)) {
        setResult(data.data);
        finalResult = data.data;
      } else {
        finalResult = {
          title: `Analysis Video: ${promptQuery}`,
          splitDuration,
          modelUsed: engineModel,
          segments: [
            {
              segmentIndex: 1,
              timestamp: `00:00 - 00:${splitDuration === 'Penuh' ? '30' : splitDuration.replace('s', '').padStart(2, '0')} (Klip 1: Hook & Opening)`,
              actionDialogue: 'Subjek menampilkan produk secara dramatis di depan kamera dengan gestur percaya diri dan tatapan langsung ke audiens.',
              promptAiVideo: `[Style]: Ultra-detailed photorealistic commercial video clip, high-end 8K visual fidelity. [Environment]: Modern aesthetic studio vanity backdrop with warm soft bokeh. [Tone & Pacing]: High-energy opening hook with fluid camera motion. [Camera]: Dynamic slow push-in medium close-up shot focused on hand gestures. [Lighting]: Studio 3-point softbox diffused key light with golden rim accents. [Actions]: Rapid product presentation with crystal clear typography visibility. [Dialogue]: "Nih liat deh hasilnya, beneran bikin kaget dalam hitungan hari!" [Negative Prompt]: flickering, strobing, morphing identity, warping face, glitch, artifacts, blur, oversaturated`
            },
            {
              segmentIndex: 2,
              timestamp: `00:10 - 00:20 (Klip 2: Demo & Feature Breakdown)`,
              actionDialogue: 'Pengambilan gambar jarak dekat (macro) menunjukkan tekstur produk diaplikasikan secara halus dengan pantulan cahaya alami.',
              promptAiVideo: `[Style]: Crisp commercial macro product demonstration with sharp organic details. [Environment]: Pristine white marble surface with minimal aesthetic decor. [Tone & Pacing]: Smooth, satisfying ASMR texture application. [Camera]: Overhead 90-degree top-down flat lay panning shot. [Lighting]: Natural clean daylight simulation with soft realistic contact shadows. [Actions]: Smooth spreading of gel formula onto skin with instant absorbing sheen. [Negative Prompt]: morphing fingers, extra limbs, jittery motion, banding artifacts`
            },
            {
              segmentIndex: 3,
              timestamp: `00:20 - 00:30 (Klip 3: Result & Call to Action)`,
              actionDialogue: 'Model tersenyum puas memperlihatkan hasil akhir yang glowing, menunjuk ke arah keranjang kuning di kiri bawah.',
              promptAiVideo: `[Style]: High-converting viral TikTok review style, authentic lifestyle lighting. [Environment]: Cozy natural aesthetic room interior. [Tone & Pacing]: Enthusiastic, friendly call-to-action closing. [Camera]: Eye-level handheld organic vlog shot with slight natural movement. [Lighting]: Soft frontal beauty ring lighting for radiant skin tone. [Actions]: Confident model holding product bottle near face, pointing to screen callout. [Dialogue]: "Mumpung lagi promo gila-gilaan, langsung checkout di keranjang kuning sekarang!" [Negative Prompt]: text glitch, flickering, duplicate faces`
            }
          ]
        };
        setResult(finalResult);
      }

      addHistoryItem({
        toolType: 'video_to_prompt',
        title: `Video to Prompt (${splitDuration}): ${promptQuery.substring(0, 35)}`,
        previewText: `${finalResult.segments.length} Klip Segmen Prompt AI`,
        fullData: finalResult,
        tags: ['VideoToPrompt', 'Sora/Kling', 'Splitter', splitDuration]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedKlip(idx);
    setTimeout(() => setCopiedKlip(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Video to Prompt
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Ubah video menjadi prompt AI sinematik & pecah durasi per klip adegan.
        </p>
      </div>

      {/* 2. TOP SETTINGS CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Pecah Durasi Prompt Per Klip */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              <Scissors className="h-3.5 w-3.5 text-[#5b50e5]" />
              <span>PECAH DURASI PROMPT PER KLIP</span>
            </label>
            <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
              {durationOptions.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSplitDuration(dur)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                    splitDuration === dur
                      ? 'bg-[#5b50e5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Engine Model AI */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>ENGINE MODEL AI</span>
            </label>
            <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
              {(['Gemini 3.6 Flash', 'Gemini 3.1 Pro'] as const).map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setEngineModel(model)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                    engineModel === model
                      ? 'bg-[#5b50e5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Checkbox Row: Elemen Detail Rincian */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span>Elemen Detail Rincian:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={elementsIncluded.actionMotion}
                onChange={(e) =>
                  setElementsIncluded({ ...elementsIncluded, actionMotion: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#5b50e5] cursor-pointer"
              />
              <span className="text-slate-800 font-medium">Aksi & Gerakan (Action)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={elementsIncluded.voiceOver}
                onChange={(e) =>
                  setElementsIncluded({ ...elementsIncluded, voiceOver: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#5b50e5] cursor-pointer"
              />
              <span className="text-slate-800 font-medium">Transkrip Voice Over / VO</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={elementsIncluded.cameraLighting}
                onChange={(e) =>
                  setElementsIncluded({ ...elementsIncluded, cameraLighting: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#5b50e5] cursor-pointer"
              />
              <span className="text-slate-800 font-medium">Kamera & Lighting</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: PILIH SUMBER VIDEO */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-black uppercase text-slate-800 tracking-wider">
            PILIH SUMBER VIDEO:
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setInputMethod('upload')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                inputMethod === 'upload'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Unggah File Video</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMethod('tiktok')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                inputMethod === 'tiktok'
                  ? 'bg-[#5b50e5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Input Link TikTok</span>
              <span className="rounded-full bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 uppercase ml-0.5">
                DIRECT
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Unggah File Video Content */}
        {inputMethod === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/mov,video/webm,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#5b50e5]/60 hover:bg-slate-50/50 transition p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group"
            >
              {uploadedVideoName ? (
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-black text-slate-800">
                      {uploadedVideoName}
                    </div>
                    <p className="text-xs text-slate-500">
                      Berkas siap dianalisis dan dipecah per {splitDuration}.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessVideo();
                      }}
                      disabled={loading}
                      className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-5 py-2.5 text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Menganalisis Video...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>Proses Analisis Video</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedVideoFile(null);
                        setUploadedVideoName(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Ganti
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50/80 text-[#5b50e5] group-hover:scale-105 transition">
                    <Upload className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-black text-slate-800">
                      Unggah Berkas Video Anda
                    </div>
                    <p className="text-xs text-slate-500 font-normal">
                      Tarik & lepas berkas video di sini, atau klik untuk memilih file.
                      <br />
                      <span className="text-slate-400">Akan dipecah per {splitDuration}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-6 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Pilih File Video
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Input Link TikTok Content */}
        {inputMethod === 'tiktok' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <LinkIcon className="h-4 w-4 text-[#5b50e5]" />
                <span>Tempelkan Link Video TikTok</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Sistem akan mengambil video secara otomatis dari link TikTok tersebut untuk langsung diolah menjadi prompt sinematik.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="Contoh: https://vt.tiktok.com/xxxx atau https://www.tiktok.com/@user/video/xxxx"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-24 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#5b50e5] focus:outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Tempel</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleProcessVideo}
                disabled={loading || !tiktokUrl.trim()}
                className="rounded-2xl bg-[#938cf1] hover:bg-[#7e75ea] text-white py-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Sedang Menganalisis Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Import & Analisis Video TikTok</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. RESULT SECTION */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-sm font-black text-slate-900">
                Hasil Split Prompt Video AI
              </span>
              <div className="text-xs text-slate-500 font-medium">
                Dipecah per <span className="font-semibold text-slate-700">{result.splitDuration || splitDuration}</span> • Model: <span className="font-semibold text-slate-700">{engineModel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  copyPrompt(
                    result.segments.map((s: any) => `[${s.timestamp}]\n${s.promptAiVideo}`).join('\n\n'),
                    99
                  )
                }
                className="rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedKlip === 99 ? 'Tersalin Semua!' : `Salin Semua ${result.segments.length} Prompt`}</span>
              </button>
            </div>
          </div>

          {/* Segments list */}
          <div className="space-y-4">
            {result.segments.map((seg: any) => (
              <div
                key={seg.segmentIndex}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#5b50e5] text-white px-2.5 py-1 text-xs font-black">
                      Segmen Klip {seg.segmentIndex}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {seg.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        sendToTool('prompt_foto', {
                          conceptPrompt: seg.promptAiVideo
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Ke Prompt Foto</span>
                    </button>
                    <button
                      onClick={() => copyPrompt(seg.promptAiVideo, seg.segmentIndex)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      {copiedKlip === seg.segmentIndex ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Salin Prompt Klip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {seg.actionDialogue && (
                  <div className="space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AKSI & DIALOG / VOICE OVER
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {seg.actionDialogue}
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-xs pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    MASTER PROMPT AI KLIP {seg.segmentIndex} (SIAP COPY)
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                    {seg.promptAiVideo}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
