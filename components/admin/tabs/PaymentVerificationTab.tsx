'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  CreditCard,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  Check,
  X
} from 'lucide-react';
import { Transaction } from '@/types';
import { Badge, Button, Modal, Pagination } from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PaymentVerificationTab: React.FC<Props> = ({ showToast }) => {
  const { transactions, approveTransaction, rejectTransaction } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedTrxForProof, setSelectedTrxForProof] = useState<Transaction | null>(null);

  const handleApprove = (trxId: string) => {
    const user = approveTransaction(trxId);
    showToast(`Transaksi berhasil disetujui! Kode Akses diterbitkan: ${user.accessCode}`);
  };

  const handleReject = (trxId: string) => {
    if (confirm('Apakah Anda yakin ingin menolak transaksi ini?')) {
      rejectTransaction(trxId);
      showToast('Transaksi telah ditolak.', 'info');
    }
  };

  const getWhatsAppSendUrl = (trx: Transaction) => {
    let cleanPhone = trx.whatsapp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const message = `Halo Kak ${trx.customerName}! Pembayaran Anda untuk paket *${trx.planName}* telah TERVERIFIKASI.\n\nBerikut Kode Akses Workspace Anda:\n*${trx.issuedAccessCode || 'SAT-XXXX-VIP'}*\n\nSilakan login di web Tools Satset AI untuk mulai generate script viral!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const filteredTransactions = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return transactions.filter((trx) => {
      const matchSearch =
        !q ||
        trx.id.toLowerCase().includes(q) ||
        trx.customerName.toLowerCase().includes(q) ||
        trx.whatsapp.includes(q) ||
        trx.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || trx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transactions, debouncedSearch, statusFilter]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = usePagination({ items: filteredTransactions, pageSize: 8 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Verifikasi Pembayaran & Bukti Transfer</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tinjau bukti bayar QRIS / rekening calon pembeli, approve transaksi, terbitkan Kode Akses secara instan, dan kirimkan ke WhatsApp pembeli.
          </p>
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
            placeholder="Cari ID transaksi, nama pembeli, nomor WA..."
            className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'all' && `Semua (${transactions.length})`}
              {st === 'pending' && `Pending (${transactions.filter((t) => t.status === 'pending').length})`}
              {st === 'approved' && `Approved (${transactions.filter((t) => t.status === 'approved').length})`}
              {st === 'rejected' && `Rejected (${transactions.filter((t) => t.status === 'rejected').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
            Tidak ada transaksi pada filter ini.
          </div>
        ) : (
          paginatedItems.map((trx, idx) => (
            <div
              key={`${trx.id}_${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{trx.id}</span>
                  <Badge
                    variant={
                      trx.status === 'pending'
                        ? 'amber'
                        : trx.status === 'approved'
                        ? 'emerald'
                        : 'rose'
                    }
                    size="sm"
                    className="uppercase"
                  >
                    {trx.status}
                  </Badge>
                </div>

                <div className="text-xs font-bold text-slate-800">
                  {trx.customerName} • <span className="font-mono text-slate-600">{trx.whatsapp}</span> ({trx.email})
                </div>

                <div className="text-xs text-slate-500">
                  Paket: <strong className="text-slate-800">{trx.planName}</strong> • Total:{' '}
                  <strong className="text-indigo-600 text-sm">Rp {trx.total.toLocaleString('id-ID')}</strong>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">Dibuat pada: {trx.createdAt}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {trx.proofUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProofUrl(trx.proofUrl || null);
                      setSelectedTrxForProof(trx);
                    }}
                    leftIcon={<Eye className="h-3.5 w-3.5 text-slate-500" />}
                  >
                    Lihat Bukti
                  </Button>
                )}

                {trx.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(trx.id)}
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      Approve & Terbitkan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(trx.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Tolak
                    </Button>
                  </>
                )}

                {trx.status === 'approved' && (
                  <div className="flex items-center gap-2">
                    <div className="text-right pr-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Kode Terbit:</span>
                      <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {trx.issuedAccessCode}
                      </span>
                    </div>

                    <a
                      href={getWhatsAppSendUrl(trx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Kirim Kode Akses ke WhatsApp Pembeli"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Kirim WA</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Bukti Transfer */}
      <Modal
        isOpen={Boolean(selectedProofUrl)}
        onClose={() => {
          setSelectedProofUrl(null);
          setSelectedTrxForProof(null);
        }}
        title="Bukti Transfer Pembayaran"
        subtitle={
          selectedTrxForProof
            ? `${selectedTrxForProof.customerName} - Rp ${selectedTrxForProof.total.toLocaleString('id-ID')}`
            : undefined
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {selectedProofUrl && (
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="w-full h-auto object-contain rounded-xl mx-auto"
              />
            )}
          </div>

          <div className="flex gap-2">
            {selectedTrxForProof && selectedTrxForProof.status === 'pending' && (
              <Button
                variant="success"
                size="sm"
                className="flex-1"
                onClick={() => {
                  handleApprove(selectedTrxForProof.id);
                  setSelectedProofUrl(null);
                }}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Approve Sekarang
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedProofUrl(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
