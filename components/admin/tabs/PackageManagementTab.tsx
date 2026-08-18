'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Copy,
  Layers,
  Eye,
  Check,
  Zap,
  Percent,
  Calendar,
  Star,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ArrowRight,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { PackagePlan } from '@/types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const COMMON_FEATURE_PRESETS = [
  'Akses 6 Tool AI Satset Lengkap',
  'Generator Prompt Video 8K Ultra',
  'Generator Prompt Foto Nano Samama',
  'Video Frame Extractor High Quality',
  'TikTok Downloader No Watermark',
  'TikTok Shop & AEO Hook Formula',
  'Prioritas Server Anti-Limit Level 1',
  'Bypass Kuota VIP & Anti Limit Max',
  'Ekspor Format JSON, TXT & CSV',
  'Grup Komunitas Exclusive VIP',
  'Dukungan Admin CS Fast Response',
  'Lisensi Komersial Konten Kreator',
  'Garansi Bebas Iklan & Update AI 2026'
];

export const PackageManagementTab: React.FC<Props> = ({ showToast }) => {
  const { packages, addPackage, updatePackage, deletePackage, settings } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackagePlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState<number>(99000);
  const [originalPrice, setOriginalPrice] = useState<number>(199000);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [badge, setBadge] = useState('POPULER');
  const [targetCategory, setTargetCategory] = useState('Public (Calon Pembeli)');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Akses 6 Tool AI Satset Lengkap',
    'Prioritas Server Anti-Limit Level 1',
    'Ekspor Format JSON, TXT & CSV',
    'Dukungan Admin CS Fast Response'
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setTagline('');
    setPrice(99000);
    setOriginalPrice(199000);
    setDurationDays(30);
    setBadge('POPULER');
    setTargetCategory('Public (Calon Pembeli)');
    setIsPopular(false);
    setIsActive(true);
    setFeaturesList([
      'Akses 6 Tool AI Satset Lengkap',
      'Prioritas Server Anti-Limit Level 1',
      'Ekspor Format JSON, TXT & CSV',
      'Dukungan Admin CS Fast Response'
    ]);
    setCustomFeatureInput('');
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
    setTargetCategory(pkg.targetCategory || 'Public (Calon Pembeli)');
    setIsPopular(!!pkg.isPopular);
    setIsActive(pkg.active ?? true);
    setFeaturesList(Array.isArray(pkg.features) ? [...pkg.features] : []);
    setCustomFeatureInput('');
    setShowModal(true);
  };

  const handleDuplicate = (pkg: PackagePlan) => {
    const duplicated: Partial<PackagePlan> = {
      name: `${pkg.name} (Copy)`,
      tagline: pkg.tagline,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      durationDays: pkg.durationDays,
      badge: pkg.badge,
      targetCategory: pkg.targetCategory,
      isPopular: false,
      features: [...pkg.features],
      active: true
    };
    addPackage(duplicated);
    showToast(`Paket "${pkg.name}" berhasil diduplikasi!`);
  };

  const handleToggleActiveStatus = (pkg: PackagePlan) => {
    const nextStatus = !(pkg.active ?? true);
    updatePackage(pkg.id, { active: nextStatus });
    showToast(`Status paket "${pkg.name}" diubah menjadi ${nextStatus ? 'AKTIF' : 'NONAKTIF'}.`);
  };

  // Add / Remove feature chips
  const handleAddFeatureChip = (feat: string) => {
    if (!featuresList.includes(feat)) {
      setFeaturesList([...featuresList, feat]);
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, idx) => idx !== index));
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeatureInput.trim() && !featuresList.includes(customFeatureInput.trim())) {
      setFeaturesList([...featuresList, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama paket wajib diisi.', 'error');
      return;
    }

    if (featuresList.length === 0) {
      showToast('Mohon tambahkan minimal 1 fitur lisensi.', 'error');
      return;
    }

    if (editingPkg) {
      updatePackage(editingPkg.id, {
        name: name.trim(),
        tagline: tagline.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice) || undefined,
        durationDays: Number(durationDays),
        badge: badge.trim() || undefined,
        targetCategory,
        isPopular,
        features: featuresList,
        active: isActive
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
        targetCategory,
        isPopular,
        features: featuresList,
        active: isActive
      });
      showToast(`Paket baru "${name}" berhasil ditambahkan!`);
    }
    setShowModal(false);
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    if (filterCategory === 'all') return packages;
    if (filterCategory === 'active') return packages.filter((p) => p.active ?? true);
    if (filterCategory === 'public') return packages.filter((p) => p.targetCategory !== 'Khusus Member VIP');
    if (filterCategory === 'member') return packages.filter((p) => p.targetCategory === 'Khusus Member VIP');
    return packages;
  }, [packages, filterCategory]);

  // Discount calculation
  const discountPercent = useMemo(() => {
    if (originalPrice && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  }, [price, originalPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Manajemen Paket & Lisensi</h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold px-2.5 py-0.5">
              {packages.length} Paket Dikonfigurasi
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atur skema harga paket langganan, durasi aktif, badge rekomendasi, diskon coret, dan daftar fitur unggulan secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Paket Baru</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Paket ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('public')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterCategory === 'public'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public / Calon Pembeli
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('member')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterCategory === 'member'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khusus Member (Perpanjangan)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterCategory === 'active'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hanya Aktif
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-900">{filteredPackages.length}</strong> paket
        </div>
      </div>

      {/* WhatsApp Redirect Status Alert Banner */}
      {packages.filter((p) => p.active !== false && p.targetCategory !== 'Khusus Member VIP').length === 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-black text-amber-900 flex items-center gap-2">
              <span>Sistem Redirect Otomatis Aktif (Mode CS WhatsApp)</span>
              <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                Semua Paket Public Nonaktif
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Karena seluruh paket lisensi publik dinonaktifkan, calon pembeli di halaman checkout dan login akan otomatis diarahkan untuk berkonsultasi & mendaftar via WhatsApp Admin (<strong className="font-mono">{settings.waAdminPhone || '6281234567890'}</strong>).
            </p>
          </div>
        </div>
      )}

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg, idx) => {
          const isPkgActive = pkg.active ?? true;
          return (
            <div
              key={`${pkg.id}_${idx}`}
              className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition duration-200 relative ${
                pkg.isPopular
                  ? 'border-indigo-500 bg-indigo-50/15 ring-2 ring-indigo-500/20 shadow-md'
                  : isPkgActive
                  ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  : 'border-slate-200 bg-slate-50 opacity-75'
              }`}
            >
              {/* Popular Star Badge */}
              {pkg.isPopular && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>REKOMENDASI TERPOPULER</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{pkg.name}</h3>
                      {pkg.badge && (
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-0.5 uppercase">
                          {pkg.badge}
                        </span>
                      )}
                      {!isPkgActive && (
                        <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[9px] px-1.5 py-0.5 uppercase">
                          NONAKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.tagline}</p>
                    <div className="mt-1 text-[10px] font-bold text-slate-400">
                      Target: {pkg.targetCategory || 'Public (Calon Pembeli)'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDuplicate(pkg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Duplikat Paket Ini"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Edit Detail Paket"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus paket "${pkg.name}" secara permanen?`)) {
                          deletePackage(pkg.id);
                          showToast('Paket berhasil dihapus.');
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Hapus Paket"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </span>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {pkg.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-semibold">
                      / {pkg.durationDays >= 3650 ? 'Lifetime' : `${pkg.durationDays} hari`}
                    </span>
                  </div>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Hemat Rp {(pkg.originalPrice - pkg.price).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Fitur Lisensi ({pkg.features.length}):
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActiveStatus(pkg)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    isPkgActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  title={isPkgActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                >
                  <span className={`h-2 w-2 rounded-full ${isPkgActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{isPkgActive ? 'Aktif' : 'Nonaktif'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(pkg)}
                  className="flex-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white py-1.5 px-3 text-xs font-bold transition cursor-pointer text-center"
                >
                  Ubah Detail Paket
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Package (Rich Form + Live Preview) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 max-w-4xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPkg ? `Edit Paket: ${editingPkg.name}` : 'Tambah Paket Lisensi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Konfigurasi harga, durasi, status publikasi, dan fitur lisensi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Edit Form (7 cols) */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 text-xs">
                {/* Name & Tagline */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Paket *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Akses 3 Bulan (Hemat VIP)"
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

                {/* Price & Original Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Harga Jual (Rp) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                      min={0}
                      step={1000}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">
                      = Rp {price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Harga Coret Asli (Rp)</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      min={0}
                      step={1000}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Diskon {discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration & Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Durasi Aktif (Hari) *</label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      min={1}
                      max={36500}
                      required
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setDurationDays(7)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600"
                      >
                        7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationDays(30)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600"
                      >
                        30 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationDays(36500)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600"
                      >
                        Lifetime
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Badge Label (Opsional)</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Contoh: BEST SELLER / HEMAT / POPULER"
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Category & Toggles */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Kategori Paket</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none bg-white"
                  >
                    <option value="Public (Calon Pembeli)">Public (Calon Pembeli - Tampil di Checkout Umum)</option>
                    <option value="Khusus Member VIP">Khusus Member VIP (Perpanjangan / Upgrade)</option>
                    <option value="Special Promo / Affiliate">Special Promo / Affiliate</option>
                  </select>
                </div>

                {/* Toggles: isPopular & isActive */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Paket Rekomendasi</div>
                      <div className="text-[10px] text-slate-500">Sorot dengan border ungu</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Status Aktif</div>
                      <div className="text-[10px] text-slate-500">Tersedia untuk transaksi</div>
                    </div>
                  </label>
                </div>

                {/* Features Management & Quick Presets */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">
                      Fitur Lisensi Terpilih ({featuresList.length})
                    </label>
                  </div>

                  {/* Feature Chips Selected */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {featuresList.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Feature */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customFeatureInput}
                      onChange={(e) => setCustomFeatureInput(e.target.value)}
                      placeholder="Ketik fitur kustom baru..."
                      className="flex-1 rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-600 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFeature(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Preset Fitur Cepat (Klik untuk menambahkan):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_FEATURE_PRESETS.map((preset, pIdx) => {
                        const isAdded = featuresList.includes(preset);
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleAddFeatureChip(preset)}
                            disabled={isAdded}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-50 text-emerald-700 opacity-60 cursor-default'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                            }`}
                          >
                            <span>{isAdded ? '✓' : '+'}</span>
                            <span>{preset}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 font-bold hover:bg-indigo-700 shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>{editingPkg ? 'Simpan Perubahan' : 'Tambah Paket Baru'}</span>
                  </button>
                </div>
              </form>

              {/* Right: Live Preview Card (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Preview Tampilan Pelanggan (Live):</span>
                </div>

                <div
                  className={`rounded-3xl border p-6 shadow-md transition space-y-4 ${
                    isPopular
                      ? 'border-indigo-600 bg-slate-900 text-white ring-2 ring-indigo-500'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  {badge && (
                    <div
                      className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black tracking-wider uppercase shadow-xs ${
                        isPopular ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {badge}
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {durationDays >= 3650 ? 'PAKET LIFETIME' : `AKSES ${durationDays} HARI`}
                    </span>
                    <h4 className="text-lg font-black">{name || 'Nama Paket'}</h4>
                    <p className={`text-xs mt-0.5 ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tagline || 'Deskripsi singkat paket lisensi.'}
                    </p>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        Rp {Number(price || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs opacity-60">
                        {durationDays >= 3650 ? '/ Seumur Hidup' : `/${durationDays} Hari`}
                      </span>
                    </div>
                    {originalPrice > price && (
                      <div className="text-xs opacity-40 line-through">
                        Rp {Number(originalPrice).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-current/10 text-xs">
                    {featuresList.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isPopular ? 'text-indigo-400' : 'text-emerald-600'}`} />
                        <span className={`truncate ${isPopular ? 'text-slate-200' : 'text-slate-700'}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition shadow-sm ${
                      isPopular ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Pilih Paket Ini →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
