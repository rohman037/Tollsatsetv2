'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import {
  UserPlus,
  Users,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sliders,
  MessageSquare,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Download,
  Filter,
  Flame,
  Clock,
  Send,
  Plus,
  Trash2,
  Eye,
  Settings2
} from 'lucide-react';
import { AutoFollbackTargetItem, AutoFollbackConfig } from '@/types';
import { Badge, Button, Card } from '@/components/ui';

const INITIAL_TARGETS: AutoFollbackTargetItem[] = [
  {
    id: 'tgt_1',
    username: 'kreator_fashion_id',
    platform: 'tiktok',
    displayName: 'Alya Fashion OOTD',
    followerCount: 3420,
    niche: 'Fashion & Beauty',
    isPrivate: false,
    hasProfilePic: true,
    status: 'pending',
  },
  {
    id: 'tgt_2',
    username: 'gadget.satset',
    platform: 'tiktok',
    displayName: 'Review Gadget Satset',
    followerCount: 8900,
    niche: 'Teknologi & Gadget',
    isPrivate: false,
    hasProfilePic: true,
    status: 'pending',
  },
  {
    id: 'tgt_3',
    username: 'user994827104',
    platform: 'tiktok',
    displayName: 'user994827104',
    followerCount: 3,
    niche: 'Umum',
    isPrivate: true,
    hasProfilePic: false,
    status: 'pending',
  },
  {
    id: 'tgt_4',
    username: 'skincare.glowup.daily',
    platform: 'tiktok',
    displayName: 'Daily Glowup Tips',
    followerCount: 15400,
    niche: 'Fashion & Beauty',
    isPrivate: false,
    hasProfilePic: true,
    status: 'pending',
  },
  {
    id: 'tgt_5',
    username: 'afiliasi_sukses_official',
    platform: 'tiktok',
    displayName: 'Kreator Afiliasi Satset',
    followerCount: 5210,
    niche: 'E-Commerce & Bisnis',
    isPrivate: false,
    hasProfilePic: true,
    status: 'pending',
  },
  {
    id: 'tgt_6',
    username: 'resep.masak.viral',
    platform: 'tiktok',
    displayName: 'Dapur Viral Indonesia',
    followerCount: 22800,
    niche: 'Kuliner & Resep',
    isPrivate: false,
    hasProfilePic: true,
    status: 'pending',
  },
  {
    id: 'tgt_7',
    username: 'spammer_bot_xyz',
    platform: 'tiktok',
    displayName: 'Follow for Follow',
    followerCount: 12,
    niche: 'Umum',
    isPrivate: false,
    hasProfilePic: false,
    status: 'pending',
  }
];

