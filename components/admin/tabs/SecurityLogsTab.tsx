'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  ShieldAlert,
  Search,
  Trash2,
  Download
} from 'lucide-react';
import { Badge, Button, Pagination } from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SecurityLogsTab: React.FC<Props> = ({ showToast }) => {
  const { loginLogs, clearLoginLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleExportCsv = () => {
    const headers = 'Waktu,User / Akun,Role,IP Address,Device / Browser,Status,Keterangan\n';
    const rows = loginLogs
      .map((l) => `"${l.timestamp}","${l.user}","${l.role}","${l.ip}","${l.device}","${l.status}","${l.detail}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Audit Log keamanan berhasil diexport ke CSV!');
  };

  const filteredLogs = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return loginLogs.filter((l) => {
      const matchSearch =
        !q ||
        l.user.toLowerCase().includes(q) ||
        l.ip.includes(q) ||
        l.detail.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [loginLogs, debouncedSearch, statusFilter]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = usePagination({ items: filteredLogs, pageSize: 12 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Audit Log & Keamanan Login</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Rekam jejak autentikasi akses kode, deteksi upaya brute force, verifikasi IP address, dan perangkat browser pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Bersihkan seluruh log audit keamanan?')) {
                clearLoginLogs();
                showToast('Audit log berhasil dibersihkan.');
              }
            }}
            className="text-rose-600 hover:bg-rose-50 border border-rose-200/60"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Bersihkan Log
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, IP address, atau detail kejadian..."
            className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none cursor-pointer"
        >
          <option value="all">Semua Status Autentikasi</option>
          <option value="SUCCESS">SUCCESS (Berhasil Masuk)</option>
          <option value="FAILED">FAILED (Kode Salah/Expired)</option>
          <option value="VERIFIKASI_PEMBAYARAN">VERIFIKASI_PEMBAYARAN</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">User / Identitas</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Device / Platform</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detail Kejadian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada log yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((log, idx) => (
                  <tr key={`${log.id}_${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.user}</div>
                      <Badge variant="slate" size="sm" className="mt-0.5 uppercase text-[9px]">
                        {log.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {log.device}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          log.status === 'SUCCESS'
                            ? 'emerald'
                            : log.status === 'FAILED'
                            ? 'rose'
                            : 'indigo'
                        }
                        size="sm"
                        className="uppercase"
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {log.detail}
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
    </div>
  );
};
