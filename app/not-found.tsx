import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      <h2 className="text-4xl font-black text-indigo-400 mb-2">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-slate-400 mb-6">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
