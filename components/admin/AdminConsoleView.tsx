'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useApp, AdminTab } from '@/lib/app-context';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Menu,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { TabSkeletonLoader } from '@/components/ui';
import { AdminSidebar } from './AdminSidebar';

// Dynamically split all 16 Admin Tabs so they only load when the tab is clicked.
// This keeps initial memory consumption ultra-light while keeping 100% of all features intact.
const ExecutiveSummaryTab = dynamic(() => import('./tabs/ExecutiveSummaryTab').then((m) => m.ExecutiveSummaryTab), {
  loading: () => <TabSkeletonLoader title="Ringkasan Eksekutif" />,
  ssr: false,
});

const RealtimeStreamTab = dynamic(() => import('./tabs/RealtimeStreamTab').then((m) => m.RealtimeStreamTab), {
  loading: () => <TabSkeletonLoader title="Pemantau Realtime Matrix" />,
  ssr: false,
});

const MemorySkillsTab = dynamic(() => import('./tabs/MemorySkillsTab').then((m) => m.MemorySkillsTab), {
  loading: () => <TabSkeletonLoader title="Memory & Skill AI" />,
  ssr: false,
});

const KnowledgeRulesTab = dynamic(() => import('./tabs/KnowledgeRulesTab').then((m) => m.KnowledgeRulesTab), {
  loading: () => <TabSkeletonLoader title="Injeksi Pengetahuan & Guardrails" />,
  ssr: false,
});

const SafeLearningTab = dynamic(() => import('./tabs/SafeLearningTab').then((m) => m.SafeLearningTab), {
  loading: () => <TabSkeletonLoader title="Safe Learning Pattern Vault" />,
  ssr: false,
});

const AiAgentsTab = dynamic(() => import('./tabs/AiAgentsTab').then((m) => m.AiAgentsTab), {
  loading: () => <TabSkeletonLoader title="AI Agents & Persona Engine" />,
  ssr: false,
});

const ClientManagementTab = dynamic(() => import('./tabs/ClientManagementTab').then((m) => m.ClientManagementTab), {
  loading: () => <TabSkeletonLoader title="Monitoring & Lisensi Client" />,
  ssr: false,
});

const PaymentVerificationTab = dynamic(() => import('./tabs/PaymentVerificationTab').then((m) => m.PaymentVerificationTab), {
  loading: () => <TabSkeletonLoader title="Verifikasi Pembayaran & Bukti Transfer" />,
  ssr: false,
});

const PackageManagementTab = dynamic(() => import('./tabs/PackageManagementTab').then((m) => m.PackageManagementTab), {
  loading: () => <TabSkeletonLoader title="Manajemen Paket Langganan" />,
  ssr: false,
});

const SecurityLogsTab = dynamic(() => import('./tabs/SecurityLogsTab').then((m) => m.SecurityLogsTab), {
  loading: () => <TabSkeletonLoader title="Log Keamanan & Anti Brute Force" />,
  ssr: false,
});

const CustomUiLoginTab = dynamic(() => import('./tabs/CustomUiLoginTab').then((m) => m.CustomUiLoginTab), {
  loading: () => <TabSkeletonLoader title="Kustomisasi Tampilan Halaman Login" />,
  ssr: false,
});

const ControlUiUserTab = dynamic(() => import('./tabs/ControlUiUserTab').then((m) => m.ControlUiUserTab), {
  loading: () => <TabSkeletonLoader title="Kontrol Visibilitas Fitur User" />,
  ssr: false,
});

const ApiKeyPoolTab = dynamic(() => import('./tabs/ApiKeyPoolTab').then((m) => m.ApiKeyPoolTab), {
  loading: () => <TabSkeletonLoader title="Pool Rotator Gemini API Keys" />,
  ssr: false,
});

const QrisConfigTab = dynamic(() => import('./tabs/QrisConfigTab').then((m) => m.QrisConfigTab), {
  loading: () => <TabSkeletonLoader title="Pengaturan Gateway QRIS" />,
  ssr: false,
});

const WhatsAppConfigTab = dynamic(() => import('./tabs/WhatsAppConfigTab').then((m) => m.WhatsAppConfigTab), {
  loading: () => <TabSkeletonLoader title="Pengaturan Notifikasi WhatsApp Gateway" />,
  ssr: false,
});

const BackupRestoreTab = dynamic(() => import('./tabs/BackupRestoreTab').then((m) => m.BackupRestoreTab), {
  loading: () => <TabSkeletonLoader title="Backup & Restore Database" />,
  ssr: false,
});

