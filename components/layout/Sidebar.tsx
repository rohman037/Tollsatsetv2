'use client';

import React from 'react';
import { useApp, ToolTab } from '@/lib/app-context';
import {
  Download,
  ShoppingBag,
  Sparkles,
  Film,
  Camera,
  Scissors,
  History,
  CreditCard,
  Settings,
  Shield,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeToolTab,
    setActiveToolTab,
    currentUser,
    setCurrentView
  } = useApp();

  const getIconForTab = (id: string) => {
    switch (id) {
      case 'tiktok_downloader':
        return <Download className="h-4 w-4" />;
      case 'tiktok_shop':
        return <ShoppingBag className="h-4 w-4" />;
      case 'ide_konten':
        return <Sparkles className="h-4 w-4" />;
      case 'video_to_prompt':
        return <Film className="h-4 w-4" />;
      case 'prompt_foto':
        return <Camera className="h-4 w-4" />;
      case 'ekstraktor_frame':
        return <Scissors className="h-4 w-4" />;
      case 'riwayat':
        return <History className="h-4 w-4" />;
      case 'pengaturan':
      case 'pengaturan_sys':
        return <Settings className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const navItems: { id: ToolTab; label: string; badge?: string }[] = [
    {
      id: 'riwayat',
      label: 'Riwayat Lokal'
    },
    {
      id: 'tiktok_downloader',
      label: 'TikTok Downloader'
    },
    {
      id: 'tiktok_shop',
      label: 'TikTok Shop Ideas'
    },
    {
      id: 'ide_konten',
      label: 'Ide Konten AI (AEO)'
    },
    {
      id: 'video_to_prompt',
      label: 'Video to Prompt'
    },
    {
      id: 'prompt_foto',
      label: 'Prompt Foto Nano'
    },
    {
      id: 'ekstraktor_frame',
      label: 'Ekstraktor Frame'
    }
  ];

  const accountItems: { id: ToolTab; label: string }[] = [
    {
      id: 'pengaturan',
      label: 'API Key & Pengaturan'
    }
  ];

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-300 md:static md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Top Header inside sidebar */}
      <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
        {/* Navigation Group: TOOLS */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tools AI Creator
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeToolTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveToolTab(item.id);
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}>
                      {getIconForTab(item.id)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group: ACCOUNT & SETTINGS */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Akun & Akses
          </div>

          <div className="space-y-1">
            {accountItems.map((item) => {
              const isActive = activeToolTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveToolTab(item.id);
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}>
                      {getIconForTab(item.id)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}

            {isSuperAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer bg-purple-50 text-purple-900 hover:bg-purple-100 mt-2 border border-purple-200"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-purple-700">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <span className="truncate">Super Admin Matrix</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-purple-500" />
              </button>
            )}
          </div>
        </div>

        {/* Active Key & Account status widget */}
        <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 space-y-2.5 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                <span>{currentUser?.planName || 'Akses VIP Aktif'}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Engine
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <div>
                <div className="font-extrabold text-slate-900 truncate max-w-[110px]">
                  {currentUser?.name || 'Kreator Workspace'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[110px]">
                  {currentUser?.email || 'Akun Terverifikasi'}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                  {isSuperAdmin ? 'Lifetime' : `Sisa ${currentUser?.daysRemaining ?? 30} hari`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
