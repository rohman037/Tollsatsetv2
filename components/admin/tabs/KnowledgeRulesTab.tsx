'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  BookOpen,
  Plus,
  Trash2,
  XCircle,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import { SystemKnowledgeRule } from '@/types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const KnowledgeRulesTab: React.FC<Props> = ({ showToast }) => {
  const { knowledgeRules, addKnowledgeRule, deleteKnowledgeRule } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'HOOK' | 'LIGHTING' | 'ALGORITHM' | 'COPYWRITING' | 'SAFETY'>('HOOK');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('RULE SET');
  const [confidence, setConfidence] = useState(95);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addKnowledgeRule({
      title: title.trim(),
      category,
      content: content.trim(),
      tag: tag.trim().toUpperCase(),
      source: 'MANUAL',
      confidence
    });

    showToast('Aturan Pengetahuan baru berhasil disuntikkan ke AI!');
    setShowAddModal(false);
    setTitle('');
    setContent('');
    setTag('RULE SET');
  };

  const filteredRules = knowledgeRules.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Injeksi Pengetahuan AI (Knowledge Rules)</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Basis aturan fundamental yang mengatur formulasi prompt, logika AEO, pencahayaan optik, dan kepatuhan video AI.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Suntikkan Aturan Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari aturan pengetahuan atau tag..."
            className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option value="HOOK">HOOK</option>
          <option value="LIGHTING">LIGHTING</option>
          <option value="ALGORITHM">ALGORITHM</option>
          <option value="COPYWRITING">COPYWRITING</option>
          <option value="SAFETY">SAFETY</option>
        </select>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
            Tidak ada aturan pengetahuan yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          filteredRules.map((rule, idx) => (
            <div
              key={`${rule.id}_${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:shadow-md transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                    {rule.category}
                  </span>
                  <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                    {rule.source}
                  </span>
                  <h3 className="text-sm font-black text-slate-900">{rule.title}</h3>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {rule.content}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span>Tag: #{rule.tag}</span>
                  <span>•</span>
                  <span>Confidence: {rule.confidence}%</span>
                  <span>•</span>
                  <span>Tanggal: {rule.createdAt}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Hapus aturan "${rule.title}"?`)) {
                    deleteKnowledgeRule(rule.id);
                    showToast('Aturan berhasil dihapus.');
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer self-start"
                title="Hapus Aturan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Rule */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Suntikkan Aturan Pengetahuan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Aturan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Rasio Hook 3 Detik dengan Dialog Bertempo Cepat"
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
                    <option value="HOOK">HOOK</option>
                    <option value="LIGHTING">LIGHTING</option>
                    <option value="ALGORITHM">ALGORITHM</option>
                    <option value="COPYWRITING">COPYWRITING</option>
                    <option value="SAFETY">SAFETY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tag / Label</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="TIKTOK VIRAL"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Isi Pengetahuan / Panduan Aturan</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Uraikan format atau panduan spesifik yang harus ditaati AI..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Confidence: {confidence}%</label>
                <input
                  type="range"
                  min={60}
                  max={100}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full cursor-pointer accent-indigo-600"
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
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700"
                >
                  Suntikkan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
