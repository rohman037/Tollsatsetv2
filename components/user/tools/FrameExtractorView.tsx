'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { ExtractedFrameItem } from '@/types';
import {
  Scissors,
  Upload,
  Download,
  Camera,
  Play,
  Pause,
  Sparkles,
  Layers,
  Archive,
  Trash2,
  FileVideo,
  Link2,
  Zap,
  ArrowUpDown,
  LayoutGrid,
  Grid,
  List,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import JSZip from 'jszip';

type FilterType = 'all' | 'manual' | 'auto';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'dense' | 'standard' | 'list';

export const FrameExtractorView: React.FC = () => {
  const { sharedPayload, sendToTool, addHistoryItem } = useApp();

  // Video State
  const [videoSrc, setVideoSrc] = useState<string>(
    sharedPayload.videoUrl || ''
  );
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'url'>('upload');

  // Video Playback & Extractor State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoInterval, setAutoInterval] = useState<number>(2);
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [isExtractingAuto, setIsExtractingAuto] = useState(false);
  const [autoProgress, setAutoProgress] = useState<number>(0);

  // Gallery controls
  const [frames, setFrames] = useState<ExtractedFrameItem[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load payload from other tools if available
  useEffect(() => {
    if (sharedPayload.videoUrl) {
      setVideoSrc(sharedPayload.videoUrl);
      setInputUrl(sharedPayload.videoUrl);
      setVideoFileName(sharedPayload.videoTitle || 'Video dari TikTok Downloader');
    }
  }, [sharedPayload]);

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoFileName(file.name);
    setSelectedMethod('upload');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Handle drop video
  const handleDropVideo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFileName(file.name);
      setSelectedMethod('upload');
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Handle load video from URL (TikTok / MP4)
  const handleLoadUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = inputUrl.trim();
    if (!targetUrl) return;

    setIsLoadingUrl(true);
    try {
      if (targetUrl.includes('tiktok.com') || targetUrl.includes('douyin.com')) {
        const res = await fetch('/api/tiktok/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        const data = await res.json();
        if (data.success && data.data?.videoUrl) {
          setVideoSrc(data.data.videoUrl);
          setVideoFileName(data.data.title || 'Video TikTok');
          setSelectedMethod('url');
        } else {
          setVideoSrc(targetUrl);
          setVideoFileName('Video Web');
          setSelectedMethod('url');
        }
      } else {
        setVideoSrc(targetUrl);
        setVideoFileName('Video URL Eksternal');
        setSelectedMethod('url');
      }
    } catch {
      setVideoSrc(targetUrl);
      setVideoFileName('Video URL');
      setSelectedMethod('url');
    } finally {
      setIsLoadingUrl(false);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Manual Frame Capture
  const handleCaptureManualFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL(imageFormat, 0.95);
      const newFrame: ExtractedFrameItem = {
        id: `frame_manual_${Date.now()}`,
        timestamp: video.currentTime,
        dataUrl,
        label: `Frame Manual @ ${video.currentTime.toFixed(1)}s`,
        type: 'manual'
      };
      setFrames((prev) => [newFrame, ...prev]);

      addHistoryItem({
        toolType: 'ekstraktor_frame',
        title: `Tangkapan Frame @ ${video.currentTime.toFixed(1)}s`,
        previewText: `Ekstraksi resolusi asli (${canvas.width}x${canvas.height})`,
        fullData: newFrame,
        tags: ['Frame', 'Manual HD', 'Visual']
      });
    }
  };

  // Automated Interval Batch Extraction
  const handleAutoExtract = async () => {
    if (!videoRef.current) return;
    setIsExtractingAuto(true);
    setAutoProgress(0);

    const video = videoRef.current;
    const originalTime = video.currentTime;
    const total = Math.min(video.duration || duration || 30, 60);
    const newFrames: ExtractedFrameItem[] = [];

    const steps = Math.floor(total / autoInterval);
    let stepCount = 0;

    for (let t = 0; t <= total; t += autoInterval) {
      video.currentTime = t;
      await new Promise((r) => setTimeout(r, 160));

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newFrames.push({
            id: `frame_auto_${t}_${Date.now()}`,
            timestamp: t,
            dataUrl: canvas.toDataURL(imageFormat, 0.9),
            label: `Frame Auto @ ${t}s`,
            type: 'auto'
          });
        }
      }
      stepCount++;
      setAutoProgress(Math.round((stepCount / (steps + 1)) * 100));
    }

    video.currentTime = originalTime;
    setFrames((prev) => [...newFrames, ...prev]);
    setIsExtractingAuto(false);
    setAutoProgress(0);
  };

  // Single Frame Download
  const handleDownloadSingle = (frame: ExtractedFrameItem) => {
    const a = document.createElement('a');
    a.href = frame.dataUrl;
    a.download = `frame_${frame.timestamp.toFixed(1)}s.${imageFormat === 'image/png' ? 'png' : 'jpg'}`;
    a.click();
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (frames.length === 0) return;
    const zip = new JSZip();
    frames.forEach((frame, idx) => {
      const base64Data = frame.dataUrl.split(',')[1] || frame.dataUrl;
      zip.file(`frame_${idx + 1}_${frame.timestamp.toFixed(1)}s.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semua_frame_satset_${Date.now()}.zip`;
    a.click();
  };

  // Transfer to Photo Prompt AI
  const handleSendToPromptFoto = (frame: ExtractedFrameItem) => {
    sendToTool('prompt_foto', {
      conceptPrompt: `Foto visual ultra-detail 8K dari tangkapan frame produk detik ke ${frame.timestamp.toFixed(1)}s`
    });
  };

  // Filtered & Sorted frames
  const filteredFrames = frames
    .filter((f) => {
      if (filterType === 'manual') return f.type !== 'auto';
      if (filterType === 'auto') return f.type === 'auto';
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.timestamp - b.timestamp;
      return b.timestamp - a.timestamp;
    });

  const manualCount = frames.filter((f) => f.type !== 'auto').length;
  const autoCount = frames.filter((f) => f.type === 'auto').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
        className="hidden"
      />

      {/* 1. TOP 3-STEP PROGRESS / WIZARD HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4.5 flex items-start gap-3.5 shadow-xs transition">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5b50e5] text-white text-xs font-black shadow-xs">
            1
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5b50e5]">
              LANGKAH 1: SUMBER VIDEO
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-tight">
              Unggah file video atau tempel link TikTok
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`rounded-2xl border p-4.5 flex items-start gap-3.5 shadow-xs transition ${
            videoSrc ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 bg-white'
          }`}
        >
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-xs ${
              videoSrc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            2
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              LANGKAH 2: EKSTRAKSI FRAME
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-tight">
              Ambil manual detik aktif atau ekstrak otomatis
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`rounded-2xl border p-4.5 flex items-start gap-3.5 shadow-xs transition ${
            frames.length > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black shadow-xs">
            3
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              LANGKAH 3: GALERI FRAME ({frames.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-tight">
              {frames.length === 0 ? 'Galeri masih kosong' : `${frames.length} frame berhasil diekstrak`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CARD: PILIH SUMBER VIDEO */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
            <FileVideo className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Pilih Sumber Video
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pilih salah satu metode input: Unggah berkas video lokal atau tempel tautan TikTok.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* METODE A: UNGGAH BERKAS VIDEO */}
          <div
            className={`rounded-2xl p-4 sm:p-5 transition space-y-3.5 flex flex-col justify-between ${
              selectedMethod === 'upload'
                ? 'border-2 border-indigo-300 bg-indigo-50/15 ring-2 ring-indigo-500/10'
                : 'border border-slate-200 bg-slate-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
                <Upload className="h-3.5 w-3.5 text-indigo-600" />
                <span>METODE A: UNGGAH BERKAS VIDEO</span>
              </div>
              {selectedMethod === 'upload' && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Dipilih
                </span>
              )}
            </div>

            <div
              onClick={() => {
                setSelectedMethod('upload');
                fileInputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropVideo}
              className="rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white/90 p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group shadow-xs"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition mb-3 shadow-xs">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                Klik atau Seret Video ke Sini
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Format MP4, WEBM, MOV, MKV (Tanpa Batas Ukuran)
              </div>
              {videoFileName && selectedMethod === 'upload' && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[220px]">{videoFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* METODE B: TEMPEL TAUTAN TIKTOK / WEB */}
          <div
            className={`rounded-2xl p-4 sm:p-5 transition space-y-3.5 flex flex-col justify-between ${
              selectedMethod === 'url'
                ? 'border-2 border-indigo-300 bg-indigo-50/15 ring-2 ring-indigo-500/10'
                : 'border border-slate-200 bg-slate-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Link2 className="h-3.5 w-3.5 text-slate-500" />
                <span>METODE B: TEMPEL TAUTAN TIKTOK / WEB</span>
              </div>
              {selectedMethod === 'url' && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Dipilih
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Tempel URL video TikTok atau MP4 web untuk diekstrak langsung dari server proxy.
            </p>

            <form onSubmit={handleLoadUrl} className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setSelectedMethod('url');
                  }}
                  placeholder="https://vt.tiktok.com/ZS... atau URL MP4"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoadingUrl || !inputUrl.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span>{isLoadingUrl ? 'Memuat...' : 'Muat Video'}</span>
                </button>
              </div>
              {videoFileName && selectedMethod === 'url' && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[240px]">{videoFileName}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 2.5 LIVE VIDEO PLAYER & CONTROLS */}
      {videoSrc && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">
                Pemutar & Kontrol Tangkap Frame Video
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-3">
              <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-[9/16] max-h-[420px] relative group shadow-md flex items-center justify-center mx-auto border border-slate-800">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) setDuration(videoRef.current.duration || 0);
                  }}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600">
                  <span>{currentTime.toFixed(1)}s</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration || 30}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, currentTime - 1);
                      }
                    }}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                    title="Mundur 1 detik"
                  >
                    -1s
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#5b50e5] text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(duration, currentTime + 1);
                      }
                    }}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                    title="Maju 1 detik"
                  >
                    +1s
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <button
                onClick={handleCaptureManualFrame}
                className="w-full rounded-2xl bg-[#5b50e5] hover:bg-[#4f46e5] py-4 px-4 text-sm font-black text-white shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <Camera className="h-5 w-5 text-amber-300" />
                <span>Ambil Frame Detik Ini ({currentTime.toFixed(1)}s)</span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3.5">
                <div className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-indigo-600" />
                  <span>Ekstraksi Otomatis per Interval</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">INTERVAL DETIK</label>
                    <select
                      value={autoInterval}
                      onChange={(e) => setAutoInterval(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Tiap 1 Detik</option>
                      <option value={2}>Tiap 2 Detik</option>
                      <option value={3}>Tiap 3 Detik</option>
                      <option value={5}>Tiap 5 Detik</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">FORMAT GAMBAR</label>
                    <select
                      value={imageFormat}
                      onChange={(e) => setImageFormat(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="image/png">PNG (Lossless High-Quality)</option>
                      <option value="image/jpeg">JPG (Kompresi Ringan)</option>
                    </select>
                  </div>
                </div>

                {isExtractingAuto && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-indigo-700">
                      <span>Mengekstrak frame...</span>
                      <span>{autoProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-150"
                        style={{ width: `${autoProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAutoExtract}
                  disabled={isExtractingAuto}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>{isExtractingAuto ? 'Sedang Mengekstrak Batch...' : 'Jalankan Ekstraksi Otomatis'}</span>
                </button>
              </div>

              {frames.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadAllZip}
                    className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 py-3 px-3 text-xs font-bold text-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Unduh Semua ({frames.length} Frame) format .ZIP</span>
                  </button>
                  <button
                    onClick={() => setFrames([])}
                    className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Bersihkan Semua Frame"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CARD: GALERI HASIL FRAME */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Galeri Hasil Frame
                </h2>
                <span className="rounded-full border border-amber-200/90 bg-amber-50/80 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  {frames.length} Frame
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Semua frame hasil pengambilan manual maupun ekstraksi otomatis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setFilterType('all')}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({frames.length})
              </button>
              <button
                onClick={() => setFilterType('manual')}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  filterType === 'manual'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual ({manualCount})
              </button>
              <button
                onClick={() => setFilterType('auto')}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  filterType === 'auto'
                    ? 'bg-[#5b50e5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Otomatis ({autoCount})
              </button>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              title="Urutkan Frame"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>{sortOrder === 'asc' ? 'Awal -> Akhir' : 'Akhir -> Awal'}</span>
            </button>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
              <button
                onClick={() => setViewMode('dense')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'dense' ? 'bg-indigo-50 text-[#5b50e5]' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Rapat"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('standard')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'standard' ? 'bg-indigo-50 text-[#5b50e5]' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Standar"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-indigo-50 text-[#5b50e5]' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Tampilan List"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredFrames.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-xs border border-slate-100">
              <Layers className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                Belum Ada Frame di Galeri
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Unggah video dan ambil frame manual atau jalankan ekstraksi otomatis di atas untuk mengumpulkan frame beresolusi HD.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'dense'
                ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'
                : viewMode === 'list'
                ? 'space-y-2'
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
            }
          >
            {filteredFrames.map((f) => (
              <div
                key={f.id}
                className={`group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition ${
                  viewMode === 'list'
                    ? 'p-3 flex items-center justify-between gap-4'
                    : 'p-2 space-y-2'
                }`}
              >
                <div
                  className={`rounded-xl overflow-hidden bg-slate-900 relative ${
                    viewMode === 'list' ? 'h-16 w-28 shrink-0' : 'aspect-[9/16]'
                  }`}
                >
                  <img src={f.dataUrl} alt={f.label} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur">
                    {f.timestamp.toFixed(1)}s
                  </div>
                  {f.type === 'auto' ? (
                    <div className="absolute bottom-1.5 left-1.5 rounded-md bg-indigo-600/90 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                      Auto
                    </div>
                  ) : (
                    <div className="absolute bottom-1.5 left-1.5 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                      Manual
                    </div>
                  )}
                </div>

                {viewMode === 'list' && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {f.label || `Frame @ ${f.timestamp.toFixed(1)}s`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Format {imageFormat === 'image/png' ? 'PNG Lossless' : 'JPG High-Res'} • Waktu: {f.timestamp.toFixed(1)} detik
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-center gap-1.5 ${
                    viewMode === 'list' ? 'shrink-0' : 'pt-1'
                  }`}
                >
                  <button
                    onClick={() => handleSendToPromptFoto(f)}
                    className="flex-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-1.5 px-2 transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Kirim ke Prompt Foto AI"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Prompt Foto</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingle(f)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Unduh Frame"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setFrames((prev) => prev.filter((item) => item.id !== f.id))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
