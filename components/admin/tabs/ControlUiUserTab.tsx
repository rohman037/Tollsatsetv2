'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Sliders,
  Megaphone,
  ShieldCheck,
  Layout,
  Save,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ControlUiUserTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings } = useApp();

  const [enableAnnouncement, setEnableAnnouncement] = useState(settings.userEnableAnnouncement ?? true);
  const [announcementText, setAnnouncementText] = useState(
    settings.userAnnouncementText || '🚀 UPDATE: Gemini 3.5 Flash Search Grounding Aktif! Ekstraktor Frame & Video to Prompt makin presisi.'
  );
  const [announcementBgColor, setAnnouncementBgColor] = useState(settings.userAnnouncementBgColor || '#4f46e5');
  const [announcementTextColor, setAnnouncementTextColor] = useState(settings.userAnnouncementTextColor || '#ffffff');

  const [showAntiLimitBadge, setShowAntiLimitBadge] = useState(settings.userShowAntiLimitBadge ?? true);
  const [antiLimitText, setAntiLimitText] = useState(
    settings.userAntiLimitText || 'Server Anti-Limit Aktif • Rotasi Kunci Otomatis'
  );

  const [sidebarTools, setSidebarTools] = useState(
    settings.userSidebarTools || [
      { id: 'tiktok_shop', title: 'TikTok Shop Ideas', customLabel: 'TikTok Shop Ideas', badgeLabel: 'VIRAL', badgeColor: '#ef4444', enabled: true },
      { id: 'ide_konten', title: 'Ide Konten AI (AEO)', customLabel: 'Ide Konten AI (AEO)', badgeLabel: 'AEO', badgeColor: '#6366f1', enabled: true },
      { id: 'video_to_prompt', title: 'Video to Prompt AI', customLabel: 'Video to Prompt AI', badgeLabel: 'MULTI-SHOT', badgeColor: '#3b82f6', enabled: true },
      { id: 'prompt_foto', title: 'Prompt Foto Ultra', customLabel: 'Prompt Foto Ultra', badgeLabel: 'OPTIC', badgeColor: '#10b981', enabled: true },
      { id: 'ekstraktor_frame', title: 'Ekstraktor Frame', customLabel: 'Ekstraktor Frame', badgeLabel: 'HD', badgeColor: '#8b5cf6', enabled: true }
    ]
  );

  const handleToggleTool = (id: string) => {
    setSidebarTools(
      sidebarTools.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSave = () => {
    updateSettings({
      userEnableAnnouncement: enableAnnouncement,
      userAnnouncementText: announcementText,
      userAnnouncementBgColor: announcementBgColor,
      userAnnouncementTextColor: announcementTextColor,
      userShowAntiLimitBadge: showAntiLimitBadge,
      userAntiLimitText: antiLimitText,
      userSidebarTools: sidebarTools
    });
    showToast('Pengaturan Control UI Workspace User berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Control UI Workspace User</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur pengumuman banner berjalan di dashboard pengguna, kontrol badge anti-limit, dan aktif/nonaktifkan tool di sidebar.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Simpan Perubahan Workspace</span>
        </button>
      </div>

      {/* Running Announcement Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Running Announcement Ticker (Banner Berjalan)</h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={enableAnnouncement}
              onChange={(e) => setEnableAnnouncement(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <span>Aktifkan Banner Pengumuman</span>
          </label>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Teks Pengumuman</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Warna Background Banner</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={announcementBgColor}
                  onChange={(e) => setAnnouncementBgColor(e.target.value)}
                  className="h-8 w-9 rounded-lg border border-slate-300 cursor-pointer"
                />
                <span className="font-mono text-slate-600 text-xs">{announcementBgColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Warna Teks Banner</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={announcementTextColor}
                  onChange={(e) => setAnnouncementTextColor(e.target.value)}
                  className="h-8 w-9 rounded-lg border border-slate-300 cursor-pointer"
                />
                <span className="font-mono text-slate-600 text-xs">{announcementTextColor}</span>
              </div>
            </div>
          </div>

          {/* Banner Live Preview */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview Banner Pengguna:</span>
            <div
              className="rounded-xl px-4 py-2 text-xs font-bold shadow-xs truncate flex items-center gap-2"
              style={{ backgroundColor: announcementBgColor, color: announcementTextColor }}
            >
              <Megaphone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{announcementText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Limit Badge Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">Anti-Limit Trust Badge</h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={showAntiLimitBadge}
              onChange={(e) => setShowAntiLimitBadge(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <span>Tampilkan Badge Anti-Limit di Navbar</span>
          </label>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700">Teks Badge Anti-Limit</label>
          <input
            type="text"
            value={antiLimitText}
            onChange={(e) => setAntiLimitText(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* User Sidebar Tool Visibility */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">Visibilitas Menu Tool Pengguna</h3>
        </div>

        <div className="space-y-2">
          {sidebarTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{tool.title}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                  style={{ backgroundColor: tool.badgeColor }}
                >
                  {tool.badgeLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleTool(tool.id)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  tool.enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {tool.enabled ? 'Aktif (Ditampilkan)' : 'Disembunyikan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
