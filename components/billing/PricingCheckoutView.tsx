'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { PackagePlan, Transaction } from '@/types';
import {
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Upload,
  Clock,
  ShieldCheck,
  Search,
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PricingCheckoutView: React.FC = () => {
  const {
    packages,
    selectedPlanForCheckout,
    setSelectedPlanForCheckout,
    activeTransaction,
    setActiveTransaction,
    createTransaction,
    submitPaymentProof,
    findTransactionById,
    approveTransaction,
    loginWithCode,
    setCurrentView,
    settings
  } = useApp();

  // Wizard state: 1: Data Pelanggan, 2: Pembayaran QRIS, 3: Konfirmasi & Kode
  const [step, setStep] = useState<1 | 2 | 3>(selectedPlanForCheckout ? 1 : 1);
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string>('');
  const [searchTrxId, setSearchTrxId] = useState('');
  const [searchResult, setSearchResult] = useState<Transaction | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatedApproving, setSimulatedApproving] = useState(false);

  // If no package selected, show package list view
  const currentPlan = selectedPlanForCheckout || packages[1] || packages[0];

  const handleSelectPlan = (plan: PackagePlan) => {
    setSelectedPlanForCheckout(plan);
    setStep(1);
  };

  const handleGoToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim() || !email.trim()) {
      alert('Mohon lengkapi semua data pelanggan');
      return;
    }

    createTransaction({
      customerName,
      whatsapp,
      email,
      plan: currentPlan
    });

    setStep(2);
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setUploadedProofUrl(url);
        if (activeTransaction) {
          submitPaymentProof(activeTransaction.id, url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = () => {
    if (!uploadedProofUrl && !activeTransaction?.proofUrl) {
      // Set sample proof if none uploaded
      const sampleProof = 'https://picsum.photos/seed/slip_transfer/600/800';
      setUploadedProofUrl(sampleProof);
      if (activeTransaction) {
        submitPaymentProof(activeTransaction.id, sampleProof);
      }
    }
    setStep(3);
  };

  const handleSimulateInstantApprove = () => {
    if (!activeTransaction) return;
    setSimulatedApproving(true);
    setTimeout(() => {
      const approvedUser = approveTransaction(activeTransaction.id);
      setActiveTransaction((prev) => (prev ? { ...prev, status: 'approved', issuedAccessCode: approvedUser.accessCode } : null));
      setSimulatedApproving(false);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
    }, 800);
  };

  const handleDirectLoginWithIssuedCode = () => {
    if (activeTransaction?.issuedAccessCode) {
      loginWithCode(activeTransaction.issuedAccessCode);
    }
  };

  const handleSearchTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrxId.trim()) return;
    const found = findTransactionById(searchTrxId.trim());
    setSearchResult(found || null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('login')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Halaman Login</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Cek Status Transaksi</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        {/* If no plan selected for checkout, or on step 0, show the Pricing Plan Cards */}
        {!selectedPlanForCheckout ? (
          <div className="space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-700">
                PILIHAN PAKET LISENSI
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                Pilih Paket Sesuai Kebutuhan Anda
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Proses otomatis dengan QRIS (BCA, Mandiri, GoPay, OVO, ShopeePay, Dana). Dapatkan Kode Akses dalam hitungan detik.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {packages
                .filter((p) => p.targetCategory !== 'Khusus Member VIP')
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 border transition-all ${
                      plan.isPopular
                        ? 'border-indigo-600 bg-slate-900 text-white shadow-2xl scale-[1.02] md:-translate-y-2'
                        : 'border-slate-200 bg-white text-slate-900 shadow-md hover:shadow-xl'
                    }`}
                  >
                    {plan.badge && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black tracking-wider uppercase shadow-xs ${
                          plan.isPopular
                            ? 'bg-indigo-500 text-white'
                            : 'bg-amber-400 text-slate-950'
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {plan.durationDays >= 365 ? 'PAKET LIFETIME / LANJUTAN' : `AKSES ${plan.durationDays} HARI`}
                        </span>
                        <h3 className="text-xl font-black">{plan.name}</h3>
                        <p
                          className={`text-xs mt-1 ${
                            plan.isPopular ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {plan.tagline}
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black">
                            Rp {plan.price.toLocaleString('id-ID')}
                          </span>
                          <span className={`text-xs ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                            {plan.durationDays >= 365 ? '/ Seumur Hidup' : `/${plan.durationDays} Hari`}
                          </span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-xs text-slate-400 line-through">
                            Rp {plan.originalPrice.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-2.5 pt-4 border-t border-slate-100/20 text-xs">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check
                              className={`h-4 w-4 shrink-0 mt-0.5 ${
                                plan.isPopular ? 'text-indigo-400' : 'text-indigo-600'
                              }`}
                            />
                            <span className={plan.isPopular ? 'text-slate-200' : 'text-slate-700'}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full rounded-xl py-3 text-xs font-bold transition shadow-md cursor-pointer ${
                          plan.isPopular
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        Pilih {plan.name} →
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Special VIP renewal package banner */}
            {packages.find((p) => p.targetCategory === 'Khusus Member VIP') && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    KHUSUS MEMBER VIP
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Perpanjang / Upgrade Lisensi Member VIP (Rp 99.000 / 30 Hari)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Penawaran khusus member terdaftar untuk perpanjangan atau upgrade akun tanpa jeda.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSelectPlan(
                      packages.find((p) => p.targetCategory === 'Khusus Member VIP')!
                    )
                  }
                  className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  Pilih Perpanjang Member →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Multi-step Checkout Wizard */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Top Stepper Indicator */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold border-b border-slate-200 pb-4">
              <div
                className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                  step === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  1
                </span>
                <span className="hidden sm:inline">Data Pelanggan</span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                  step === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  2
                </span>
                <span className="hidden sm:inline">Pembayaran QRIS</span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                  step === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  3
                </span>
                <span className="hidden sm:inline">Konfirmasi & Kode</span>
              </div>
            </div>

            {/* Step 1: Customer Form */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        1. Isikan Data Pelanggan
                      </h2>
                      <p className="text-xs text-slate-500">
                        Data ini digunakan untuk pengiriman notifikasi WhatsApp dan penerbitan Lisensi Kode Akses.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForCheckout(null)}
                      className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Ubah Paket
                    </button>
                  </div>

                  <form onSubmit={handleGoToStep2} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        NAMA LENGKAP
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        NOMOR WHATSAPP AKTIF
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">
                        ALAMAT GMAIL / EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Contoh: budi@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Lanjut ke Pembayaran QRIS →</span>
                    </button>
                  </form>
                </div>

                {/* Right Side Order Summary */}
                <div className="lg:col-span-5 rounded-3xl border border-indigo-900/20 bg-slate-900 text-white p-6 sm:p-7 shadow-xl space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Ringkasan Pesanan
                  </div>
                  <h3 className="text-lg font-black">{currentPlan.name}</h3>

                  <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Harga Paket ({currentPlan.durationDays} Hari)</span>
                      <span className="font-semibold">
                        Rp {currentPlan.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Biaya Layanan Admin QRIS</span>
                      <span className="font-semibold">Rp 2.500</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                      <span>Total Pembayaran:</span>
                      <span className="text-amber-400">
                        Rp {(currentPlan.price + 2500).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Jaminan Akses Langsung Aktif</span>
                    </div>
                    <p>
                      Setelah bukti transfer diverifikasi oleh sistem / Admin, Kode Akses unik Anda akan otomatis diterbitkan dengan hitungan detik.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: QRIS Payment */}
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* QR Code Column */}
                <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg text-center space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      LANGKAH 2 DARI 3
                    </span>
                    <h2 className="text-xl font-black text-slate-900">
                      Scan QRIS untuk Membayar
                    </h2>
                    <p className="text-xs text-slate-500">
                      Gunakan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, atau m-Banking pilihan Anda.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-1">
                    <div className="text-[11px] text-slate-500 font-bold uppercase">
                      TOTAL TAGIHAN YANG HARUS DITRANSFER
                    </div>
                    <div className="text-2xl font-black text-indigo-700">
                      Rp {((activeTransaction?.total || currentPlan.price + 2500)).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Nomor TRX ID: {activeTransaction?.id || 'TRX-957744-SAT'}
                    </div>
                  </div>

                  {/* QRIS Barcode */}
                  <div className="inline-block p-3 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <img
                      src={settings.qrisImageUrl}
                      alt="QRIS Barcode"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    {settings.qrisMerchantName}
                  </div>
                </div>

                {/* Upload Slip Column */}
                <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      <span>Unggah Bukti Pembayaran</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Foto struk transfer / tangkapan layar m-Banking untuk verifikasi cepat oleh Admin.
                    </p>
                  </div>

                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProof}
                      className="hidden"
                    />
                    {uploadedProofUrl || activeTransaction?.proofUrl ? (
                      <div className="text-center space-y-2">
                        <img
                          src={uploadedProofUrl || activeTransaction?.proofUrl}
                          alt="Slip Preview"
                          className="max-h-40 mx-auto rounded-lg shadow-xs object-cover"
                        />
                        <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Foto Berhasil Dipilih (Klik untuk mengganti)</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-slate-600 font-semibold text-center">
                          <span className="text-indigo-600 font-bold underline">Klik di sini</span> untuk memilih Foto Bukti Transfer
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Format JPG, PNG, atau WEBP maks 5MB
                        </span>
                      </>
                    )}
                  </label>

                  <button
                    onClick={handleConfirmPayment}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Saya Sudah Membayar</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowSearchModal(true)}
                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                    >
                      Sudah bayar sebelumnya? Cek status transaksi di sini
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation & Access Code */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xl space-y-6 text-center">
                {activeTransaction?.status === 'approved' ? (
                  <div className="space-y-5">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900">
                        Pembayaran Berhasil Diverifikasi!
                      </h2>
                      <p className="text-xs text-slate-600">
                        Selamat, akun Anda telah aktif dan siap digunakan untuk eksplorasi konten viral.
                      </p>
                    </div>

                    {/* Issued Access Code Card */}
                    <div className="rounded-2xl border-2 border-indigo-500 bg-indigo-50/60 p-5 space-y-2">
                      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        KODE AKSES RESMI ANDA
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-900 tracking-wider">
                          {activeTransaction.issuedAccessCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeTransaction.issuedAccessCode || '')}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 p-2 text-white transition cursor-pointer"
                          title="Salin Kode Akses"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {copiedCode && (
                        <div className="text-[11px] font-bold text-emerald-600">
                          ✓ Berhasil disalin ke clipboard!
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleDirectLoginWithIssuedCode}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Masuk ke Workspace Sekarang →</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <Clock className="h-8 w-8 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black text-amber-800 uppercase">
                        MENUNGGU VERIFIKASI OLEH ADMIN
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 pt-2">
                        Bukti Transfer Sedang Ditinjau
                      </h2>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Bukti transfer untuk transaksi{' '}
                        <span className="font-bold text-slate-900">{activeTransaction?.id || 'TRX-957744-SAT'}</span>{' '}
                        sedang diperiksa. Notifikasi kode akses juga akan dikirim ke WhatsApp Anda.
                      </p>
                    </div>

                    {/* WhatsApp Admin Confirmation Button */}
                    <div className="pt-2 flex flex-col gap-2.5">
                      <a
                        href={`https://wa.me/${settings.waAdminPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo Admin, saya sudah transfer untuk transaksi ID: ${
                            activeTransaction?.id || 'TRX-957744-SAT'
                          } atas nama ${activeTransaction?.customerName || customerName}. Mohon verifikasi.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 py-3 text-xs font-bold text-emerald-800 transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                        <span>Konfirmasi Cepat via WhatsApp Admin</span>
                      </a>

                      {/* Demo Instant Approval Simulator button */}
                      <button
                        onClick={handleSimulateInstantApprove}
                        disabled={simulatedApproving}
                        className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>
                          {simulatedApproving
                            ? 'Memproses Verifikasi...'
                            : '⚡ Simulasikan Approval Otomatis (Demo / Instant Access)'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Transaction Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-600" />
                <span>Cek Status Transaksi</span>
              </h3>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchResult(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleSearchTransaction} className="flex gap-2">
              <input
                type="text"
                value={searchTrxId}
                onChange={(e) => setSearchTrxId(e.target.value)}
                placeholder="Masukkan Nomor Transaksi (TRX ID)"
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                Periksa
              </button>
            </form>

            {searchResult && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">{searchResult.id}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      searchResult.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchResult.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {searchResult.status === 'approved'
                      ? 'DISETUJUI'
                      : searchResult.status === 'rejected'
                      ? 'DITOLAK'
                      : 'MENUNGGU VERIFIKASI'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Nama: <span className="font-bold text-slate-900">{searchResult.customerName}</span></div>
                  <div>Paket: <span className="font-bold text-slate-900">{searchResult.planName}</span></div>
                  <div>Total: <span className="font-bold text-slate-900">Rp {searchResult.total.toLocaleString('id-ID')}</span></div>
                  <div>Waktu: <span className="font-bold text-slate-900">{searchResult.createdAt}</span></div>
                </div>

                {searchResult.status === 'approved' && searchResult.issuedAccessCode && (
                  <div className="p-3 bg-indigo-100/70 border border-indigo-300 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-indigo-800">KODE AKSES:</div>
                      <div className="font-mono text-base font-black text-indigo-950">
                        {searchResult.issuedAccessCode}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowSearchModal(false);
                        loginWithCode(searchResult.issuedAccessCode!);
                      }}
                      className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 font-bold hover:bg-indigo-700 transition"
                    >
                      Masuk Langsung
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>{settings.userCopyrightText || '© 2026 Tools Satset AI • Multi-Engine Content Suite'}</p>
      </footer>
    </div>
  );
};
