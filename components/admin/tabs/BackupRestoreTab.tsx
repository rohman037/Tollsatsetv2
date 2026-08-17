'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldAlert
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BackupRestoreTab: React.FC<Props> = ({ showToast }) => {
  const {
    exportDatabaseJson,
    importDatabaseJson,
    resetSettingsToDefault,
    users,
    transactions,
    packages,
    memorySkills,
    knowledgeRules
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satset-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('File backup database JSON berhasil diunduh!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!importJsonText.trim()) {
      showToast('Harap tempel teks JSON backup atau unggah file terlebih dahulu.', 'error');
      return;
    }

    if (confirm('Apakah Anda yakin ingin me-restore database? Data yang ada akan diperbarui dengan isi file backup ini.')) {
      setIsImporting(true);
      const success = importDatabaseJson(importJsonText);
      setIsImporting(false);

      if (success) {
        showToast('Restore database berhasil! Seluruh data user, paket, memory skill, dan setting telah dipulihkan.');
        setImportJsonText('');
      } else {
        showToast('Gagal memulihkan database. Format JSON tidak valid.', 'error');
      }
    }
  };

  const handleFactoryReset = () => {
    if (confirm('PERINGATAN: Kembalikan semua pengaturan UI, Pool Kunci, dan konfigurasi ke setelan awal default?')) {
      resetSettingsToDefault();
      showToast('Pengaturan sistem berhasil dikembalikan ke default bawaan!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Backup & Restore Database</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ekspor seluruh data sistem ke dalam file format JSON (Akun User, Transaksi, Paket, Aturan Pengetahuan, Memory Skills, dan Konfigurasi UI).
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download File Backup JSON</span>
        </button>
      </div>

      {/* Database Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-indigo-600">{users.length}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">User Sessions</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{transactions.length}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Transaksi</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-amber-600">{packages.length}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Paket Lisensi</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-purple-600">{memorySkills.length}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Memory Skills</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-sky-600">{knowledgeRules.length}</div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Knowledge Rules</div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Restore dari File Backup</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Unggah File JSON Backup:</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Atau Tempel (Paste) Raw JSON Backup di Sini:</label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"version": "1.0", "users": [...], ...}'
                rows={6}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-[11px] font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleExecuteRestore}
              disabled={isImporting || !importJsonText.trim()}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isImporting ? 'animate-spin' : ''}`} />
              <span>Eksekusi Restore Database Sekarang</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Factory Reset */}
        <div className="rounded-3xl border border-red-200 bg-red-50/40 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-black text-red-900">Danger Zone: Reset Sistem</h3>
            </div>
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              Tindakan ini akan mengembalikan semua konfigurasi kustomisasi UI Login, Pengumuman Workspace, dan Pool Kunci ke setelan awal pabrikan.
            </p>
          </div>

          <button
            onClick={handleFactoryReset}
            className="w-full rounded-xl border border-red-300 bg-white hover:bg-red-600 hover:text-white text-red-700 py-2.5 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Kembalikan ke Setelan Default Pabrik
          </button>
        </div>
      </div>
    </div>
  );
};
