'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  BrainCircuit,
  Plus,
  Trash2,
  Edit2,
  XCircle,
  Sparkles,
  CheckCircle2,
  Sliders,
  Filter
} from 'lucide-react';
import { MemoryAgentSkill } from '@/types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const MemorySkillsTab: React.FC<Props> = ({ showToast }) => {
  const { memorySkills, addMemorySkill, updateMemorySkill, deleteMemorySkill } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<MemoryAgentSkill | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Content Ideas' | 'Video AI' | 'Photo Prompt' | 'Guardrail' | 'Splitter'>('Content Ideas');
  const [description, setDescription] = useState('');
  const [injectionSnippet, setInjectionSnippet] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(95);
  const [status, setStatus] = useState<'CONNECTED' | 'LEARNING' | 'INACTIVE'>('CONNECTED');
  const [color, setColor] = useState('#4f46e5');

  const openAddModal = () => {
    setEditingSkill(null);
    setName('');
    setCategory('Content Ideas');
    setDescription('');
    setInjectionSnippet('');
    setConfidenceScore(95);
    setStatus('CONNECTED');
    setColor('#4f46e5');
    setShowModal(true);
  };

  const openEditModal = (skill: MemoryAgentSkill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setDescription(skill.description);
    setInjectionSnippet(skill.injectionSnippet);
    setConfidenceScore(skill.confidenceScore);
    setStatus(skill.status);
    setColor(skill.color || '#4f46e5');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSkill) {
      updateMemorySkill(editingSkill.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        injectionSnippet: injectionSnippet.trim(),
        confidenceScore,
        status,
        color
      });
      showToast(`Skill "${name}" berhasil diperbarui!`);
    } else {
      addMemorySkill({
        name: name.trim(),
        category,
        description: description.trim(),
        injectionSnippet: injectionSnippet.trim(),
        confidenceScore,
        status,
        color
      });
      showToast(`Memory Skill "${name}" berhasil ditambahkan!`);
    }
    setShowModal(false);
  };

  const filteredSkills = memorySkills.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Memory Agent Skills Engine</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Modul keahlian permanen yang disuntikkan secara otomatis ke system instructions model AI untuk mencegah konten slop dan menjamin viralitas.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Memory Skill Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Content Ideas', 'Video AI', 'Photo Prompt', 'Splitter', 'Guardrail'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill, idx) => (
          <div
            key={`${skill.id}_${idx}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: skill.color || '#4f46e5' }}
                  />
                  <h3 className="text-sm font-black text-slate-900">{skill.name}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {skill.category}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    skill.status === 'CONNECTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : skill.status === 'LEARNING'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {skill.status}
                </span>
                <button
                  onClick={() => openEditModal(skill)}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  title="Edit Skill"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus skill "${skill.name}"?`)) {
                      deleteMemorySkill(skill.id);
                      showToast('Skill berhasil dihapus.');
                    }
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Hapus Skill"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {skill.description}
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] font-mono text-slate-700">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                System Prompt Injection Snippet:
              </div>
              <p className="line-clamp-3 font-medium">{skill.injectionSnippet}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Confidence Score: <strong className="text-slate-800">{skill.confidenceScore}%</strong></span>
              <span>Eksekusi: <strong className="text-slate-800">{skill.executionCount}x</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Skill */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingSkill ? 'Edit Memory Agent Skill' : 'Tambah Memory Agent Skill'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Skill</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Viral Hook Injektor & Curiosity Gap"
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
                    <option value="Content Ideas">Content Ideas</option>
                    <option value="Video AI">Video AI</option>
                    <option value="Photo Prompt">Photo Prompt</option>
                    <option value="Splitter">Splitter</option>
                    <option value="Guardrail">Guardrail</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status Koneksi</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="CONNECTED">CONNECTED (Aktif)</option>
                    <option value="LEARNING">LEARNING (Eksperimen)</option>
                    <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Kegunaan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan peran spesifik skill ini dalam membentuk output AI..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Injection Snippet (Instruksi Prompt)</label>
                <textarea
                  value={injectionSnippet}
                  onChange={(e) => setInjectionSnippet(e.target.value)}
                  placeholder="Ketik format instruksi paten yang disuntikkan ke generator..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Confidence Score: {confidenceScore}%</label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={confidenceScore}
                    onChange={(e) => setConfidenceScore(Number(e.target.value))}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Warna Tag Badge</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-8 w-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-slate-600 text-xs">{color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700"
                >
                  {editingSkill ? 'Simpan Perubahan' : 'Tambah Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
