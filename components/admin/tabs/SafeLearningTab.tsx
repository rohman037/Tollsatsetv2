'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  GraduationCap,
  Sparkles,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { SafeLearningPattern } from '@/types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SafeLearningTab: React.FC<Props> = ({ showToast }) => {
  const {
    safeLearning,
    approveSafeLearning,
    rejectSafeLearning,
    runAutoTraining,
    addSafeLearningPattern
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Umum' | 'Fashion/Beauty' | 'Herbal & Kesehatan' | 'Rumah Tangga' | 'Teknologi'>('Umum');
  const [sourceQuery, setSourceQuery] = useState('');
  const [extractedPattern, setExtractedPattern] = useState('');
  const [isHighRiskMedical, setIsHighRiskMedical] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(94);

  const handleAutoTrain = () => {
    const res = runAutoTraining();
    showToast(`1-Click Auto Training selesai! ${res.approved} pola disetujui, ${res.held} pola butuh manual review.`);
  };

  const handleAddManualPattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !extractedPattern.trim()) return;

    addSafeLearningPattern({
      title: title.trim(),
      category,
      sourceQuery: sourceQuery.trim() || 'Manual Input by Admin',
      extractedPattern: extractedPattern.trim(),
      confidenceScore,
      isHighRiskMedical,
      status: 'pending'
    });

    showToast('Kandidat pola safe learning baru berhasil ditambahkan ke antrean!');
    setShowAddModal(false);
    setTitle('');
    setSourceQuery('');
    setExtractedPattern('');
    setIsHighRiskMedical(false);
  };

  const filteredPatterns = safeLearning.filter((pat) => {
    if (statusFilter === 'all') return true;
    return pat.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Safe Learning AI Queue</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Antrean kurasi pola konten viral yang diekstrak dari query nyata. Lindungi sistem dari klaim berbahaya dan perkuat daya saing script video.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pola Manual</span>
          </button>
          <button
            onClick={handleAutoTrain}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Proses 1-Click Auto Training</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'all' && `Semua Antrean (${safeLearning.length})`}
            {st === 'pending' && `Menunggu Review (${safeLearning.filter((s) => s.status === 'pending').length})`}
            {st === 'approved' && `Disetujui (${safeLearning.filter((s) => s.status === 'approved').length})`}
            {st === 'rejected' && `Ditolak (${safeLearning.filter((s) => s.status === 'rejected').length})`}
          </button>
        ))}
      </div>

      {/* Patterns Cards */}
      <div className="space-y-3">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
            Tidak ada pola dalam status ini.
          </div>
        ) : (
          filteredPatterns.map((pat, idx) => (
            <div
              key={`${pat.id}_${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                      {pat.category}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">{pat.title}</h3>
                    {pat.isHighRiskMedical && (
                      <span className="rounded-md bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Klaim Medis / Perlu Review
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">Query Asal: "{pat.sourceQuery}"</div>
                </div>

                <div className="flex items-center gap-2">
                  {pat.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          approveSafeLearning(pat.id);
                          showToast(`Pola "${pat.title}" disetujui & otomatis disuntikkan ke knowledge rules.`);
                        }}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
                      >
                        Approve & Injeksi
                      </button>
                      <button
                        onClick={() => {
                          rejectSafeLearning(pat.id);
                          showToast(`Pola "${pat.title}" ditolak.`);
                        }}
                        className="rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
                      >
                        Tolak
                      </button>
                    </>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                        pat.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {pat.status}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {pat.extractedPattern}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Confidence Score: {pat.confidenceScore}%</span>
                <span>Tanggal Terdeteksi: {pat.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Manual Pattern */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Tambah Pola Safe Learning</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualPattern} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Pola</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Format Review 3-Point Skincare Tanpa Overclaim"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Fashion/Beauty">Fashion/Beauty</option>
                    <option value="Herbal & Kesehatan">Herbal & Kesehatan</option>
                    <option value="Rumah Tangga">Rumah Tangga</option>
                    <option value="Teknologi">Teknologi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Query Asal</label>
                  <input
                    type="text"
                    value={sourceQuery}
                    onChange={(e) => setSourceQuery(e.target.value)}
                    placeholder="Contoh: Emina Water Gel vs Cica"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Uraian Pola yang Diekstrak</label>
                <textarea
                  value={extractedPattern}
                  onChange={(e) => setExtractedPattern(e.target.value)}
                  placeholder="Jelaskan formula storytelling dan hook yang ditemukan..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="medRisk"
                  checked={isHighRiskMedical}
                  onChange={(e) => setIsHighRiskMedical(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-indigo-600"
                />
                <label htmlFor="medRisk" className="font-bold text-slate-700 cursor-pointer">
                  Tandai sebagai kategori Medis / Sensitif (Memerlukan review ketat)
                </label>
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
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700"
                >
                  Simpan ke Antrean
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