export const AdminConsoleView: React.FC = () => {
  const { activeAdminTab, setActiveAdminTab } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const tabTitles: Record<AdminTab, { title: string; category: string }> = {
    ringkasan: { title: 'Ringkasan Eksekutif & Metrik Sistem', category: 'Dashboard & Monitor' },
    pemantau_realtime: { title: 'Pemantau Realtime Generasi AI', category: 'Dashboard & Monitor' },
    log_login: { title: 'Audit Log & Keamanan Login', category: 'Dashboard & Monitor' },
    memory_skill: { title: 'Memory Agent Skill & Prosedur', category: 'Otak & Engine AI' },
    injeksi_pengetahuan: { title: 'Injeksi Pengetahuan & Guardrails', category: 'Otak & Engine AI' },
    safe_learning: { title: 'Safe Learning Pattern Vault', category: 'Otak & Engine AI' },
    ai_agents: { title: 'AI Agents & Persona Engine', category: 'Otak & Engine AI' },
    api_keys: { title: 'Pool Rotator Gemini API Keys', category: 'Otak & Engine AI' },
    monitoring_client: { title: 'Manajemen Client & Lisensi User', category: 'Bisnis & Lisensi' },
    verifikasi_bayar: { title: 'Verifikasi Pembayaran & Bukti Transfer', category: 'Bisnis & Lisensi' },
    manajemen_paket: { title: 'Manajemen Paket Langganan', category: 'Bisnis & Lisensi' },
    pengaturan_qris: { title: 'Konfigurasi Gateway QRIS', category: 'Bisnis & Lisensi' },
    custom_ui_login: { title: 'Kustomisasi UI Halaman Login', category: 'Tampilan & Sistem' },
    control_ui_user: { title: 'Kontrol Fitur Workspace User', category: 'Tampilan & Sistem' },
    pengaturan_wa: { title: 'Konfigurasi WhatsApp Gateway', category: 'Tampilan & Sistem' },
    backup_restore: { title: 'Backup & Restore Database JSON', category: 'Tampilan & Sistem' },
  };

  const renderActiveTab = () => {
    switch (activeAdminTab) {
      case 'ringkasan':
        return <ExecutiveSummaryTab showToast={showToast} />;
      case 'pemantau_realtime':
        return <RealtimeStreamTab showToast={showToast} />;
      case 'memory_skill':
        return <MemorySkillsTab showToast={showToast} />;
      case 'injeksi_pengetahuan':
        return <KnowledgeRulesTab showToast={showToast} />;
      case 'safe_learning':
        return <SafeLearningTab showToast={showToast} />;
      case 'ai_agents':
        return <AiAgentsTab showToast={showToast} />;
      case 'monitoring_client':
        return <ClientManagementTab showToast={showToast} />;
      case 'verifikasi_bayar':
        return <PaymentVerificationTab showToast={showToast} />;
      case 'manajemen_paket':
        return <PackageManagementTab showToast={showToast} />;
      case 'log_login':
        return <SecurityLogsTab showToast={showToast} />;
      case 'custom_ui_login':
        return <CustomUiLoginTab showToast={showToast} />;
      case 'control_ui_user':
        return <ControlUiUserTab showToast={showToast} />;
      case 'api_keys':
        return <ApiKeyPoolTab showToast={showToast} />;
      case 'pengaturan_qris':
        return <QrisConfigTab showToast={showToast} />;
      case 'pengaturan_wa':
        return <WhatsAppConfigTab showToast={showToast} />;
      case 'backup_restore':
        return <BackupRestoreTab showToast={showToast} />;
      default:
        return <ExecutiveSummaryTab showToast={showToast} />;
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden relative min-h-[calc(100vh-3.5rem)]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold text-white shadow-2xl transition-all transform duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastType === 'success'
              ? 'bg-slate-900 border border-slate-800'
              : toastType === 'error'
              ? 'bg-rose-600 border border-rose-500'
              : 'bg-indigo-600 border border-indigo-500'
          }`}
        >
          {toastType === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toastType === 'error' && <AlertCircle className="h-4 w-4 text-white shrink-0" />}
          {toastType === 'info' && <Info className="h-4 w-4 text-white shrink-0" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Admin Content Body */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Mobile Bar / Breadcrumb Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 font-bold text-xs"
              >
                <Menu className="w-4 h-4" />
                <span>Menu Admin (16)</span>
              </button>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Matrix
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-slate-400 hidden sm:inline">{tabTitles[activeAdminTab]?.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="font-bold text-slate-800">{tabTitles[activeAdminTab]?.title}</span>
            </div>

            {/* Fast Dropdown Select for Mobile */}
            <div className="md:hidden">
              <select
                value={activeAdminTab}
                onChange={(e) => setActiveAdminTab(e.target.value as AdminTab)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
              >
                <option value="ringkasan">📊 Ringkasan Eksekutif</option>
                <option value="pemantau_realtime">⚡ Pemantau Realtime</option>
                <option value="log_login">🛡️ Audit Log & Keamanan</option>
                <option value="memory_skill">🧠 Memory Agent Skill</option>
                <option value="injeksi_pengetahuan">📖 Injeksi Pengetahuan</option>
                <option value="safe_learning">🎓 Safe Learning AI</option>
                <option value="ai_agents">🤖 AI Agents Pool</option>
                <option value="api_keys">🔑 Pool API Key Gemini</option>
                <option value="monitoring_client">👥 Manajemen Client</option>
                <option value="verifikasi_bayar">💳 Verifikasi Bayar</option>
                <option value="manajemen_paket">📦 Manajemen Paket</option>
                <option value="pengaturan_qris">📱 Konfigurasi QRIS</option>
                <option value="custom_ui_login">🎨 Custom UI Login</option>
                <option value="control_ui_user">🎛️ Control UI User</option>
                <option value="pengaturan_wa">💬 Konfigurasi WhatsApp</option>
                <option value="backup_restore">💾 Backup & Restore DB</option>
              </select>
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="transition-all duration-150">
            {renderActiveTab()}
          </div>
        </div>
      </main>
    </div>
  );
};
