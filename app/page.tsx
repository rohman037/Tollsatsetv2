'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppProvider, useApp } from '@/lib/app-context';
import { Navbar, UserLayout } from '@/components/layout';
import { TabSkeletonLoader } from '@/components/ui';

// High-speed Dynamic Code Splitting for Featherlight & Collision-Free Multitask UI
const LoginView = dynamic(
  () => import('@/components/auth/LoginView').then((m) => m.LoginView),
  {
    loading: () => <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Memuat Portal Akses...</div>,
    ssr: false,
  }
);

const PricingCheckoutView = dynamic(
  () => import('@/components/billing/PricingCheckoutView').then((m) => m.PricingCheckoutView),
  {
    loading: () => <TabSkeletonLoader title="Katalog Paket Akses" />,
    ssr: false,
  }
);

const AdminConsoleView = dynamic(
  () => import('@/components/admin/AdminConsoleView').then((m) => m.AdminConsoleView),
  {
    loading: () => <TabSkeletonLoader title="Super Admin Matrix Console" />,
    ssr: false,
  }
);

const TikTokDownloaderView = dynamic(
  () => import('@/components/user/tools/TikTokDownloaderView').then((m) => m.TikTokDownloaderView),
  {
    loading: () => <TabSkeletonLoader title="TikTok Downloader HD" />,
    ssr: false,
  }
);

const TikTokShopIdeasView = dynamic(
  () => import('@/components/user/tools/TikTokShopIdeasView').then((m) => m.TikTokShopIdeasView),
  {
    loading: () => <TabSkeletonLoader title="Riset Produk & Ide Konten TikTok Shop" />,
    ssr: false,
  }
);

const ContentIdeasView = dynamic(
  () => import('@/components/user/tools/ContentIdeasView').then((m) => m.ContentIdeasView),
  {
    loading: () => <TabSkeletonLoader title="Generator Ide Konten Viral" />,
    ssr: false,
  }
);

const VideoToPromptView = dynamic(
  () => import('@/components/user/tools/VideoToPromptView').then((m) => m.VideoToPromptView),
  {
    loading: () => <TabSkeletonLoader title="Video to AI Video Prompt Splitter" />,
    ssr: false,
  }
);

const PhotoPromptView = dynamic(
  () => import('@/components/user/tools/PhotoPromptView').then((m) => m.PhotoPromptView),
  {
    loading: () => <TabSkeletonLoader title="Prompt Foto Ultra-Realistis" />,
    ssr: false,
  }
);

const FrameExtractorView = dynamic(
  () => import('@/components/user/tools/FrameExtractorView').then((m) => m.FrameExtractorView),
  {
    loading: () => <TabSkeletonLoader title="Ekstraktor Frame Video HD" />,
    ssr: false,
  }
);

const AutoFollbackView = dynamic(
  () => import('@/components/user/tools/AutoFollbackView').then((m) => m.AutoFollbackView),
  {
    loading: () => <TabSkeletonLoader title="Auto Follback Medsos & Growth Engine" />,
    ssr: false,
  }
);

const HistoryView = dynamic(
  () => import('@/components/user/history/HistoryView').then((m) => m.HistoryView),
  {
    loading: () => <TabSkeletonLoader title="Riwayat Hasil Generate" />,
    ssr: false,
  }
);

const ApiKeySettingsView = dynamic(
  () => import('@/components/user/settings/ApiKeySettingsView').then((m) => m.ApiKeySettingsView),
  {
    loading: () => <TabSkeletonLoader title="Pengaturan API Key & Akun" />,
    ssr: false,
  }
);

const MainAppWorkspace: React.FC = () => {
  const { currentView, activeToolTab } = useApp();

  // 1. Auth View (Login / Access Code verification)
  if (currentView === 'login') {
    return <LoginView />;
  }

  // 2. Billing & Pricing Checkout View
  if (currentView === 'pricing' || currentView === 'checkout') {
    return <PricingCheckoutView />;
  }

  // 3. Super Admin Matrix Console View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <AdminConsoleView />
      </div>
    );
  }

  // 4. User Tools Dispatcher
  const renderActiveTool = () => {
    switch (activeToolTab) {
      case 'auto_follback':
        return <AutoFollbackView />;
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
      case 'paket_akses':
        return <PricingCheckoutView />;
      case 'pengaturan':
      default:
        return <ApiKeySettingsView />;
    }
  };

  return <UserLayout>{renderActiveTool()}</UserLayout>;
};

export default function Page() {
  return (
    <AppProvider>
      <MainAppWorkspace />
    </AppProvider>
  );
}
