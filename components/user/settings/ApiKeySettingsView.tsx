'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const ApiKeySettingsView: React.FC = () => {
  const { userApiKey, setUserApiKey } = useApp();
  const [keysInput, setKeysInput] = useState(userApiKey || '');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRegisterKeys = () => {
    if (!keysInput.trim()) {
      setUserApiKey('');
      setNotification({
        type: 'success',
        message: 'Kunci akses khusus telah dikosongkan. Sistem menggunakan API Key server utama.'
      });
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const clean = keysInput.trim();
    setUserApiKey(clean);
    setNotification({
      type: 'success',
      message: 'Kunci akses AI berhasil disimpan dan diaktifkan!'
    });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          API Key Setting
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Kelola kunci akses dan konfigurasi mesin AI Anda.
        </p>
      </div>

      {/* 2. Main Card: Manajemen API Access Keys */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-base font-black text-slate-900 pb-2 border-b border-slate-100/80">
          <KeyRound className="h-5 w-5 text-[#818cf8]" />
          <span>Manajemen API Access Keys (Terisolasi per Klien)</span>
        </div>

        <div className="rounded-2xl bg-[#eff6ff] border border-blue-100/90 p-4 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          Masukkan API key Gemini atau kode lisensi khusus Anda. Jika dikosongkan, sistem secara otomatis menggunakan pool API Server Anti-Limit.
        </div>

        <div className="space-y-2">
          <textarea
            rows={3}
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            placeholder="AIzaSy... atau Kode Akses TS-XXXX-XXXX-XXXX"
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 focus:outline-none shadow-xs resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 font-medium">
            Format: Google Gemini Key (<span className="font-mono text-slate-600">AIzaSy...</span>) atau Kode Lisensi (<span className="font-mono text-slate-600">TS-XXXX-XXXX</span>)
          </div>

          <button
            onClick={handleRegisterKeys}
            className="rounded-xl bg-[#818cf8] hover:bg-[#6366f1] text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Simpan Kunci</span>
          </button>
        </div>

        {notification && (
          <div
            className={`rounded-2xl p-4 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
