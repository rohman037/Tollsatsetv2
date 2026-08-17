'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { settings, activeToolTab } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
          />
        )}

        {/* Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Tool View Content Body */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {/* Welcome alert if enabled by admin */}
          {settings.userShowWelcomeCard && activeToolTab === 'tiktok_downloader' && (
            <div className="max-w-5xl mx-auto mb-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Multi-Engine Workspace
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {settings.userWelcomeTitle}
                </h2>
                <p className="text-xs text-indigo-200/90 font-medium max-w-2xl leading-relaxed">
                  {settings.userWelcomeDesc}
                </p>
              </div>
            </div>
          )}

          {children}

          {/* Footer */}
          <footer className="mt-12 text-center text-[11px] text-slate-400 font-medium pt-6 border-t border-slate-200/60 max-w-5xl mx-auto">
            {settings.userCopyrightText}
          </footer>
        </main>
      </div>
    </div>
  );
};
