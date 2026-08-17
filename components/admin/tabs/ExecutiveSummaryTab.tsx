'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Users,
  CreditCard,
  Sparkles,
  Download,
  Activity,
  BrainCircuit,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExecutiveSummaryTab: React.FC<Props> = ({ showToast }) => {
  const {
    users,
    transactions,
    memorySkills,
    safeLearning,
    liveEvents,
    knowledgeRules,
    approveTransaction,
    runAutoTraining,
    exportDatabaseJson,
    setActiveAdminTab
  } = useApp();

  const handleAutoTrain = () => {
    const res = runAutoTraining();
    showToast(`Auto-Training selesai: ${res.approved} disetujui & disuntikkan, ${res.held} ditahan review.`);
  };

  const handleBackupExport = () => {
    const data = exportDatabaseJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satset-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Database JSON berhasil diexport!');
  };

  const activeUsersCount = users.filter((u) => u.status === 'aktif').length;
  const pendingTrxCount = transactions.filter((t) => t.status === 'pending').length;
  const totalGen = users.reduce((acc, u) => acc + (u.totalGenerations || 0), 0) + 148;
  const pendingSafeCount = safeLearning.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-black text-slate-900">Ringkasan Eksekutif Super Admin</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pantau status workspace, trafik generasi AI real-time, aktivasi transaksi pelanggan, dan kesehatan memori sistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoTrain}
            className="rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 px-3.5 py-2 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>1-Click Auto-Train AI</span>
          </button>
          <button
            onClick={handleBackupExport}
            className="rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup DB</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total User Aktif</div>
          <div className="text-3xl font-black text-slate-900">{activeUsersCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>●</span>
            <span>{users.length} akun terdaftar di sistem</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Transaksi Pending</div>
          <div className="text-3xl font-black text-amber-600">{pendingTrxCount}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            {pendingTrxCount > 0 ? 'Menunggu verifikasi admin' : 'Semua transaksi selesai'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Generasi AI</div>
          <div className="text-3xl font-black text-indigo-600">{totalGen}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Rata-rata 1.2 detik per respon
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Memory Agent Skills</div>
          <div className="text-3xl font-black text-emerald-600">{memorySkills.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {knowledgeRules.length} knowledge rules aktif
          </div>
        </div>
      </div>

      {/* 2 Column Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Generation Feed */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">Live AI Generation Feed</h3>
            </div>
            <button
              onClick={() => setActiveAdminTab('pemantau_realtime')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Semua Log ({liveEvents.length})</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {liveEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs space-y-1 hover:bg-indigo-50/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{evt.userName}</span>
                  <span className="font-mono text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-100 text-indigo-800 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    {evt.aiTool}
                  </span>
                  <span className="text-slate-600 truncate font-medium">{evt.promptSnippet}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>{evt.modelUsed}</span>
                  <span className="text-emerald-600 font-bold">{evt.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Order Quick Actions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Permintaan Aktivasi Lisensi Terkini</h3>
            <button
              onClick={() => setActiveAdminTab('verifikasi_bayar')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Kelola Transaksi</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada transaksi.</div>
          ) : (
            <div className="space-y-2.5">
              {transactions.slice(0, 4).map((trx) => (
                <div
                  key={trx.id}
                  className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{trx.customerName}</div>
                    <div className="text-[11px] text-slate-500">
                      {trx.planName} • Rp {trx.total.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{trx.id}</div>
                  </div>

                  <div>
                    {trx.status === 'pending' ? (
                      <button
                        onClick={() => {
                          const u = approveTransaction(trx.id);
                          showToast(`Transaksi disetujui! Kode: ${u.accessCode}`);
                        }}
                        className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-bold hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          trx.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {trx.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
