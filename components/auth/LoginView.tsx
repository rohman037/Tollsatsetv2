'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/lib/app-context';
import {
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Video,
  Camera,
  Crop,
  MessageCircle,
  CircleHelp,
  ClipboardPaste,
  Check,
  X,
  Zap,
  Shield,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const STORAGE_AUTOFILL_KEY = 'satset_autofill_saved_code';
const STORAGE_AUTOFILL_REMEMBER = 'satset_autofill_remember_flag';

export const LoginView: React.FC = () => {
  const { loginWithCode, setCurrentView, setActiveToolTab, settings, packages } = useApp();
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedClipboard, setCopiedClipboard] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedFeaturePreview, setSelectedFeaturePreview] = useState<string | null>(null);

  // Secret admin modal / quick test modal
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to open WhatsApp consultation
  const handleWhatsAppConsultation = () => {
    let cleanPhone = (settings.waAdminPhone || '6281234567890').replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;
    const msg = encodeURIComponent(
      settings.waDefaultTemplate ||
        'Halo Admin Tools Satset! Saya ingin konsultasi & mendapatkan kode akses workspace baru.'
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleLihatPaketClick = () => {
    setCurrentView('pricing');
  };

  // Trigger auto-login helper
  const triggerLogin = useCallback(
    (codeToUse: string) => {
      const cleanVal = codeToUse.trim();
      if (!cleanVal) {
        setErrorMsg('Masukkan kode akses Anda terlebih dahulu');
        return;
      }

      setIsLoading(true);
      setErrorMsg('');

      setTimeout(() => {
        const res = loginWithCode(cleanVal);
        setIsLoading(false);

        if (!res.success) {
          setErrorMsg(res.message || 'Kode Akses tidak valid atau akun dinonaktifkan.');
        } else {
          try {
            localStorage.setItem(STORAGE_AUTOFILL_KEY, cleanVal);
            localStorage.setItem(STORAGE_AUTOFILL_REMEMBER, 'true');
          } catch {}
        }
      }, 350);
    },
    [loginWithCode]
  );

  // Auto-fill from URL or saved session
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code') || params.get('key') || params.get('licence');
        const autoSubmit = params.get('autologin') === 'true';

        if (urlCode) {
          setAccessCodeInput(urlCode.trim());
          if (autoSubmit) {
            triggerLogin(urlCode.trim());
            return;
          }
        } else {
          const savedCode = localStorage.getItem(STORAGE_AUTOFILL_KEY);
          if (savedCode) {
            setAccessCodeInput(savedCode);
          }
        }
      }
    } catch (e) {
      console.warn('AutoFill restoration note:', e);
    }
  }, [triggerLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLogin(accessCodeInput);
  };

  // Smart Paste from Clipboard
  const handleSmartPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleaned = text.trim().replace(/^kode\s*:\s*/i, '');
          setAccessCodeInput(cleaned);
          setCopiedClipboard(true);
          setSuccessMsg('Kode berhasil ditempel!');
          setTimeout(() => {
            setCopiedClipboard(false);
            setSuccessMsg('');
          }, 2000);
          inputRef.current?.focus();
        }
      } else {
        inputRef.current?.focus();
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 3) {
      setShowDemoCredentials(true);
      setLogoClickCount(0);
    }
  };

  const selectQuickCode = (code: string) => {
    setAccessCodeInput(code);
    triggerLogin(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-[#5b50e5] selection:text-white relative font-sans">
      {/* Background Subtle Gradient & Light Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(91,80,229,0.06),transparent)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b50e5] text-white font-bold text-base shadow-sm hover:bg-[#4f46e5] transition duration-200 cursor-pointer select-none"
            title="Tools Satset"
          >
            TS
          </button>
          <span className="font-extrabold text-xl text-[#3b349b] tracking-tight">
            Tools Satset
          </span>
        </div>

        {/* Top Right Help / Bantuan */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            <CircleHelp className="h-4 w-4 text-slate-500" />
            <span>Bantuan</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Hero Headline, Visual Card, 4 Feature Cards */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 leading-[1.18] tracking-tight">
              Buat lebih banyak konten <br className="hidden sm:inline" />
              dari satu video
            </h1>

            {/* Gradient Visual Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f166d] via-[#3527a8] to-[#5b50e5] p-8 sm:p-12 text-center text-white shadow-md">
              {/* Inner ambient glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Yellow glowing star icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm">
                  <Sparkles className="h-7 w-7 text-amber-300" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2.5">
                  Workspace AI All-in-One
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 max-w-lg leading-relaxed font-normal">
                  Generator Ide Konten, Video-to-Prompt, Prompt Foto Nano Banana Ultra, dan Frame Extractor dalam satu platform satset.
                </p>
              </div>
            </div>

            {/* 4 Feature Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              {/* 1. Ide Konten */}
              <div
                onClick={() => {
                  setActiveToolTab('ide_konten');
                  setSelectedFeaturePreview('ide_konten');
                }}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#5b50e5]/40 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#5b50e5] group-hover:bg-[#5b50e5] group-hover:text-white transition-colors duration-200">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#5b50e5] transition-colors">
                    Ide konten
                  </span>
                </div>
              </div>

              {/* 2. Prompt Video */}
              <div
                onClick={() => {
                  setActiveToolTab('video_to_prompt');
                  setSelectedFeaturePreview('video_to_prompt');
                }}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#5b50e5]/40 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#5b50e5] group-hover:bg-[#5b50e5] group-hover:text-white transition-colors duration-200">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#5b50e5] transition-colors">
                    Prompt video
                  </span>
                </div>
              </div>

              {/* 3. Prompt Foto */}
              <div
                onClick={() => {
                  setActiveToolTab('prompt_foto');
                  setSelectedFeaturePreview('prompt_foto');
                }}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#5b50e5]/40 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#5b50e5] group-hover:bg-[#5b50e5] group-hover:text-white transition-colors duration-200">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#5b50e5] transition-colors">
                    Prompt foto
                  </span>
                </div>
              </div>

              {/* 4. Ekstraksi Frame */}
              <div
                onClick={() => {
                  setActiveToolTab('ekstraktor_frame');
                  setSelectedFeaturePreview('ekstraktor_frame');
                }}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#5b50e5]/40 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#5b50e5] group-hover:bg-[#5b50e5] group-hover:text-white transition-colors duration-200">
                  <Crop className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#5b50e5] transition-colors">
                    Ekstraksi frame
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Clean Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50">
              
              {/* Form Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Masuk ke workspace <br />
                  Anda
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5">
                  Gunakan Kode Akses Anda untuk melanjutkan.
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Kode Akses Input Field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    KODE AKSES
                  </label>
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <KeyRound className="h-4 w-4" />
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value)}
                      placeholder="Masukkan kode akses Anda"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-20 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#5b50e5] focus:outline-none focus:ring-2 focus:ring-[#5b50e5]/20 transition-all"
                      required
                    />

                    {/* Tempel / Smart Paste button */}
                    <button
                      type="button"
                      onClick={handleSmartPaste}
                      className="absolute right-2 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#5b50e5] transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Tempel dari Clipboard"
                    >
                      {copiedClipboard ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ClipboardPaste className="h-3 w-3" />
                      )}
                      <span>{copiedClipboard ? 'Ditempel' : 'Tempel'}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Button: Masuk ke aplikasi */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#5b50e5] hover:bg-[#4f46e5] active:scale-[0.99] text-white py-3.5 px-4 font-semibold text-sm transition duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke aplikasi</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Link: Belum punya kode akses? Lihat paket akses */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleLihatPaketClick}
                  className="text-xs font-semibold text-[#5b50e5] hover:text-[#4338ca] hover:underline cursor-pointer transition"
                >
                  Belum punya kode akses? Lihat paket akses
                </button>
              </div>

              {/* Divider: ATAU */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ATAU
                </div>
              </div>

              {/* WhatsApp Consultation Button */}
              <button
                type="button"
                onClick={handleWhatsAppConsultation}
                className="w-full rounded-xl border border-emerald-400 hover:bg-emerald-50/50 bg-white text-emerald-600 font-semibold text-sm py-3 px-4 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Konsultasi melalui WhatsApp</span>
              </button>

              {/* Quick Demo Credentials pill (Easy testing helper) */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Ingin uji coba langsung?</span>
                <button
                  type="button"
                  onClick={() => setShowDemoCredentials(true)}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Gunakan Akun Demo
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer Badges */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/70 flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 font-normal">
          
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Akses aman</span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
            <span>Tanpa password</span>
          </div>

          <span className="text-slate-300">•</span>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
            <span>Bantuan langsung</span>
          </div>

        </div>
      </footer>

      {/* MODAL: Bantuan & Panduan */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#5b50e5]">
                  <CircleHelp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pusat Bantuan & Panduan Masuk</h3>
                  <p className="text-xs text-slate-500">Pertanyaan umum seputar akses Satset Tools</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-[#5b50e5]" />
                  <span>Apa itu Kode Akses?</span>
                </div>
                <p>
                  Kode Akses adalah lisensi unik yang Anda dapatkan setelah memilih paket langganan. Tanpa perlu mendaftar dengan password rumit, cukup masukkan kode akses Anda untuk langsung menggunakan seluruh tool AI.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Bagaimana jika Kode Akses bermasalah?</span>
                </div>
                <p>
                  Tim support siap membantu Anda secara langsung via WhatsApp untuk verifikasi lisensi, pergantian perangkat, atau perpanjangan kuota.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  handleWhatsAppConsultation();
                }}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Hubungi Admin WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quick Demo / Testing Accounts */}
      {showDemoCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#5b50e5]">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pilih Akun Demo Uji Coba</h3>
                  <p className="text-[11px] text-slate-500">Klik salah satu akun untuk langsung masuk</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoCredentials(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Member VIP */}
              <button
                type="button"
                onClick={() => {
                  setShowDemoCredentials(false);
                  selectQuickCode('TS-PRO-2026-VIP');
                }}
                className="w-full text-left p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">Akun Member VIP (Kreator Viral)</span>
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                    PILIH
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700 font-mono mt-1">
                  Kode: <span className="font-bold">TS-PRO-2026-VIP</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akses 5 Tool AI, Generator Prompt Video 8K, Prompt Foto Ultra HD & Ekstraktor Frame.
                </p>
              </button>

              {/* Regular User */}
              <button
                type="button"
                onClick={() => {
                  setShowDemoCredentials(false);
                  selectQuickCode('SATSET-882194');
                }}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Akun User (Rizky Ramadhan)</span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md group-hover:bg-[#5b50e5] group-hover:text-white transition">
                    PILIH
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono mt-1">
                  Kode: <span className="font-bold">SATSET-882194</span>
                </div>
              </button>

              {/* Super Admin */}
              <button
                type="button"
                onClick={() => {
                  setShowDemoCredentials(false);
                  selectQuickCode('ahmaddavid0906@gmail.com');
                }}
                className="w-full text-left p-3 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Akun Super Admin Master (Ahmad David)</span>
                  <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-md">
                    ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-purple-700 font-mono mt-1">
                  Email: <span className="font-bold">ahmaddavid0906@gmail.com</span>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowDemoCredentials(false)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Quick Preview / Tool Selection Notification */}
      {selectedFeaturePreview && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-700 flex items-start gap-3 animate-in slide-in-from-bottom-4">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">Tool Dipilih!</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Masukkan kode akses lisensi Anda di sebelah kanan untuk langsung membuka workspace.
            </p>
          </div>
          <button
            onClick={() => setSelectedFeaturePreview(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
};
