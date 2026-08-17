'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  QrCode,
  Save,
  Image as ImageIcon,
  Building,
  Wallet,
  CheckCircle2
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const QrisConfigTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings } = useApp();

  const [merchantName, setMerchantName] = useState(settings.qrisMerchantName || 'SATSET AI DIGITAL STORE');
  const [qrisUrl, setQrisUrl] = useState(
    settings.qrisImageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
  );

  const handleSave = () => {
    updateSettings({
      qrisMerchantName: merchantName,
      qrisImageUrl: qrisUrl
    });
    showToast('Konfigurasi QRIS & Pembayaran berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Konfigurasi QRIS & Pembayaran</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur gambar QRIS resmi, nama merchant toko, dan nomor rekening penerima transfer bagi calon pembeli lisensi.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Simpan Pengaturan QRIS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900">Pengaturan QRIS Merchant</h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nama Merchant QRIS (Tampil di Checkout)</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">URL Gambar QRIS (Link Langsung / CDN)</label>
              <input
                type="url"
                value={qrisUrl}
                onChange={(e) => setQrisUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-indigo-600" />
                <span>Opsi Rekening Bank & E-Wallet Tambahan:</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 font-medium">
                <div>• <strong>BCA:</strong> 8735091234 (A/N Satset Digital)</div>
                <div>• <strong>Mandiri:</strong> 1370019283921 (A/N Satset Digital)</div>
                <div>• <strong>Dana / GoPay:</strong> 0812-3456-7890 (A/N Admin Satset)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview QRIS Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{merchantName}</div>
          <div className="h-56 w-56 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
            {qrisUrl ? (
              <img src={qrisUrl} alt="QRIS Merchant Preview" className="h-full w-full object-contain rounded-xl" />
            ) : (
              <div className="text-xs text-slate-400">QRIS Preview</div>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Preview QRIS yang akan dipindai oleh pengguna saat checkout lisensi.
          </span>
        </div>
      </div>
    </div>
  );
};
