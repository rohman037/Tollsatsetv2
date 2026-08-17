'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { LogOut, Menu, ShieldCheck, Sparkles, User, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    logout,
    settings
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setCurrentView(isSuperAdmin && currentView === 'admin' ? 'dashboard' : isSuperAdmin ? 'admin' : 'dashboard')}
            className="flex items-center gap-2.5 text-left font-bold text-slate-900 transition-opacity hover:opacity-85 cursor-pointer"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm shadow-sm"
              style={{ backgroundColor: settings.userBrandAccentColor || '#4f46e5' }}
            >
              {settings.userBadgeInitial || 'TS'}
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight flex items-center gap-1.5">
                {settings.userHeaderBrand || 'Tools Satset AI'}
                {isSuperAdmin && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-md">
                    Admin
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block leading-none">
                Creator Workspace AI
              </span>
            </div>
          </button>

          {/* Anti-Limit Badge */}
          {settings.userShowAntiLimitBadge && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {settings.userAntiLimitText || 'Anti-Limit AI Engine Active'}
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick toggle for Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-800 hover:to-indigo-800"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {currentView === 'admin' ? 'Buka Workspace User' : 'Super Admin Matrix'}
              </span>
              <span className="sm:hidden">
                {currentView === 'admin' ? 'User' : 'Admin'}
              </span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}

          {/* User profile widget */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold leading-tight">
                  {currentUser.email} • {currentUser.daysRemaining} hari
                </div>
              </div>
              <button
                onClick={logout}
                title="Keluar / Ganti Akun"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
