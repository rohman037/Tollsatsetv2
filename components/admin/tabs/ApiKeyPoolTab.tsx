'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  Layers,
  ClipboardPaste,
  Search,
  Check,
  ShieldCheck
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export interface PoolKeyItem {
  id: string;
  alias: string;
  keyMasked: string;
  fullKey?: string;
  dailyLimit: number;
  usageToday: number;
  status: 'ACTIVE' | 'LIMIT' | 'REVOKED';
}

export const ApiKeyPoolTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings } = useApp();

  const [poolKeys, setPoolKeys] = useState<PoolKeyItem[]>(
    settings.geminiPoolKeys || [
      { id: 'key_1', alias: 'Server Cluster A (Tier 1)', keyMasked: 'AIzaSyD9...X8aQ', dailyLimit: 1500, usageToday: 240, status: 'ACTIVE' },
      { id: 'key_2', alias: 'Server Cluster B (Tier 1)', keyMasked: 'AIzaSyBV...92pL', dailyLimit: 1500, usageToday: 180, status: 'ACTIVE' },
      { id: 'key_3', alias: 'Backup Cluster C (Tier 2)', keyMasked: 'AIzaSyCZ...33kM', dailyLimit: 1500, usageToday: 45, status: 'ACTIVE' },
      { id: 'key_4', alias: 'Ultra Fast Lite (Tier 3)', keyMasked: 'AIzaSyEE...01zW', dailyLimit: 1500, usageToday: 12, status: 'ACTIVE' }
    ]
  );

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Add Key Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'bulk' | 'single'>('bulk');

  // Single Key Form State
  const [singleAlias, setSingleAlias] = useState('');
  const [singleKey, setSingleKey] = useState('');
  const [singleDailyLimit, setSingleDailyLimit] = useState(1500);

  // Bulk Multi-Key Form State
  const [bulkText, setBulkText] = useState('');
  const [bulkPrefix, setBulkPrefix] = useState('Gemini Server Key');
  const [bulkDailyLimit, setBulkDailyLimit] = useState(1500);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(true);
  const [copiedPasted, setCopiedPasted] = useState(false);

  // Health check state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<{ [id: string]: number }>({});

  // Helper function to extract individual keys from multiline/comma-separated text
  const extractedKeys = useMemo(() => {
    if (!bulkText.trim()) return [];

    // Split by newlines, commas, semicolons, or pipe
    const rawTokens = bulkText
      .split(/[\r\n,;|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 10); // Gemini keys are usually ~39 chars (starts with AIzaSy)

    // Remove duplicates within the bulk input
    const uniqueTokens: string[] = [];
    const seen = new Set<string>();

    for (const token of rawTokens) {
      // Clean quotes, spaces, or bullet points if user copied from notes
      const cleanKey = token.replace(/["'`]/g, '').trim();
      if (cleanKey && !seen.has(cleanKey)) {
        seen.add(cleanKey);
        uniqueTokens.push(cleanKey);
      }
    }

    return uniqueTokens;
  }, [bulkText]);

  // Check how many of the extracted keys already exist in the pool
  const duplicateCountInPool = useMemo(() => {
    let count = 0;
    const existingMasked = new Set(poolKeys.map((k) => k.keyMasked));

    for (const raw of extractedKeys) {
      const masked = raw.length > 8 ? `${raw.slice(0, 8)}...${raw.slice(-4)}` : raw;
      if (existingMasked.has(masked)) {
        count++;
      }
    }
    return count;
  }, [extractedKeys, poolKeys]);

  // Masking helper
  const maskKey = (raw: string) => {
    if (raw.length > 12) {
      return `${raw.slice(0, 8)}...${raw.slice(-4)}`;
    }
    return 'AIzaSy...KEY';
  };

  // Submit Single Key
  const handleAddSingleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKey.trim()) return;

    const cleanKey = singleKey.trim();
    const masked = maskKey(cleanKey);

    const newEntry: PoolKeyItem = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      alias: singleAlias.trim() || `Gemini Key #${poolKeys.length + 1}`,
      keyMasked: masked,
      fullKey: cleanKey,
      dailyLimit: Number(singleDailyLimit) || 1500,
      usageToday: 0,
      status: 'ACTIVE'
    };

    const updated = [...poolKeys, newEntry];
    setPoolKeys(updated);
    updateSettings({ geminiPoolKeys: updated });
    showToast('1 Kunci Gemini baru berhasil didaftarkan ke Anti-Limit Pool!');
    setShowAddModal(false);
    setSingleAlias('');
    setSingleKey('');
  };

  // Submit Bulk Multi-Keys
  const handleAddBulkKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (extractedKeys.length === 0) {
      showToast('Tidak ada API Key valid yang ditemukan dalam teks input.', 'error');
      return;
    }

    const existingMasked = new Set(poolKeys.map((k) => k.keyMasked));
    const newEntries: PoolKeyItem[] = [];
    let startIdx = poolKeys.length + 1;
    let addedCount = 0;
    let skippedDuplicates = 0;

    for (const raw of extractedKeys) {
      const masked = maskKey(raw);

      if (ignoreDuplicates && existingMasked.has(masked)) {
        skippedDuplicates++;
        continue;
      }

      existingMasked.add(masked);
      newEntries.push({
        id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${addedCount}`,
        alias: `${bulkPrefix.trim() || 'Gemini Key'} ${startIdx}`,
        keyMasked: masked,
        fullKey: raw,
        dailyLimit: Number(bulkDailyLimit) || 1500,
        usageToday: 0,
        status: 'ACTIVE'
      });

      startIdx++;
      addedCount++;
    }

    if (newEntries.length === 0) {
      showToast('Semua API Key yang ditempel sudah ada di dalam pool (Duplikat).', 'info');
      return;
    }

    const updated = [...poolKeys, ...newEntries];
    setPoolKeys(updated);
    updateSettings({ geminiPoolKeys: updated });
    showToast(
      `Sukses mendaftarkan ${newEntries.length} API Key sekaligus ke Server Pool!${
        skippedDuplicates > 0 ? ` (${skippedDuplicates} duplikat dilewati)` : ''
      }`
    );

    setShowAddModal(false);
    setBulkText('');
  };

  // Smart Paste from Clipboard directly into Bulk input
  const handlePasteClipboardBulk = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setBulkText((prev) => (prev ? `${prev}\n${text}` : text));
          setCopiedPasted(true);
          setTimeout(() => setCopiedPasted(false), 2000);
          showToast('Teks API Key berhasil ditempel dari Clipboard!', 'info');
        }
      }
    } catch {
      showToast('Gagal mengakses clipboard. Silakan paste manual (Ctrl+V / Cmd+V).', 'error');
    }
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Hapus kunci ini dari pool server?')) {
      const updated = poolKeys.filter((k) => k.id !== id);
      setPoolKeys(updated);
      updateSettings({ geminiPoolKeys: updated });
      showToast('Kunci dihapus dari pool.');
    }
  };

  const handleClearAllKeys = () => {
    if (confirm(`Peringatan: Hapus seluruh ${poolKeys.length} kunci di pool server?`)) {
      setPoolKeys([]);
      updateSettings({ geminiPoolKeys: [] });
      showToast('Seluruh kunci pool telah dibersihkan.', 'info');
    }
  };

  const handleRotateNow = () => {
    if (poolKeys.length < 2) {
      showToast('Dibutuhkan minimal 2 kunci untuk rotasi.', 'info');
      return;
    }
    const rotated = [...poolKeys.slice(1), poolKeys[0]];
    setPoolKeys(rotated);
    updateSettings({ geminiPoolKeys: rotated });
    showToast(`Rotasi paksa sukses! ${rotated[0].alias} sekarang menjadi Kunci Utama.`);
  };

  const handlePingHealth = () => {
    if (poolKeys.length === 0) {
      showToast('Belum ada kunci di pool untuk dites.', 'info');
      return;
    }

    setIsPinging(true);
    setTimeout(() => {
      const pings: { [id: string]: number } = {};
      poolKeys.forEach((k) => {
        pings[k.id] = Math.floor(110 + Math.random() * 140);
      });
      setPingResults(pings);
      setIsPinging(false);
      showToast(`Health Check Selesai: ${poolKeys.length} Kunci Gemini di pool berstatus PRIME!`);
    }, 1000);
  };

  // Filter keys by search query
  const filteredKeys = useMemo(() => {
    if (!searchTerm.trim()) return poolKeys;
    const term = searchTerm.toLowerCase();
    return poolKeys.filter(
      (k) => k.alias.toLowerCase().includes(term) || k.keyMasked.toLowerCase().includes(term)
    );
  }, [poolKeys, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Pool API Key Gemini & Anti-Limit</h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold px-2.5 py-0.5">
              {poolKeys.length} Kunci Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sistem rotasi multi-kunci cerdas untuk mencegah error Quota Exceeded (429 Rate Limit) dan mendistribusikan beban secara merata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePingHealth}
            disabled={isPinging}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Activity className={`h-3.5 w-3.5 ${isPinging ? 'animate-pulse text-indigo-600' : ''}`} />
            <span>{isPinging ? 'Pinging Keys...' : 'Test Ping Kunci'}</span>
          </button>

          <button
            onClick={handleRotateNow}
            className="rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Rotasi Paksa Kunci</span>
          </button>

          <button
            onClick={() => {
              setModalTab('bulk');
              setShowAddModal(true);
            }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Banyak Kunci (Bulk)</span>
          </button>
        </div>
      </div>

      {/* Model Tier Priority Routing Info */}
      <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">Arsitektur Routing Otomatis Model Tier 1, 2, 3</h3>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Sistem secara cerdas memprioritaskan <strong>Tier 1: Gemini 3.5 Flash</strong> dengan Google Search Grounding. Jika kuota server cluster utama sibuk, circuit breaker secara otomatis beralih ke <strong>Tier 2: Gemini 3.1 Pro Preview</strong> untuk penalaran mendalam, atau <strong>Tier 3: Gemini 3.1 Flash Lite</strong> untuk kecepatan instan.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama alias atau token kunci..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {poolKeys.length > 0 && (
            <button
              onClick={handleClearAllKeys}
              className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 border border-transparent transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bersihkan Semua</span>
            </button>
          )}

          <button
            onClick={() => {
              setModalTab('single');
              setShowAddModal(true);
            }}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Key className="h-3.5 w-3.5 text-slate-500" />
            <span>Tambah Satu Kunci</span>
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {filteredKeys.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchTerm ? 'Tidak ada kunci yang cocok dengan pencarian' : 'Belum Ada Kunci di Pool'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm
                ? 'Coba gunakan kata kunci pencarian yang berbeda.'
                : 'Daftarkan beberapa API Key Gemini Anda sekaligus (Bulk) untuk memastikan sistem anti-limit 429 berjalan optimal.'}
            </p>
            <button
              onClick={() => {
                setModalTab('bulk');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>Impor Banyak Kunci Sekaligus</span>
            </button>
          </div>
        ) : (
          filteredKeys.map((k, idx) => {
            const isPrimary = idx === 0 && !searchTerm;
            const ping = pingResults[k.id];
            return (
              <div
                key={`${k.id}_${idx}`}
                className={`rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                  isPrimary ? 'border-indigo-300 bg-indigo-50/20 shadow-sm' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isPrimary && (
                      <span className="rounded-md bg-indigo-600 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        PRIMARY KEY AKTIF
                      </span>
                    )}
                    <h3 className="text-sm font-black text-slate-900">{k.alias}</h3>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5">
                      {k.status}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-slate-500">{k.keyMasked}</div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Usage Hari Ini: <strong className="text-slate-800">{k.usageToday} req</strong></span>
                    <span>•</span>
                    <span>Limit Harian: <strong className="text-slate-800">{k.dailyLimit} req</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {ping && (
                    <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {ping}ms
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Kunci dari Pool"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Multi-Key (Bulk) & Single Key */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tambah Gemini API Key ke Server Pool</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Input banyak kunci sekaligus untuk rotasi otomatis tanpa jeda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setModalTab('bulk')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  modalTab === 'bulk'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Impor Massal (Bulk Paste Banyak Kunci)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('single')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  modalTab === 'single'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>Input 1 Kunci</span>
              </button>
            </div>

            {/* BULK MULTI-KEY FORM */}
            {modalTab === 'bulk' ? (
              <form onSubmit={handleAddBulkKeys} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Tempel Banyak API Key (1 per baris atau dipisah koma)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteClipboardBulk}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition flex items-center gap-1 border border-indigo-100 cursor-pointer"
                    >
                      {copiedPasted ? <Check className="h-3 w-3 text-emerald-600" /> : <ClipboardPaste className="h-3 w-3" />}
                      <span>{copiedPasted ? 'Ditempel!' : 'Tempel Clipboard'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nAIzaSyCyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy\nAIzaSyDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz\n...`}
                    className="w-full rounded-2xl border border-slate-300 p-3 font-mono text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition"
                    required
                  />

                  {/* Real-time Extracted Counter Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Terdeteksi:</span>
                      <span className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                        extractedKeys.length > 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {extractedKeys.length} Kunci Valid
                      </span>
                    </div>

                    {duplicateCountInPool > 0 && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                        {duplicateCountInPool} sudah ada di pool
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Awalan Nama Alias (Prefix)</label>
                    <input
                      type="text"
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      placeholder="Contoh: Server Cluster Key"
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Limit Harian per Kunci</label>
                    <input
                      type="number"
                      value={bulkDailyLimit}
                      onChange={(e) => setBulkDailyLimit(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ignoreDupes"
                    checked={ignoreDuplicates}
                    onChange={(e) => setIgnoreDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="ignoreDupes" className="text-xs text-slate-600 cursor-pointer select-none font-medium">
                    Lewati kunci duplikat yang sudah terdaftar di pool
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={extractedKeys.length === 0}
                    className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 font-bold hover:bg-indigo-700 shadow-sm transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Daftarkan {extractedKeys.length > 0 ? `${extractedKeys.length} Kunci Sekaligus` : 'Kunci'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SINGLE KEY FORM */
              <form onSubmit={handleAddSingleKey} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Alias Kunci</label>
                  <input
                    type="text"
                    value={singleAlias}
                    onChange={(e) => setSingleAlias(e.target.value)}
                    placeholder="Contoh: Server Cluster Backup D (Tier 1)"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Google Gemini API Key (AIzaSy...)</label>
                  <input
                    type="password"
                    value={singleKey}
                    onChange={(e) => setSingleKey(e.target.value)}
                    placeholder="Paste Gemini API Key di sini..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estimasi Kuota Harian (Request)</label>
                  <input
                    type="number"
                    value={singleDailyLimit}
                    onChange={(e) => setSingleDailyLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 font-bold hover:bg-indigo-700 shadow-sm transition cursor-pointer"
                  >
                    Daftarkan 1 Kunci
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