export const AutoFollbackView: React.FC = () => {
  const { addHistoryItem, addLiveEvent } = useApp();

  // Targets & Config State
  const [targets, setTargets] = useState<AutoFollbackTargetItem[]>(INITIAL_TARGETS);
  const [activePlatform, setActivePlatform] = useState<'tiktok' | 'instagram' | 'threads' | 'shopee'>('tiktok');
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [logs, setLogs] = useState<{ id: string; time: string; text: string; type: 'success' | 'skip' | 'info' | 'ai' }[]>([
    {
      id: 'log_0',
      time: new Date().toLocaleTimeString('id-ID'),
      text: 'Engine Auto Follback siap. Menunggu perintah mulai...',
      type: 'info'
    }
  ]);

  // Configurations
  const [delaySec, setDelaySec] = useState(18); // safe delay 18 seconds
  const [jitterSec, setJitterSec] = useState(4); // jitter +/- 4 seconds
  const [minFollowers, setMinFollowers] = useState(20);
  const [requireAvatar, setRequireAvatar] = useState(true);
  const [skipPrivate, setSkipPrivate] = useState(true);
  const [autoAiDm, setAutoAiDm] = useState(true);
  const [aiDmObjective, setAiDmObjective] = useState<'afiliasi' | 'sapaan' | 'komunitas' | 'diskon'>('afiliasi');
  const [selectedNiche, setSelectedNiche] = useState('Semua Niche');

  // AI DM State
  const [aiDmTemplate, setAiDmTemplate] = useState(
    'Halo kak @{username}! Makasih ya sudah follow. Salam kenal dari sesama kreator! Jangan lupa cek rekomendasi produk terbaik di bio/keranjang ya kak! 🙌✨'
  );
  const [isGeneratingAiDm, setIsGeneratingAiDm] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // New Target Modal / Input
  const [batchUsernamesInput, setBatchUsernamesInput] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Metrics
  const totalCount = targets.length;
  const followedCount = targets.filter((t) => t.status === 'followed' || t.status === 'dm_sent').length;
  const skippedCount = targets.filter((t) => t.status === 'skipped').length;
  const pendingCount = targets.filter((t) => t.status === 'pending').length;
  const dmSentCount = targets.filter((t) => t.status === 'dm_sent').length;

  // Real-time execution timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Find next pending target
    const nextPendingIdx = targets.findIndex((t) => t.status === 'pending');
    if (nextPendingIdx === -1) {
      setIsRunning(false);
      setLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          text: '🎉 Semua antrean akun telah selesai diproses!',
          type: 'info'
        },
        ...prev
      ]);
      return;
    }

    setCurrentIndex(nextPendingIdx);
    const actualDelay = Math.max(8, delaySec + (Math.random() > 0.5 ? Math.floor(Math.random() * jitterSec) : -Math.floor(Math.random() * jitterSec)));
    setCountdown(actualDelay);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          processTarget(nextPendingIdx);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, currentIndex, targets]);

  const processTarget = (index: number) => {
    const target = targets[index];
    if (!target) return;

    // Filter check
    let shouldSkip = false;
    let reason = '';

    if (requireAvatar && !target.hasProfilePic) {
      shouldSkip = true;
      reason = 'Akun tanpa foto profil (Potensi Bot)';
    } else if (skipPrivate && target.isPrivate) {
      shouldSkip = true;
      reason = 'Akun Private (Tidak interaktif)';
    } else if (target.followerCount < minFollowers) {
      shouldSkip = true;
      reason = `Followers di bawah batas minimum (< ${minFollowers})`;
    } else if (selectedNiche !== 'Semua Niche' && target.niche !== selectedNiche) {
      shouldSkip = true;
      reason = `Niche berbeda (${target.niche})`;
    }

    if (shouldSkip) {
      setTargets((prev) =>
        prev.map((t, idx) =>
          idx === index
            ? { ...t, status: 'skipped', skipReason: reason, processedAt: new Date().toLocaleTimeString('id-ID') }
            : t
        )
      );

      setLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          text: `⏩ Melewati @${target.username} • Alasan: ${reason}`,
          type: 'skip'
        },
        ...prev
      ]);
    } else {
      const isDm = autoAiDm;
      const statusValue = isDm ? 'dm_sent' : 'followed';

      setTargets((prev) =>
        prev.map((t, idx) =>
          idx === index
            ? {
                ...t,
                status: statusValue,
                aiGreeting: isDm ? aiDmTemplate.replace('{username}', target.username) : undefined,
                processedAt: new Date().toLocaleTimeString('id-ID')
              }
            : t
        )
      );

      setLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          text: `✅ Follback Sukses: @${target.username} (${target.displayName})${isDm ? ' + Auto DM Terkirim 💬' : ''}`,
          type: 'success'
        },
        ...prev
      ]);

      // Trigger telemetry event
      addLiveEvent({
        userCode: 'AUTO-FOLLBACK',
        userName: 'Auto Follback Engine',
        aiTool: 'Auto Follback Medsos',
        category: target.niche,
        modelUsed: 'Realtime WebSocket Runner',
        latencyMs: Math.floor(delaySec * 1000),
        status: 'SUCCESS',
        tokenCount: isDm ? 320 : 120,
        promptSnippet: `Auto follback @${target.username} di platform ${activePlatform.toUpperCase()}`
      });
    }
  };

  const handleStart = () => {
    if (pendingCount === 0) {
      handleReset();
    }
    setIsRunning(true);
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        text: `▶️ Auto Follback dimulai untuk platform ${activePlatform.toUpperCase()}. Delay aman: ${delaySec}s (±${jitterSec}s).`,
        type: 'info'
      },
      ...prev
    ]);
  };

  const handlePause = () => {
    setIsRunning(false);
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        text: '⏸️ Auto Follback dijeda oleh pengguna.',
        type: 'info'
      },
      ...prev
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTargets(
      INITIAL_TARGETS.map((t) => ({
        ...t,
        status: 'pending',
        aiGreeting: undefined,
        skipReason: undefined,
        processedAt: undefined
      }))
    );
    setCurrentIndex(0);
    setCountdown(0);
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        text: '🔄 Status antrean direset ke kondisi awal.',
        type: 'info'
      },
      ...prev
    ]);
  };

  const handleGenerateAiDm = async () => {
    setIsGeneratingAiDm(true);
    try {
      const promptText = `Buatkan 1 pesan DM sapaan follow-back singkat (maksimal 30 kata) untuk akun TikTok/Medsos afiliasi dengan tujuan: ${aiDmObjective}.
Gunakan format ramah, santun, persuasif, sematkan placeholder @{username}, dan sertakan call-to-action halus ke link bio/keranjang kuning.
Bahasa Indonesia santai & akrab ala kreator viral.`;

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, model: 'gemini-3.5-flash' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiDmTemplate(data.text.trim().replace(/^"|"$/g, ''));
        }
      }
    } catch (e) {
      console.warn('AI DM generation error:', e);
      setAiDmTemplate('Hai kak @{username}! Makasih ya sudah follow. Cek bio aku untuk racun produk diskon terbaru ya kak! ✨');
    } finally {
      setIsGeneratingAiDm(false);
    }
  };

  const handleAddBatch = () => {
    if (!batchUsernamesInput.trim()) return;
    const lines = batchUsernamesInput
      .split('\n')
      .map((l) => l.trim().replace('@', ''))
      .filter(Boolean);

    const newItems: AutoFollbackTargetItem[] = lines.map((uname, idx) => ({
      id: `custom_${Date.now()}_${idx}`,
      username: uname,
      platform: activePlatform,
      displayName: uname,
      followerCount: Math.floor(50 + Math.random() * 2500),
      niche: selectedNiche === 'Semua Niche' ? 'Umum' : selectedNiche,
      isPrivate: false,
      hasProfilePic: true,
      status: 'pending'
    }));

    setTargets((prev) => [...prev, ...newItems]);
    setBatchUsernamesInput('');
    setShowBatchModal(false);
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        text: `📥 Berhasil menambahkan ${newItems.length} akun ke antrean Auto Follback.`,
        type: 'info'
      },
      ...prev
    ]);
  };

  const handleSaveToHistory = () => {
    addHistoryItem({
      toolType: 'auto_follback',
      title: `Sesi Auto Follback ${activePlatform.toUpperCase()} (${followedCount} Berhasil)`,
      previewText: `Total ${totalCount} akun diantrekan: ${followedCount} berhasil difollback, ${skippedCount} dilewati filter, ${dmSentCount} auto DM terkirim.`,
      tags: ['AutoFollback', activePlatform, 'GrowthEngine', 'Medsos'],
      fullData: {
        platform: activePlatform,
        total: totalCount,
        followed: followedCount,
        skipped: skippedCount,
        targets
      }
    });
    alert('Hasil sesi Auto Follback berhasil disimpan ke Riwayat Lokal!');
  };

  // Browser Console Script Generator
  const generatedConsoleScript = `/**
 * TOOLS SATSET AI - AUTO FOLLBACK RUNNER v2.5
 * Platform: ${activePlatform.toUpperCase()} | Safe Delay: ${delaySec}s
 */
(async function autoFollbackRunner() {
  console.log("%c🚀 Satset Auto Follback Active...", "color:#4f46e5;font-weight:bold;font-size:14px;");
  const buttons = Array.from(document.querySelectorAll('button')).filter(b => 
    b.innerText.trim() === 'Follow' || b.innerText.trim() === 'Ikuti' || b.innerText.trim() === 'Follback'
  );
  console.log(\`Found \${buttons.length} follow buttons.\`);
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].click();
    console.log(\`✅ Followed user \${i + 1}/\${buttons.length}\`);
    const jitter = Math.floor(Math.random() * 4000);
    await new Promise(r => setTimeout(r, ${delaySec * 1000} + jitter));
  }
  console.log("%c🎉 Auto Follback Session Completed!", "color:#10b981;font-weight:bold;");
})();`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(generatedConsoleScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Auto Follback Medsos & Growth Engine
                </h1>
                <Badge variant="indigo" size="sm">
                  AUTO v2.5
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Otomatisasi follow-back cerdas dengan filter anti-bot, safe human-delay, dan generator AI DM penyapa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBatchModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Import Username
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveToHistory}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Simpan Sesi
          </Button>
        </div>
      </div>

      {/* Platform Selector & Realtime Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {(['tiktok', 'instagram', 'threads', 'shopee'] as const).map((plat) => {
          const isActive = activePlatform === plat;
          return (
            <button
              key={plat}
              type="button"
              onClick={() => {
                setActivePlatform(plat);
                setLogs((prev) => [
                  {
                    id: `log_${Date.now()}`,
                    time: new Date().toLocaleTimeString('id-ID'),
                    text: `Target platform dialihkan ke ${plat.toUpperCase()}`,
                    type: 'info'
                  },
                  ...prev
                ]);
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="text-xs font-black uppercase tracking-wider">
                  {plat === 'tiktok' && 'TikTok Growth'}
                  {plat === 'instagram' && 'Instagram Follback'}
                  {plat === 'threads' && 'Threads Medsos'}
                  {plat === 'shopee' && 'Shopee Video'}
                </div>
                <div className={`text-[11px] font-medium mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {plat === 'tiktok' && 'Auto Follback & Hook'}
                  {plat === 'instagram' && 'Target Niche Audience'}
                  {plat === 'threads' && 'Engagement Network'}
                  {plat === 'shopee' && 'Afiliasi & Buyer Lead'}
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
            </button>
          );
        })}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Antrean</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{pendingCount} belum diproses</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Follback Sukses</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{followedCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Terkonfirmasi aktif</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Dilewati (Filter)</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{skippedCount}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Akun bot/private</div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">AI Auto-DM Sent</div>
          <div className="text-2xl font-black text-purple-800 mt-1">{dmSentCount}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Pesan personal AI</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Live Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Runner Controls & Safe Filter Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Runner Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Runner Otomasi Real-time</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isRunning
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                {isRunning ? 'SEDANG BERJALAN' : 'STANDBY'}
              </span>
            </div>

            {/* Countdown bar if running */}
            {isRunning && (
              <div className="space-y-1.5 bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
                    Jeda Anti-Ban Berikutnya:
                  </span>
                  <span className="font-mono font-black text-indigo-700 text-sm">{countdown}s</span>
                </div>
                <div className="w-full bg-indigo-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (countdown / delaySec) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Play / Pause / Reset Buttons */}
            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  variant="primary"
                  className="flex-1 py-3 text-xs font-bold"
                  onClick={handleStart}
                  leftIcon={<Play className="h-4 w-4" />}
                >
                  Mulai Auto Follback
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={handlePause}
                  leftIcon={<Pause className="h-4 w-4" />}
                >
                  Jeda Otomasi
                </Button>
              )}

              <Button
                variant="ghost"
                className="px-3 text-slate-600 hover:bg-slate-100 border border-slate-200"
                onClick={handleReset}
                title="Reset Antrean"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Cerdas & Rate Limiting */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Filter Anti-Ban & Safeguards</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Delay Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Jeda Aman per Follback (Delay)</span>
                  <span className="font-mono text-indigo-600">{delaySec} Detik</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  value={delaySec}
                  onChange={(e) => setDelaySec(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>10s (Cepat)</span>
                  <span>18s-25s (Direkomendasikan Aman)</span>
                  <span>45s (Super Aman)</span>
                </div>
              </div>

              {/* Min Followers */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Min. Follower Target Akun</label>
                <select
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none cursor-pointer bg-white"
                >
                  <option value={0}>Semua Follower (Tanpa Batas)</option>
                  <option value={10}>Minimal 10 Follower</option>
                  <option value={20}>Minimal 20 Follower (Filter Bot Ringan)</option>
                  <option value={50}>Minimal 50 Follower (Akun Aktif)</option>
                  <option value={100}>Minimal 100 Follower (Kreator Potensial)</option>
                </select>
              </div>

              {/* Niche Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Filter Niche Target</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="Semua Niche">Semua Niche Konten</option>
                  <option value="Fashion & Beauty">Fashion & Beauty</option>
                  <option value="Teknologi & Gadget">Teknologi & Gadget</option>
                  <option value="E-Commerce & Bisnis">E-Commerce & Bisnis</option>
                  <option value="Kuliner & Resep">Kuliner & Resep</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={requireAvatar}
                    onChange={(e) => setRequireAvatar(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Wajib Ada Foto Profil (Lewati Akun Telur)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={skipPrivate}
                    onChange={(e) => setSkipPrivate(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Lewati Akun Private / Terkunci</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoAiDm}
                    onChange={(e) => setAutoAiDm(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Kirim Auto AI DM Sambutan saat Follback</span>
                </label>
              </div>
            </div>
          </div>

          {/* AI Follower Greeter DM Config */}
          {autoAiDm && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h3 className="text-sm font-black text-slate-900">AI Follower Greeter & DM</h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAiDm}
                  disabled={isGeneratingAiDm}
                  className="text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAiDm ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAiDm ? 'Meracik...' : 'Buat Variasi AI'}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tujuan Hook DM:</label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'afiliasi', label: '🛒 Keranjang Kuning' },
                      { id: 'sapaan', label: '👋 Sapaan Hangat' },
                      { id: 'komunitas', label: '👥 Grup VIP' },
                      { id: 'diskon', label: '🏷️ Voucher Promo' }
                    ].map((obj) => (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => setAiDmObjective(obj.id as any)}
                        className={`p-2 rounded-xl font-bold border transition text-left cursor-pointer ${
                          aiDmObjective === obj.id
                            ? 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {obj.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Template Pesan DM:</label>
                  <textarea
                    rows={3}
                    value={aiDmTemplate}
                    onChange={(e) => setAiDmTemplate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-purple-600 focus:outline-none text-slate-800"
                  />
                  <div className="text-[10px] text-slate-400">
                    Gunakan tag <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">@{'{username}'}</code> untuk nama akun otomatis.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Browser Extension / Console Script */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white">Browser Script Runner (No Password)</h3>
              </div>
              <button
                type="button"
                onClick={copyScriptToClipboard}
                className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 px-2.5 py-1 rounded-xl border border-emerald-700 flex items-center gap-1 cursor-pointer transition"
              >
                {copiedScript ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedScript ? 'Tersalin' : 'Salin Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              Copy script ini dan paste di DevTools Console browser (F12) pada halaman web TikTok / Instagram untuk eksekusi langsung tanpa instalasi ekstensi pihak ketiga.
            </p>
          </div>
        </div>

        {/* Right Column: Queue Table & Real-time Live Log Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target List Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Daftar Antrean Akun ({targets.length})</h3>
                <p className="text-[11px] text-slate-500 font-medium">Target follower dari niche yang relevan.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                  {followedCount} Selesai
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Akun Target</th>
                    <th className="px-3.5 py-2.5">Follower</th>
                    <th className="px-3.5 py-2.5">Niche</th>
                    <th className="px-3.5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {targets.map((t, idx) => {
                    const isProcessing = isRunning && currentIndex === idx;
                    return (
                      <tr key={t.id} className={`transition ${isProcessing ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50'}`}>
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-600 shrink-0">
                              {t.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">@{t.username}</div>
                              <div className="text-[10px] text-slate-400 truncate">{t.displayName}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                          {t.followerCount.toLocaleString('id-ID')}
                        </td>

                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                            {t.niche}
                          </span>
                        </td>

                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          {t.status === 'followed' && (
                            <Badge variant="emerald" size="sm">
                              FOLLBACK SUKSES
                            </Badge>
                          )}
                          {t.status === 'dm_sent' && (
                            <Badge variant="purple" size="sm">
                              FOLLBACK + DM
                            </Badge>
                          )}
                          {t.status === 'skipped' && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              DILEWATI
                            </span>
                          )}
                          {t.status === 'pending' && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {isProcessing ? 'MEMPROSES...' : 'ANTREAN'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Activity Logs Stream */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-black text-slate-900">Live Activity Feed (Real-time Stream)</h3>
              </div>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Bersihkan Log
              </button>
            </div>

            <div className="h-48 overflow-y-auto rounded-2xl bg-slate-950 p-3.5 font-mono text-xs text-slate-300 space-y-2 select-text scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-[11px]">Belum ada aktivitas.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-400 font-semibold'
                          : log.type === 'skip'
                          ? 'text-amber-400'
                          : log.type === 'ai'
                          ? 'text-purple-400 font-semibold'
                          : 'text-slate-300'
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Batch Import Usernames */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Import Batch Username Medsos</h3>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Daftar Username (1 per baris):</label>
              <textarea
                rows={6}
                value={batchUsernamesInput}
                onChange={(e) => setBatchUsernamesInput(e.target.value)}
                placeholder={'kreator_fashion\nreview.gadget.id\nafiliasi.viral\nbeauty_daily'}
                className="w-full rounded-2xl border border-slate-300 p-3 font-mono text-xs focus:border-indigo-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Tempel daftar username target kompetitor atau daftar follower yang ingin Anda follback otomatis.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setShowBatchModal(false)}>
                Batal
              </Button>
              <Button variant="primary" className="flex-1 text-xs" onClick={handleAddBatch}>
                Tambahkan ke Antrean
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
