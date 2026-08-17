'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  MessageSquare,
  Save,
  Send,
  Phone,
  Clock,
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const WhatsAppConfigTab: React.FC<Props> = ({ showToast }) => {
  const { settings, updateSettings } = useApp();

  const [waPhone, setWaPhone] = useState(settings.waAdminPhone || '6281234567890');
  const [waTemplate, setWaTemplate] = useState(
    settings.waDefaultTemplate ||
      'Halo Admin Satset AI! Saya ingin bertanya mengenai pembelian lisensi / verifikasi pembayaran Kode Akses.'
  );

  const handleSave = () => {
    updateSettings({
      waAdminPhone: waPhone.trim(),
      waDefaultTemplate: waTemplate.trim()
    });
    showToast('Konfigurasi WhatsApp CS berhasil disimpan!');
  };

  const getPreviewWaLink = () => {
    let clean = waPhone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}?text=${encodeURIComponent(waTemplate)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900">Konfigurasi WhatsApp CS Admin</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur nomor WhatsApp pusat bantuan pelanggan, template salam pesan otomatis, dan link chat bantuan di seluruh workspace.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Simpan Konfigurasi WA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900">Pengaturan Nomor & Template</h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nomor WhatsApp Admin (Format Internasional: 628...)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Template Pesan Otomatis (Default Pengguna)</label>
              <textarea
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-emerald-600 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Test Link Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">Uji Coba Click to Chat</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Klik tombol di bawah untuk menguji apakah format tautan WhatsApp sudah terarah ke nomor Admin secara tepat:
            </p>

            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-900">Pesan yang akan terkirim:</div>
              <p className="text-emerald-800 italic bg-white p-3 rounded-xl border border-emerald-100">
                "{waTemplate}"
              </p>
            </div>
          </div>

          <a
            href={getPreviewWaLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold transition text-center flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Test Kirim Pesan CS ke WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
