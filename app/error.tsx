'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      <h2 className="text-3xl font-black text-rose-400 mb-2">Terjadi Kesalahan Sistem</h2>
      <p className="text-slate-400 mb-6">{error?.message || 'Gagal memproses permintaan.'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg transition-all"
      >
        Coba Lagi
      </button>
    </div>
  );
}
