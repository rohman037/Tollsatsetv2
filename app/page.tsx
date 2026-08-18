'use client';

import React from 'react';
import { AppProvider, useApp } from '@/lib/app-context';
import { Navbar, UserLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/ui';

// Direct robust component imports to eliminate dynamic chunk loading failures
import { LoginView } from '@/components/auth/LoginView';
import { PricingCheckoutView } from '@/components/billing/PricingCheckoutView';
import { AdminConsoleView } from '@/components/admin/AdminConsoleView';
import { TikTokDownloaderView } from '@/components/user/tools/TikTokDownloaderView';
import { TikTokShopIdeasView } from '@/components/user/tools/TikTokShopIdeasView';
import { ContentIdeasView } from '@/components/user/tools/ContentIdeasView';
import { VideoToPromptView } from '@/components/user/tools/VideoToPromptView';
import { PhotoPromptView } from '@/components/user/tools/PhotoPromptView';
import { FrameExtractorView } from '@/components/user/tools/FrameExtractorView';
import { HistoryView } from '@/components/user/history/HistoryView';
import { ApiKeySettingsView } from '@/components/user/settings/ApiKeySettingsView';

const MainAppWorkspace: React.FC = () => {
  const { currentView, activeToolTab } = useApp();

  // 1. Auth View (Login / Access Code verification)
  if (currentView === 'login') {
    return (
      <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Login">
        <LoginView />
      </ErrorBoundary>
    );
  }

  // 2. Billing & Pricing Checkout View
  if (currentView === 'pricing' || currentView === 'checkout') {
    return (
      <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Pembayaran">
        <PricingCheckoutView />
      </ErrorBoundary>
    );
  }

  // 3. Super Admin Matrix Console View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <ErrorBoundary fallbackTitle="Kendala Memuat Super Admin Console">
          <AdminConsoleView />
        </ErrorBoundary>
      </div>
    );
  }

  // 4. User Tools Dispatcher
  const renderActiveTool = () => {
    switch (activeToolTab) {
      case 'tiktok_downloader':
        return <TikTokDownloaderView />;
      case 'tiktok_shop':
        return <TikTokShopIdeasView />;
      case 'ide_konten':
        return <ContentIdeasView />;
      case 'video_to_prompt':
        return <VideoToPromptView />;
      case 'prompt_foto':
        return <PhotoPromptView />;
      case 'ekstraktor_frame':
        return <FrameExtractorView />;
      case 'riwayat':
        return <HistoryView />;
      case 'pengaturan':
      default:
        return <ApiKeySettingsView />;
    }
  };

  return (
    <UserLayout>
      <ErrorBoundary fallbackTitle={`Kendala Memuat Tab ${activeToolTab}`}>
        {renderActiveTool()}
      </ErrorBoundary>
    </UserLayout>
  );
};

export default function Page() {
  return (
    <ErrorBoundary fallbackTitle="Kendala Inisialisasi Aplikasi">
      <AppProvider>
        <MainAppWorkspace />
      </AppProvider>
    </ErrorBoundary>
  );
}
