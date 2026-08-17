'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Palette,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Lock,
  Key,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CustomUiLoginTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings, resetSettingsToDefault } = useApp();

  // Local state initialized from settings
  const [headerBrand, setHeaderBrand] = useState(settings.loginHeaderBrand || 'Satset AI');
  const [badgeInitial, setBadgeInitial] = useState(settings.loginBadgeInitial || 'S');
  const [brandAccentColor, setBrandAccentColor] = useState(settings.loginBrandAccentColor || '#4f46e5');
  const [helpButtonText, setHelpButtonText] = useState(settings.loginHelpButtonText || 'Butuh Bantuan? CS Aktif 24 Jam');
  const [heroTitle, setHeroTitle] = useState(settings.loginHeroTitle || 'AI Multi-Agent Terkuat untuk Kreator Video Viral & Affiliate');
  const [visualCardTitle, setVisualCardTitle] = useState(settings.loginVisualCardTitle || 'Auto-Optimized Script & Visual Framing');
  const [visualCardDesc, setVisualCardDesc] = useState(settings.loginVisualCardDesc || 'Algoritma adaptif yang mengubah ide sederhana menjadi naskah video berkonversi tinggi dan prompt visual sinematik.');
  const [cardGradientFrom, setCardGradientFrom] = useState(settings.loginCardGradientFrom || '#4338ca');
  const [cardGradientTo, setCardGradientTo] = useState(settings.loginCardGradientTo || '#6366f1');
  const [formTitle, setFormTitle] = useState(settings.loginFormTitle || 'Akses Workspace');
  const [formSubtitle, setFormSubtitle] = useState(settings.loginFormSubtitle || 'Masukkan Kode Akses Eksklusif Anda untuk melanjutkan');
  const [formCodePlaceholder, setFormCodePlaceholder] = useState(settings.loginFormCodePlaceholder || 'Contoh: SAT-VIP-XXXX');
  const [buttonText, setButtonText] = useState(settings.loginButtonText || 'Masuk ke Workspace');
  const [showPricingLink, setShowPricingLink] = useState(settings.loginShowPricingLink ?? true);
  const [showWhatsAppBtn, setShowWhatsAppBtn] = useState(settings.loginShowWhatsAppBtn ?? true);
  const [showQuickAccess, setShowQuickAccess] = useState(settings.loginShowQuickAccess ?? false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(settings.loginThemeMode || 'light');
  const [pills, setPills] = useState<string[]>(settings.loginBentoPills || [
    'TikTok Shop Affiliate',
    'Video to Prompt AI',
    'Ekstraktor Frame Ultra',
    'AEO Hook Generator'
  ]);
  const [newPillText, setNewPillText] = useState('');

  const colorPresets = ['#4f46e5', '#7c3aed', '#059669', '#2563eb', '#dc2626', '#d97706', '#0f172a'];

  const handleAddPill = () => {
    if (!newPillText.trim()) return;
    if (pills.includes(newPillText.trim())) return;
    setPills([...pills, newPillText.trim()]);
    setNewPillText('');
  };

  const handleRemovePill = (index: number) => {
    setPills(pills.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateSettings({
      loginHeaderBrand: headerBrand,
      loginBadgeInitial: badgeInitial,
      loginBrandAccentColor: brandAccentColor,
      loginHelpButtonText: helpButtonText,
      loginHeroTitle: heroTitle,
      loginVisualCardTitle: visualCardTitle,
      loginVisualCardDesc: visualCardDesc,
      loginCardGradientFrom: cardGradientFrom,
      loginCardGradientTo: cardGradientTo,
      loginFormTitle: formTitle,
      loginFormSubtitle: formSubtitle,
      loginFormCodePlaceholder: formCodePlaceholder,
      loginButtonText: buttonText,
      loginShowPricingLink: showPricingLink,
      loginShowWhatsAppBtn: showWhatsAppBtn,
      loginShowQuickAccess: showQuickAccess,
      loginThemeMode: themeMode,
      loginBentoPills: pills
    });
    showToast('Pengaturan UI Login Form berhasil disimpan!');
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua teks dan desain UI Login ke default bawaan?')) {
      resetSettingsToDefault();
      showToast('UI Login dikembalikan ke setelan default!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Custom UI Login Form (White-Label)</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kustomisasi total tampilan halaman autentikasi publik: ubah teks hero, judul brand, kartu visual gradasi, dan tombol bantuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset ke Default</span>
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Perubahan UI</span>
          </button>
        </div>
      </div>

      {/* 2 Columns: Form Editor vs Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand & Identity */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Identitas Brand & Header</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Brand (Header)</label>
                <input
                  type="text"
                  value={headerBrand}
                  onChange={(e) => setHeaderBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Logo Badge Initial (1 Karakter)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={badgeInitial}
                  onChange={(e) => setBadgeInitial(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold font-mono text-center focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700">Warna Aksen Brand</label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandAccentColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                      brandAccentColor === c ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={brandAccentColor}
                  onChange={(e) => setBrandAccentColor(e.target.value)}
                  className="h-7 w-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <span className="font-mono text-slate-600 text-xs">{brandAccentColor}</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Config */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Kartu Visual & Tagline Hero</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Headline Hero Utama</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Kartu Gradasi</label>
                <input
                  type="text"
                  value={visualCardTitle}
                  onChange={(e) => setVisualCardTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Naskah Kartu</label>
                <textarea
                  value={visualCardDesc}
                  onChange={(e) => setVisualCardDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Gradasi Mulai (From)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardGradientFrom}
                      onChange={(e) => setCardGradientFrom(e.target.value)}
                      className="h-8 w-9 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 text-xs">{cardGradientFrom}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Gradasi Akhir (To)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardGradientTo}
                      onChange={(e) => setCardGradientTo(e.target.value)}
                      className="h-8 w-9 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 text-xs">{cardGradientTo}</span>
                  </div>
                </div>
              </div>

              {/* Bento Pills List */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-700">Fitur Bento Pills</label>
                <div className="flex flex-wrap gap-1.5">
                  {pills.map((pill, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200"
                    >
                      <span>{pill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePill(pIdx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newPillText}
                    onChange={(e) => setNewPillText(e.target.value)}
                    placeholder="Tambah pill baru..."
                    className="flex-1 rounded-xl border border-slate-300 p-2 font-medium focus:border-indigo-600 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPill}
                    className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-bold hover:bg-slate-800"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Box Config */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" />
              <span>Form Box & Tombol Masuk</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Judul Form</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Placeholder Input Kode</label>
                  <input
                    type="text"
                    value={formCodePlaceholder}
                    onChange={(e) => setFormCodePlaceholder(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Teks Tombol Masuk</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPricingLink}
                    onChange={(e) => setShowPricingLink(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Tampilkan Link "Beli Lisensi Baru"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showWhatsAppBtn}
                    onChange={(e) => setShowWhatsAppBtn(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Tampilkan Tombol CS WhatsApp</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showQuickAccess}
                    onChange={(e) => setShowQuickAccess(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Tampilkan Tombol Akses Cepat Demo (Sembunyikan untuk Publik)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Eye className="h-4 w-4 text-indigo-600" />
              <span>Live Interactive Simulator</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Real-time Preview
            </span>
          </div>

          <div className="rounded-3xl border-2 border-slate-300 bg-slate-950 p-4 shadow-xl text-white space-y-4">
            {/* Header Simulator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-sm"
                  style={{ backgroundColor: brandAccentColor }}
                >
                  {badgeInitial}
                </div>
                <span className="font-black text-sm text-white">{headerBrand}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{helpButtonText.slice(0, 18)}...</span>
            </div>

            {/* Visual Card Simulator */}
            <div
              className="rounded-2xl p-4 shadow-md space-y-2 text-white"
              style={{
                background: `linear-gradient(135deg, ${cardGradientFrom}, ${cardGradientTo})`
              }}
            >
              <h4 className="font-black text-xs">{visualCardTitle}</h4>
              <p className="text-[10px] text-white/90 leading-relaxed font-medium">
                {visualCardDesc}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {pills.slice(0, 3).map((p, i) => (
                  <span key={i} className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Form Simulator */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
              <div>
                <h4 className="font-black text-xs text-white">{formTitle}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{formSubtitle}</p>
              </div>

              <div className="space-y-1">
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] text-slate-400 font-mono">
                  {formCodePlaceholder}
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl py-2 text-xs font-bold text-white shadow-sm transition"
                style={{ backgroundColor: brandAccentColor }}
              >
                {buttonText}
              </button>

              {showPricingLink && (
                <div className="text-center text-[10px] text-indigo-400 font-medium">
                  Belum punya Kode Akses? Beli Lisensi Di Sini
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
