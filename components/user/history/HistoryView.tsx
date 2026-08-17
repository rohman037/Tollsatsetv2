'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Clock,
  Trash2,
  Copy,
  Search,
  Check
} from 'lucide-react';
import { Badge, Button, EmptyState, Pagination } from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';

export const HistoryView: React.FC = () => {
  const { history, clearHistory, deleteHistoryItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return history.filter((item) => {
      return (
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.previewText.toLowerCase().includes(q) ||
        item.toolType.toLowerCase().includes(q)
      );
    });
  }, [history, debouncedSearch]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = usePagination({ items: filteredHistory, pageSize: 8 });

  const handleCopy = (item: any) => {
    navigator.clipboard.writeText(JSON.stringify(item.fullData, null, 2));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Riwayat Aktivitas & Output</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daftar hasil generasi prompt, ide konten, dan unduhan video yang tersimpan secara lokal.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menghapus semua riwayat tersimpan?')) {
                clearHistory();
              }
            }}
            className="text-rose-600 hover:bg-rose-50 border border-rose-200/60"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Hapus Semua Riwayat
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan judul atau cuplikan konten..."
          className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none"
        />
      </div>

      {/* History Items List */}
      {paginatedItems.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum Ada Riwayat Tersimpan"
          description="Gunakan fitur TikTok Shop, Ide Konten, Video to Prompt, atau Ekstraktor Frame untuk mulai mengumpulkan riwayat di sini."
        />
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item, idx) => (
            <div
              key={`${item.id}_${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" size="sm" className="uppercase">
                      {item.toolType.replace('_', ' ')}
                    </Badge>
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{item.createdAt || 'Baru saja'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item)}
                    leftIcon={
                      copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    {copiedId === item.id ? 'Tersalin' : 'Salin Data'}
                  </Button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus item ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl">
                {item.previewText}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags?.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
