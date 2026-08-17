'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Copy,
  Clock,
  UserCheck
} from 'lucide-react';
import { UserSession } from '@/types';
import { Badge, Button, Modal, Pagination } from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';

interface Props {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ClientManagementTab: React.FC<Props> = ({ showToast }) => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    extendUserDays,
    packages
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState<'user' | 'superadmin'>('user');
  const [planId, setPlanId] = useState('plan_bulanan_vip');
  const [daysRemaining, setDaysRemaining] = useState(30);
  const [customAccessCode, setCustomAccessCode] = useState('');
  const [status, setStatus] = useState<'aktif' | 'expired' | 'suspended'>('aktif');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SAT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-VIP';
    setCustomAccessCode(code);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setWhatsapp('');
    setRole('user');
    setPlanId('plan_bulanan_vip');
    setDaysRemaining(30);
    setStatus('aktif');
    generateRandomCode();
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserSession) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setWhatsapp(user.whatsapp);
    setRole(user.role);
    setPlanId(user.planId || 'plan_bulanan_vip');
    setDaysRemaining(user.daysRemaining);
    setCustomAccessCode(user.accessCode);
    setStatus(user.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const selectedPkg = packages.find((p) => p.id === planId);

    if (editingUser) {
      updateUser(editingUser.accessCode, {
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        role,
        planId,
        planName: selectedPkg?.name || 'Akses Bulanan (VIP)',
        daysRemaining: Number(daysRemaining),
        status
      });
      showToast(`Data user "${name}" berhasil diupdate!`);
    } else {
      const created = addUser({
        accessCode: customAccessCode.trim() || undefined,
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || '08123456789',
        role,
        planId,
        planName: selectedPkg?.name || 'Akses Bulanan (VIP)',
        daysRemaining: Number(daysRemaining),
        status
      });
      showToast(`User baru dibuat! Kode Akses: ${created.accessCode}`);
    }
    setShowModal(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Kode Akses ${code} disalin ke clipboard!`);
  };

  const handleExportUsersCsv = () => {
    const headers = 'Kode Akses,Nama,Email,WhatsApp,Role,Paket,Masa Aktif (Hari),Status,Total Generasi,Tanggal Dibuat\n';
    const rows = users
      .map(
        (u) =>
          `"${u.accessCode}","${u.name}","${u.email}","${u.whatsapp}","${u.role}","${u.planName}",${u.daysRemaining},"${u.status}",${u.totalGenerations},"${u.createdAt || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-client-satset-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Export CSV daftar client berhasil diunduh!');
  };

  // High performance memoized filtering
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.accessCode.toLowerCase().includes(q) ||
        u.whatsapp.includes(q);
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, debouncedSearch, statusFilter, roleFilter]);

  // Scalable pagination - default 10 items per page
  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
  } = usePagination({ items: filteredUsers, pageSize: 10 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Manajemen Client & User Workspace</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola kode akses unik, perpanjang masa aktif lisensi, kelola role super admin, dan pantau frekuensi generasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsersCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Buat User Baru
          </Button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, WA, atau kode..."
            className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none cursor-pointer"
        >
          <option value="all">Semua Status Lisensi</option>
          <option value="aktif">Aktif (Valid)</option>
          <option value="expired">Expired (Kadaluarsa)</option>
          <option value="suspended">Suspended (Ditangguhkan)</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold focus:border-indigo-600 focus:outline-none cursor-pointer"
        >
          <option value="all">Semua Hak Akses Role</option>
          <option value="user">User Standar / VIP</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama & Kontak</th>
                <th className="px-4 py-3">Kode Akses</th>
                <th className="px-4 py-3">Paket & Role</th>
                <th className="px-4 py-3">Masa Aktif</th>
                <th className="px-4 py-3">Generasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Tidak ditemukan data user sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((u, idx) => (
                  <tr key={`${u.accessCode}_${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.whatsapp}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px]">
                          {u.accessCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(u.accessCode)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition cursor-pointer"
                          title="Salin Kode Akses"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{u.planName}</div>
                      <Badge
                        variant={u.role === 'superadmin' ? 'purple' : 'slate'}
                        size="sm"
                        className="mt-0.5 uppercase text-[9px]"
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">Sisa {u.daysRemaining} hari</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Exp: {new Date(u.expiresAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-700">{u.totalGenerations}x</td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          u.status === 'aktif'
                            ? 'emerald'
                            : u.status === 'expired'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                        className="uppercase"
                      >
                        {u.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            extendUserDays(u.accessCode, 30);
                            showToast(`+30 hari ditambahkan untuk ${u.name}`);
                          }}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                          title="Tambah 30 Hari"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          +30 Hari
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {u.role !== 'superadmin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus akun dan lisensi ${u.name}?`)) {
                                deleteUser(u.accessCode);
                                showToast('User berhasil dihapus.');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lightweight Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Data User & Lisensi' : 'Buat Akun / Kode Akses Baru'}
        subtitle="Atur durasi masa aktif dan konfigurasi akun pengguna"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rian Pratama"
              required
              className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rian@gmail.com"
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Paket Lisensi</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.durationDays} hari)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hak Akses Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              >
                <option value="user">User Standar / VIP</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sisa Durasi (Hari)</label>
              <input
                type="number"
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Number(e.target.value))}
                min={1}
                max={999}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Status Akun</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-indigo-600 focus:outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Kode Akses Unik</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Acak Kode Baru
                </button>
              </div>
              <input
                type="text"
                value={customAccessCode}
                onChange={(e) => setCustomAccessCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-indigo-700 focus:border-indigo-600 focus:outline-none uppercase"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            >
              {editingUser ? 'Simpan Perubahan' : 'Generate Kode Akses'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
