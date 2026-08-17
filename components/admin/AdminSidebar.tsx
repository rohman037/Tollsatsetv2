'use client';

import React, { useState, useMemo } from 'react';
import { useApp, AdminTab } from '@/lib/app-context';
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  BookOpen,
  Palette,
  Users,
  ShieldAlert,
  CreditCard,
  Package,
  SlidersHorizontal,
  Key,
  Bot,
  GraduationCap,
  QrCode,
  MessageSquare,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

interface MenuItem {
  id: AdminTab;
  label: string;
  category: 'Dashboard & Monitor' | 'Otak & Engine AI' | 'Bisnis & Lisensi' | 'Tampilan & Sistem';
  icon: React.ReactNode;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'success';
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen = false, setMobileOpen }) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentView,
    users,
    transactions,
    memorySkills,
    safeLearning,
    liveEvents,
    settings
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const keyCount = settings.geminiPoolKeys?.length || 4;

  const adminMenuItems = useMemo<MenuItem[]>(() => [
    // Group 1: Dashboard & Monitor
    {
      id: 'ringkasan',
      label: 'Ringkasan Eksekutif',
      category: 'Dashboard & Monitor',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      id: 'pemantau_realtime',
      label: 'Pemantau Realtime AI',
      category: 'Dashboard & Monitor',
      icon: <Activity className="h-4 w-4" />,
      badge: `${liveEvents.length}`
    },
    {
      id: 'log_login',
      label: 'Audit Log & Keamanan',
      category: 'Dashboard & Monitor',
      icon: <ShieldAlert className="h-4 w-4" />
    },

    // Group 2: Otak & Engine AI
    {
      id: 'memory_skill',
      label: 'Memory Agent Skill',
      category: 'Otak & Engine AI',
      icon: <BrainCircuit className="h-4 w-4" />,
      badge: `${memorySkills.length}`
    },
    {
      id: 'injeksi_pengetahuan',
      label: 'Injeksi Pengetahuan AI',
      category: 'Otak & Engine AI',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'safe_learning',
      label: 'Safe Learning AI',
      category: 'Otak & Engine AI',
      icon: <GraduationCap className="h-4 w-4" />,
      badge:
        safeLearning.filter((s) => s.status === 'pending').length > 0
          ? `${safeLearning.filter((s) => s.status === 'pending').length} Baru`
          : undefined,
      badgeType: 'warning'
    },
    {
      id: 'ai_agents',
      label: 'AI Agents Pool',
      category: 'Otak & Engine AI',
      icon: <Bot className="h-4 w-4" />,
      badge: '6 Aktif',
      badgeType: 'success'
    },
    {
      id: 'api_keys',
      label: 'Pool API Key Gemini',
      category: 'Otak & Engine AI',
      icon: <Key className="h-4 w-4" />,
      badge: `${keyCount} Key`
    },

    // Group 3: Bisnis & Lisensi
    {
      id: 'monitoring_client',
      label: 'Manajemen Client & User',
      category: 'Bisnis & Lisensi',
      icon: <Users className="h-4 w-4" />,
      badge: `${users.length}`
    },
    {
      id: 'verifikasi_bayar',
      label: 'Verifikasi Transaksi',
      category: 'Bisnis & Lisensi',
      icon: <CreditCard className="h-4 w-4" />,
      badge:
        transactions.filter((t) => t.status === 'pending').length > 0
          ? `${transactions.filter((t) => t.status === 'pending').length} Pending`
          : undefined,
      badgeType: 'warning'
    },
    {
      id: 'manajemen_paket',
      label: 'Paket & Lisensi',
      category: 'Bisnis & Lisensi',
      icon: <Package className="h-4 w-4" />
    },
    {
      id: 'pengaturan_qris',
      label: 'Konfigurasi QRIS',
      category: 'Bisnis & Lisensi',
      icon: <QrCode className="h-4 w-4" />
    },

    // Group 4: Tampilan & Sistem
    {
      id: 'custom_ui_login',
      label: 'Custom UI Login Form',
      category: 'Tampilan & Sistem',
      icon: <Palette className="h-4 w-4" />
    },
    {
      id: 'control_ui_user',
      label: 'Control UI Workspace User',
      category: 'Tampilan & Sistem',
      icon: <SlidersHorizontal className="h-4 w-4" />
    },
    {
      id: 'pengaturan_wa',
      label: 'Konfigurasi CS WhatsApp',
      category: 'Tampilan & Sistem',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 'backup_restore',
      label: 'Backup & Restore DB',
      category: 'Tampilan & Sistem',
      icon: <Database className="h-4 w-4" />
    }
  ], [liveEvents.length, memorySkills.length, safeLearning, keyCount, users.length, transactions]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return adminMenuItems;
    return adminMenuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery, adminMenuItems]);

  const categories = ['Dashboard & Monitor', 'Otak & Engine AI', 'Bisnis & Lisensi', 'Tampilan & Sistem'] as const;

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveAdminTab(tabId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed md:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-72 md:w-64 lg:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3">
          {/* Header Badge */}
          <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-black tracking-wider uppercase flex items-center gap-1 text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Super Admin</span>
              </div>
              <div className="text-xs font-black text-white mt-0.5">Control Matrix</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                title="Beralih ke Workspace User"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <span>User</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>

              {setMobileOpen && (
                <button
                  onClick={() => setMobileOpen(false)}
                  className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fitur admin..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-medium focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Navigation List grouped */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 select-none scrollbar-thin">
            {categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {cat}
                  </div>

                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      const isActive = activeAdminTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ml-1.5 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeType === 'warning'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : item.badgeType === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
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
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            16 Modul Admin Aktif • Gemini Engine
          </div>
        </div>
      </aside>
    </>
  );
};
