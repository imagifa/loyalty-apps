import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo / Header Section */}
        <div className="space-y-2">
          <div className="inline-block p-4 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-blue-900">LOYALTY APPS</h1>
          <p className="text-gray-500 font-medium">Sistem Referral & Poin Cerdas untuk Mitra Hebat</p>
        </div>

        {/* Menu Buttons */}
        <div className="grid gap-4">
          <Link href="/register" className="group flex items-center justify-between p-5 bg-white border-2 border-transparent hover:border-blue-500 rounded-2xl shadow-sm transition-all hover:shadow-md">
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Pendaftaran Member</h3>
              <p className="text-sm text-gray-500">Gabung jadi bagian dari ekosistem kami</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </Link>

          <Link href="/member" className="group flex items-center justify-between p-5 bg-white border-2 border-transparent hover:border-blue-500 rounded-2xl shadow-sm transition-all hover:shadow-md">
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Dashboard Member</h3>
              <p className="text-sm text-gray-500">Cek total poin & mutasi transaksi Anda</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </Link>

          <Link href="/leaderboard" className="group flex items-center justify-between p-5 bg-white border-2 border-transparent hover:border-blue-500 rounded-2xl shadow-sm transition-all hover:shadow-md">
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Papan Peringkat</h3>
              <p className="text-sm text-gray-500">Lihat siapa juara poin bulan ini</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-colors text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Footer Admin Link */}
        <div className="pt-6">
          <Link href="/admin" className="text-xs font-semibold text-gray-400 hover:text-blue-600 transition tracking-widest uppercase">
            Akses Panel Admin &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
