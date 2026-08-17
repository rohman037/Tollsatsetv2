'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Activity,
  Search,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { LiveGenerationEvent } from '@/types';
import { Badge, Button, Modal, Pagination } from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const RealtimeStreamTab: React.FC<Props> = ({ showToast }) => {
  const { liveEvents, addLiveEvent, clearLiveEvents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [filterTool, setFilterTool] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<LiveGenerationEvent | null>(null);

  const handleAddSimulatedEvent = () => {
    const tools = ['Ide Konten AEO', 'TikTok Shop Generator', 'Video to Prompt AI', 'Prompt Foto Ultra', 'Ekstraktor Frame'];
    const randomTool = tools[Math.floor(Math.random() * tools.length)];
    const models = ['gemini-3.5-flash (Search Grounded)', 'gemini-3.1-pro-preview (Deep Thinking)', 'gemini-3.1-flash-lite'];
    const randomModel = models[Math.floor(Math.random() * models.length)];

    addLiveEvent({
      userCode: `SAT-${Math.floor(1000 + Math.random() * 9000)}-VIP`,
      userName: 'Live Streamer Sim',
      aiTool: randomTool,
      category: 'E-Commerce Viral',
      modelUsed: randomModel,
      latencyMs: Math.floor(650 + Math.random() * 900),
      status: 'SUCCESS',
      tokenCount: Math.floor(400 + Math.random() * 1200),
      promptSnippet: 'Analisis produk viral TikTok Shop kategori fashion wanita & script hook 3 detik'
    });
    showToast('Simulasi event generasi AI berhasil dikirim ke live stream!');
  };

  const filteredEvents = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return liveEvents.filter((evt) => {
      const matchSearch =
        !q ||
        evt.userName.toLowerCase().includes(q) ||
        evt.userCode.toLowerCase().includes(q) ||
        evt.aiTool.toLowerCase().includes(q) ||
        evt.promptSnippet.toLowerCase().includes(q);
      const matchTool = filterTool === 'all' || evt.aiTool.toLowerCase().includes(filterTool.toLowerCase());
      return matchSearch && matchTool;
    });
  }, [liveEvents, debouncedSearch, filterTool]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = usePagination({ items: filteredEvents, pageSize: 10 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900">Pemantau Realtime Generasi AI</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Log pemantauan aktivitas AI streaming: lacak latency model, token usage, dan status pipeline dari seluruh pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSimulatedEvent}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-indigo-600" />}
          >
            Simulasi Event AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Hapus seluruh log realtime streaming saat ini?')) {
                clearLiveEvents();
                showToast('Log streaming berhasil dibersihkan.');
              }
            }}
            className="text-rose-600 hover:bg-rose-50 border border-rose-200/60"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Bersihkan Log
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, kode, prompt atau tool..."
            className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <select
          value={filterTool}
          onChange={(e) => setFilterTool(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none cursor-pointer"
        >
          <option value="all">Semua Tool AI</option>
          <option value="TikTok Shop">TikTok Shop Ideas</option>
          <option value="Ide Konten">Ide Konten AI (AEO)</option>
          <option value="Video">Video to Prompt</option>
          <option value="Prompt Foto">Prompt Foto Ultra</option>
          <option value="Ekstraktor">Ekstraktor Frame</option>
        </select>
      </div>

      {/* Stream Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">User & Kode</th>
                <th className="px-4 py-3">Tool AI</th>
                <th className="px-4 py-3">Prompt Snippet</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada aktivitas generasi yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((evt, idx) => (
                  <tr key={`${evt.id}_${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {evt.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{evt.userName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{evt.userCode}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="indigo" size="sm">
                        {evt.aiTool}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      <span className="font-semibold text-slate-800 block truncate">{evt.category}</span>
                      <span className="text-[11px] text-slate-500 truncate block">{evt.promptSnippet}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {evt.modelUsed}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">
                      {evt.latencyMs}ms
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {evt.tokenCount || 650} tok
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-600 transition cursor-pointer"
                        title="Lihat Detail Request"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Detail Event */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title="Detail Request Generasi AI"
        subtitle={selectedEvent?.userName}
        maxWidth="md"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">User:</span>
                <strong className="text-slate-800">{selectedEvent.userName}</strong>
                <span className="text-[10px] text-slate-500 font-mono block">{selectedEvent.userCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tool:</span>
                <span className="font-bold text-indigo-700">{selectedEvent.aiTool}</span>
                <span className="text-[10px] text-slate-500 block">{selectedEvent.timestamp}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Model & Routing:</span>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl flex items-center justify-between">
                <span>{selectedEvent.modelUsed}</span>
                <span>{selectedEvent.latencyMs}ms</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prompt / Query Snippet:</span>
              <p className="p-3 bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 leading-relaxed">
                {selectedEvent.promptSnippet}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
              <span>Estimasi Token: <strong>{selectedEvent.tokenCount || 650} Tokens</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Valid
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setSelectedEvent(null)}
            >
              Tutup
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
