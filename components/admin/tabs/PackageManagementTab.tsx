'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag
} from 'lucide-react';
import { PackagePlan } from '@/types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PackageManagementTab: React.FC<Props> = ({ showToast }) => {
  const { packages, addPackage, updatePackage, deletePackage } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackagePlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState(99000);
  const [originalPrice, setOriginalPrice] = useState(199000);
  const [durationDays, setDurationDays] = useState(30);
  const [badge, setBadge] = useState('POPULER');
  const [featuresText, setFeaturesText] = useState('Semua Tool AI Tanpa Batas\nPrioritas Server Anti-Limit\nEkspor JSON & Copy Cepat\nSupport CS WhatsApp');

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setTagline('');
    setPrice(99000);
    setOriginalPrice(199000);
    setDurationDays(30);
    setBadge('POPULER');
    setFeaturesText('Semua Tool AI Tanpa Batas\nPrioritas Server Anti-Limit\nEkspor JSON & Copy Cepat\nSupport CS WhatsApp');
    setShowModal(true);
  };

  const handleOpenEdit = (pkg: PackagePlan) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setTagline(pkg.tagline);
    setPrice(pkg.price);
    setOriginalPrice(pkg.originalPrice || 0);
    setDurationDays(pkg.durationDays);
    setBadge(pkg.badge || '');
    setFeaturesText(pkg.features.join('\n'));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const featuresList = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingPkg) {
      updatePackage(editingPkg.id, {
        name: name.trim(),
        tagline: tagline.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice) || undefined,
        durationDays: Number(durationDays),
        badge: badge.trim() || undefined,
        features: featuresList
      });
      showToast(`Paket "${name}" berhasil diperbarui!`);
    } else {
      addPackage({
        name: name.trim(),
        tagline: tagline.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice) || undefined,
        durationDays: Number(durationDays),
        badge: badge.trim() || undefined,
        features: featuresList,
        active: true
      });
      showToast(`Paket baru "${name}" berhasil ditambahkan!`);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Manajemen Paket & Lisensi</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur skema harga paket langganan, durasi aktif, badge rekomendasi, diskon coret, dan daftar fitur unggulan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg, idx) => (
          <div
            key={`${pkg.id}_${idx}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{pkg.name}</h3>
                    {pkg.badge && (
                      <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-0.5 uppercase">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.tagline}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Edit Paket"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus paket "${pkg.name}"?`)) {
                        deletePackage(pkg.id);
                        showToast('Paket berhasil dihapus.');
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Paket"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </span>
                {pkg.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    Rp {pkg.originalPrice.toLocaleString('id-ID')}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-semibold">/ {pkg.durationDays} hari</span>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fitur Lisensi:</div>
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenEdit(pkg)}
              className="w-full rounded-xl border border-slate-200 hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 transition cursor-pointer mt-2"
            >
              Ubah Detail Paket
            </button>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Package */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingPkg ? 'Edit Paket Lisensi' : 'Tambah Paket Lisensi Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Paket</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Akses 3 Bulan (Hemat)"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tagline / Subheadline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Solusi terbaik tim agensi & affiliate pro"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Harga Coret Asli (Rp)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Durasi Aktif (Hari)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    max={9999}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge Label (Opsional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="BEST SELLER / HEMAT"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Daftar Fitur Termasuk (1 Baris = 1 Fitur)</label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none leading-relaxed"
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
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-700 shadow-sm"
                >
                  {editingPkg ? 'Simpan Perubahan' : 'Tambah Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
