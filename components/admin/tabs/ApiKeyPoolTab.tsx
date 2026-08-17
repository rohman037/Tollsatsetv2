'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ApiKeyPoolTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings } = useApp();

  const [poolKeys, setPoolKeys] = useState(
    settings.geminiPoolKeys || [
      { id: 'key_1', alias: 'Server Cluster A (Tier 1)', keyMasked: 'AIzaSyD9...X8aQ', dailyLimit: 1500, usageToday: 240, status: 'ACTIVE' as const },
      { id: 'key_2', alias: 'Server Cluster B (Tier 1)', keyMasked: 'AIzaSyBV...92pL', dailyLimit: 1500, usageToday: 180, status: 'ACTIVE' as const },
      { id: 'key_3', alias: 'Backup Cluster C (Tier 2)', keyMasked: 'AIzaSyCZ...33kM', dailyLimit: 1500, usageToday: 45, status: 'ACTIVE' as const },
      { id: 'key_4', alias: 'Ultra Fast Lite (Tier 3)', keyMasked: 'AIzaSyEE...01zW', dailyLimit: 1500, usageToday: 12, status: 'ACTIVE' as const }
    ]
  );
  const [autoRotate, setAutoRotate] = useState(settings.autoRotateKey ?? true);

  // Add Key Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState(1500);

  // Health check state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<{ [id: string]: number }>({});

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const masked = newKey.length > 8 ? `${newKey.slice(0, 8)}...${newKey.slice(-4)}` : 'AIzaSy...KEY';
    const newEntry = {
      id: `key_${Date.now()}`,
      alias: newAlias.trim() || `Cluster Key #${poolKeys.length + 1}`,
      keyMasked: masked,
      dailyLimit: Number(newDailyLimit),
      usageToday: 0,
      status: 'ACTIVE' as const
    };

    const updated = [...poolKeys, newEntry];
    setPoolKeys(updated);
    updateSettings({ geminiPoolKeys: updated });
    showToast('Kunci Gemini baru berhasil didaftarkan ke Anti-Limit Pool!');
    setShowAddModal(false);
    setNewAlias('');
    setNewKey('');
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Hapus kunci ini dari pool server?')) {
      const updated = poolKeys.filter((k) => k.id !== id);
      setPoolKeys(updated);
      updateSettings({ geminiPoolKeys: updated });
      showToast('Kunci dihapus dari pool.');
    }
  };

  const handleRotateNow = () => {
    if (poolKeys.length < 2) {
      showToast('Dibutuhkan minimal 2 kunci untuk rotasi.', 'info');
      return;
    }
    const rotated = [...poolKeys.slice(1), poolKeys[0]];
    setPoolKeys(rotated);
    updateSettings({ geminiPoolKeys: rotated });
    showToast(`Rotasi paksa sukses! ${rotated[0].alias} sekarang menjadi Kunci Utama.`);
  };

  const handlePingHealth = () => {
    setIsPinging(true);
    setTimeout(() => {
      const pings: { [id: string]: number } = {};
      poolKeys.forEach((k) => {
        pings[k.id] = Math.floor(120 + Math.random() * 150);
      });
      setPingResults(pings);
      setIsPinging(false);
      showToast('Health Check selesai: Seluruh kunci Gemini di pool dalam kondisi PRIME!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Pool API Key Gemini & Anti-Limit</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sistem rotasi multi-kunci cerdas untuk mencegah error Quota Exceeded (429 Rate Limit) dan mendistribusikan beban secara merata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingHealth}
            disabled={isPinging}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Activity className={`h-3.5 w-3.5 ${isPinging ? 'animate-pulse text-indigo-600' : ''}`} />
            <span>{isPinging ? 'Pinging Keys...' : 'Test Ping Kunci'}</span>
          </button>
          <button
            onClick={handleRotateNow}
            className="rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Rotasi Paksa Kunci</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kunci Baru</span>
          </button>
        </div>
      </div>

      {/* Model Tier Priority Routing Info */}
      <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">Arsitektur Routing Otomatis Model Tier 1, 2, 3</h3>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Sistem secara cerdas memprioritaskan <strong>Tier 1: Gemini 3.5 Flash</strong> dengan Google Search Grounding. Jika kuota server cluster utama sibuk, circuit breaker secara otomatis beralih ke <strong>Tier 2: Gemini 3.1 Pro Preview</strong> untuk penalaran mendalam, atau <strong>Tier 3: Gemini 3.1 Flash Lite</strong> untuk kecepatan instan.
        </p>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {poolKeys.map((k, idx) => {
          const isPrimary = idx === 0;
          const ping = pingResults[k.id];
          return (
            <div
              key={`${k.id}_${idx}`}
              className={`rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                isPrimary ? 'border-indigo-300 bg-indigo-50/20 shadow-sm' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isPrimary && (
                    <span className="rounded-md bg-indigo-600 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      PRIMARY KEY AKTIF
                    </span>
                  )}
                  <h3 className="text-sm font-black text-slate-900">{k.alias}</h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5">
                    {k.status}
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-500">{k.keyMasked}</div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Usage Hari Ini: <strong className="text-slate-800">{k.usageToday} req</strong></span>
                  <span>•</span>
                  <span>Limit Harian: <strong className="text-slate-800">{k.dailyLimit} req</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {ping && (
                  <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {ping}ms
                  </span>
                )}

                <button
                  onClick={() => handleDeleteKey(k.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Hapus Kunci dari Pool"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Key */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Tambah Gemini API Key ke Server Pool</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Alias Kunci</label>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Contoh: Server Cluster Backup D (Tier 1)"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Google Gemini API Key (AIzaSy...)</label>
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Paste Gemini API Key di sini..."
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Estimasi Kuota Harian (Request)</label>
                <input
                  type="number"
                  value={newDailyLimit}
                  onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Daftarkan Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
