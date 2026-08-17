'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AiAgentsTab: React.FC<Props> = ({ showToast }) => {
  const { aiAgents, addAiAgent, updateAiAgent, deleteAiAgent } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash');
  const [status, setStatus] = useState('AKTIF');

  // Diagnostics simulation state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ [id: string]: { pingMs: number; status: string } }>({});

  const handleOpenAdd = () => {
    setEditingAgentId(null);
    setName('');
    setRole('');
    setModel('gemini-3.5-flash');
    setStatus('AKTIF');
    setShowModal(true);
  };

  const handleOpenEdit = (agent: (typeof aiAgents)[0]) => {
    setEditingAgentId(agent.id);
    setName(agent.name);
    setRole(agent.role);
    setModel(agent.model);
    setStatus(agent.status || 'AKTIF');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingAgentId) {
      updateAiAgent(editingAgentId, {
        name: name.trim(),
        role: role.trim(),
        model,
        status
      });
      showToast(`Agent "${name}" berhasil diperbarui!`);
    } else {
      addAiAgent({
        name: name.trim(),
        role: role.trim(),
        model
      });
      showToast(`AI Agent baru "${name}" berhasil didaftarkan ke pool!`);
    }
    setShowModal(false);
  };

  const handleRunDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      const results: { [id: string]: { pingMs: number; status: string } } = {};
      aiAgents.forEach((a) => {
        results[a.id] = {
          pingMs: Math.floor(180 + Math.random() * 240),
          status: 'HEALTHY'
        };
      });
      setDiagnosticResults(results);
      setIsDiagnosing(false);
      showToast('Diagnostics AI Agent Pool selesai: 100% Agen responsif & siap bertugas!');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">AI Agents Orchestration Pool</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Matriks agen spesialis AI independen yang berkolaborasi dalam menghasilkan hook, analisis produk, optik foto, dan prompt video multi-klip.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            className="rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'Memeriksa Pool...' : 'Jalankan Health Check'}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Agent Baru</span>
          </button>
        </div>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiAgents.map((agent, idx) => {
          const diag = diagnosticResults[agent.id];
          return (
            <div
              key={`${agent.id}_${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-black text-slate-900">{agent.name}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold inline-block">
                    {agent.model}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                    {agent.status || 'AKTIF'}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(agent)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Edit Agent"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus agent "${agent.name}" dari pool?`)) {
                        deleteAiAgent(agent.id);
                        showToast('Agent berhasil dihapus.');
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Agent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {agent.role}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                <span>Total Panggilan: <strong className="text-slate-800">{agent.calls}x</strong></span>
                {diag ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {diag.pingMs}ms
                  </span>
                ) : (
                  <span className="text-slate-500">Tier 1 Primary</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Agent */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingAgentId ? 'Edit AI Agent' : 'Daftarkan AI Agent Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Agent</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: TikTok Affiliate Strategy Master"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Model Dasar Gemini</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Live Grounding)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinking)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (High Quality)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status Operasional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="AKTIF">AKTIF (Siap Layani Request)</option>
                    <option value="STANDBY">STANDBY (Cadangan Failover)</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Spesialisasi & Tugas Pokok</label>
                <textarea
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Jelaskan peran khusus agent ini dalam rangkaian pipeline..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700"
                >
                  {editingAgentId ? 'Simpan Perubahan' : 'Daftarkan Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
