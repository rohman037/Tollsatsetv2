'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Key,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  CheckCircle2,
  Shield,
  Activity,
  Award,
  Users,
  ChevronRight,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithCode, setCurrentView, settings } = useApp();
  const [loginInput, setLoginInput] = useState('');
  const [loginMode, setLoginMode] = useState<'code' | 'email'>('code');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretDemo, setShowSecretDemo] = useState(settings.loginShowQuickAccess ?? false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setErrorMsg(
        loginMode === 'code'
          ? 'Masukkan kode akses lisensi Anda'
          : 'Masukkan alamat email akun Anda'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = loginWithCode(loginInput.trim());
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(
          res.message ||
            (loginMode === 'code'
              ? 'Kode akses tidak valid atau akun dinonaktifkan.'
              : 'Email tidak terdaftar sebagai pengguna aktif.')
        );
      }
    }, 400);
  };

  const handleLogoSecretClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 5) {
      setShowSecretDemo(!showSecretDemo);
      setLogoClickCount(0);
    }
  };

  const handleQuickDemoAdmin = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      loginWithCode('ahmaddavid0906@gmail.com');
      setIsLoading(false);
    }, 350);
  };

  const handleQuickDemoUser = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      loginWithCode('TS-PRO-2026-VIP');
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Soft Glows & Clean Radiant Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(99,102,241,0.12),rgba(248,250,252,0))] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoSecretClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black text-lg shadow-lg shadow-indigo-500/20 ring-2 ring-white transition hover:scale-105 cursor-pointer"
            style={{ backgroundColor: settings.loginBrandAccentColor || '#4f46e5' }}
            title={settings.loginHeaderBrand || 'Tools Satset'}
          >
            {settings.loginBadgeInitial || 'TS'}
          </button>
          <div>
            <div className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <span>{settings.loginHeaderBrand || 'Tools Satset'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                PRO v2.5
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Platform AI Otomasi Konten Kreator & Afiliator
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {settings.loginShowPricingLink && (
            <button
              onClick={() => setCurrentView('pricing')}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm cursor-pointer"
            >
              Beli / Perpanjang Lisensi
            </button>
          )}
        </div>
      </header>

      {/* Main Hero & Login Card */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-12 my-auto">
        {/* Left Hero Brand Panel */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-indigo-700 backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>AI Multi-Engine • Fast & Production Ready</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {settings.loginHeroTitle || 'Buat lebih banyak konten dari satu video'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {settings.loginVisualCardDesc ||
              'Generator Ide Konten, Video to Prompt, Prompt Foto Nano Samama Ultra, Ekstraktor Frame, dan Sistem Auto Follback Medsos dalam satu platform satset.'}
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">TikTok Shop & AEO</div>
                <div className="text-[11px] text-slate-500 font-medium">Analisis 5 pilar & formula hook</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Auto Follback Medsos</div>
                <div className="text-[11px] text-slate-500 font-medium">Growth tracker & AI greeter</div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-5 pt-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Enkripsi 256-Bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Garansi 99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Login Card (Bright, Crisp, Luminous Light Theme) */}
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-indigo-100/70 relative overflow-hidden ring-1 ring-slate-900/5">
            {/* Ambient Card Top Glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {settings.loginFormTitle || 'Masuk ke workspace Anda'}
                  </h2>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('code');
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      loginMode === 'code'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kode Lisensi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('email');
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      loginMode === 'email'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Email Akun
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {loginMode === 'code'
                  ? 'Gunakan kode akses lisensi terverifikasi Anda untuk langsung mulai.'
                  : 'Gunakan alamat email terdaftar atau akun Super Admin Anda.'}
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {loginMode === 'code' ? 'Kode Akses Lisensi' : 'Alamat Email Terdaftar'}
                </label>
                <div className="relative">
                  <input
                    type={loginMode === 'email' ? 'email' : 'text'}
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder={
                      loginMode === 'code'
                        ? settings.loginFormCodePlaceholder || 'Gunakan Kode Akses Anda'
                        : 'ahmaddavid0906@gmail.com'
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-4 py-3.5 font-mono text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 tracking-wider transition-all"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {loginMode === 'code' ? (
                      <Key className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Mail className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3.5 px-4 font-bold text-sm shadow-lg shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{settings.loginButtonText || 'Masuk ke aplikasi ->'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Hidden Secret Quick Demo Section (Only visible if explicitly toggled or unlocked) */}
            {showSecretDemo && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-2.5 animate-in fade-in">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Akses Cepat Pengujian:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleQuickDemoUser}
                    className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2.5 text-left transition cursor-pointer text-slate-700 group"
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px] text-indigo-700">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Member VIP</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">TS-PRO-2026-VIP</div>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoAdmin}
                    className="rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 p-2.5 text-left transition cursor-pointer text-slate-700 group"
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px] text-purple-700">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Super Admin</span>
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono mt-0.5 truncate">ahmaddavid0906@gmail.com</div>
                  </button>
                </div>
              </div>
            )}

            {/* Link to Buy */}
            {settings.loginShowPricingLink && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView('pricing')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer transition"
                >
                  Belum punya kode akses? Dapatkan lisensi disini →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>{settings.userCopyrightText || '© 2026 Tools Satset AI • Multi-Engine Content Suite'}</p>
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span>Enkripsi SSL 256-Bit</span>
          <span>•</span>
          <span>Gemini High-Speed Engine</span>
          <span>•</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Normal
          </span>
        </div>
      </footer>
    </div>
  );
};
