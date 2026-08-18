'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Layers,
  Info
} from 'lucide-react';

export const ApiKeySettingsView: React.FC = () => {
  const { userApiKeys, addUserApiKeys, removeUserApiKey, clearUserApiKeys } = useApp();
  const [rawInput, setRawInput] = useState('');
  const [visibleKeyIds, setVisibleKeyIds] = useState<{ [index: number]: boolean }>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Helper to count potential keys in input
  const detectedKeysCount = React.useMemo(() => {
    if (!rawInput.trim()) return 0;
    const tokens = rawInput
      .split(/[\r\n,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 10);
    return tokens.length;
  }, [rawInput]);

  // Handle Paste from Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawInput((prev) => (prev.trim() ? `${prev}\n${text.trim()}` : text.trim()));
        showNotify('info', 'Teks dari clipboard berhasil ditempel.');
      }
    } catch {
      showNotify('error', 'Tidak dapat mengakses clipboard. Silakan tempel manual.');
    }
  };

  const showNotify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // 1. User clicks "Daftarkan Kunci"
  const handleRegisterKeys = () => {
    if (!rawInput.trim()) {
      showNotify('error', 'Silakan tempel atau ketik minimal 1 API key Gemini sebelum mendaftar.');
      return;
    }

    const { added, duplicates, invalid } = addUserApiKeys(rawInput);

    if (added > 0) {
      setRawInput('');
      let msg = `Berhasil mendaftarkan ${added} API Key baru! Status: AKTIF.`;
      if (duplicates > 0) msg += ` (${duplicates} kunci sudah terdaftar diabaikan)`;
      if (invalid > 0) msg += ` (${invalid} baris format tidak valid diabaikan)`;
      showNotify('success', msg);
    } else if (duplicates > 0 && invalid === 0) {
      showNotify('info', 'Semua kunci yang dimasukkan sudah ada di daftar Kunci Terdaftar.');
    } else {
      showNotify('error', 'Format API Key tidak valid. Pastikan panjang kunci minimal 10 karakter.');
    }
  };

  // 2. User deletes a single key
  const handleDeleteKey = (keyString: string, index: number) => {
    removeUserApiKey(keyString);
    showNotify('info', `Kunci #${index + 1} berhasil dihapus dari daftar.`);
  };

  // 3. User deletes all keys
  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA kunci API terdaftar?')) {
      clearUserApiKeys();
      showNotify('info', 'Semua kunci API terdaftar telah dihapus.');
    }
  };

  // 4. User copies key
  const handleCopyKey = (keyString: string, index: number) => {
    navigator.clipboard.writeText(keyString);
    setCopiedIndex(index);
    showNotify('success', `Kunci #${index + 1} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Masking helper
  const maskApiKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key;
    if (key.length <= 12) return '••••••••••••••••';
    const prefix = key.slice(0, 8);
    const suffix = key.slice(-4);
    return `${prefix}${'•'.repeat(Math.max(12, key.length - 12))}${suffix}`;
  };

  const toggleVisibility = (index: number) => {
    setVisibleKeyIds((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="rounded-3xl border border-slate-800 bg-[#0f172a] text-white p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/50 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 shadow-xs">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Dedicated AI Key Manager</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 shadow-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>Multi-Key Auto Failover</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pengaturan API Key
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl font-medium leading-relaxed">
            Daftarkan satu atau beberapa Google Gemini API Key milik Anda sendiri (1 baris = 1 key). 
            Kunci yang didaftarkan akan otomatis dirotasi oleh sistem Satset Tools untuk bypass rate limit dan kuota generasi tanpa batas.
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold flex items-center justify-between gap-3 shadow-xs border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notification.type === 'info'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] underline font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Formulir Input: Daftarkan Kunci (1 Baris = 1 Key) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900">
            <KeyRound className="h-4 w-4 text-[#5b50e5]" />
            <span>Daftarkan API Key Baru (1 Baris = 1 Key)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer shadow-xs"
            >
              <ClipboardPaste className="h-3.5 w-3.5 text-[#5b50e5]" />
              <span>Tempel dari Clipboard</span>
            </button>
            {rawInput && (
              <button
                type="button"
                onClick={() => setRawInput('')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition cursor-pointer"
              >
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Tempel satu atau beberapa API Key Gemini di sini (1 baris = 1 key)...
Contoh:
AIzaSyBv9xY1234567890abcdefghijklm
AIzaSyD8zK0987654321fedcba09876543`}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 focus:outline-none shadow-xs resize-y min-h-[120px]"
          />
        </div>

        {/* Input Bar Stats & Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700">
              <Layers className="h-3 w-3 text-[#5b50e5]" />
              <span>{detectedKeysCount} Kunci Terdeteksi</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Format: <span className="font-mono text-slate-600">AIzaSy...</span> (Gemini Developer Key)
            </span>
          </div>

          <button
            type="button"
            onClick={handleRegisterKeys}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Daftarkan Kunci</span>
          </button>
        </div>
      </div>

      {/* 3. Daftar "Kunci Terdaftar" (Status: AKTIF, Bisa Dihapus Kapan Saja) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Kunci Terdaftar</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {userApiKeys.length} Kunci Aktif
            </span>
          </div>

          {userApiKeys.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>

        {/* List of Registered Keys */}
        {userApiKeys.length > 0 ? (
          <div className="space-y-3">
            {userApiKeys.map((keyString, idx) => {
              const isVisible = !!visibleKeyIds[idx];
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={`${keyString}_${idx}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left: Key Index & Masked Value */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-xl bg-indigo-100 text-[#5b50e5] font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Gemini API Key
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          AKTIF
                        </span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {maskApiKey(keyString, isVisible)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Toggle View, Copy, Delete) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => toggleVisibility(idx)}
                      title={isVisible ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer shadow-2xs"
                    >
                      {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyKey(keyString, idx)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer shadow-2xs ${
                        isCopied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(keyString, idx)}
                      title="Hapus Kunci Ini"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 px-3 py-2 text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 text-[#5b50e5] flex items-center justify-center shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900">
                Belum Ada Kunci Pribadi Terdaftar
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Sistem saat ini otomatis menggunakan <strong>Pool API Server Utama Satset Tools (Multi-Tier & Anti-Limit)</strong>.
                Daftarkan API key Gemini Anda sendiri di atas jika Anda ingin memakai kuota API pribadi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
