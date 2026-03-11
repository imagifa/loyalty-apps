'use client';
import { useState } from 'react';
import { supabaseService } from '../../lib/supabase/service';
import { QRCodeSVG } from 'qrcode.react';

export default function MemberDashboard() {
  const [noHp, setNoHp] = useState('');
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { data: member } = await supabaseService().from('members').select('*').eq('no_hp', noHp).single();
    if (member) { setMemberData(member); } else { alert("Nomor tidak terdaftar!"); }
    setLoading(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  if (!memberData) {
    return (
      <div className="max-w-md mx-auto pt-20 px-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-100 border border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-center text-slate-800 mb-2 italic">Member Access</h1>
          <p className="text-slate-400 text-center text-sm mb-8 tracking-tight">Pantau performa penjualan Anda secara real-time</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="tel" placeholder="Nomor WhatsApp" value={noHp} onChange={(e) => setNoHp(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center" required />
            <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all uppercase italic">
              {loading ? 'Sinking...' : 'Check My Performance'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-10 px-6 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 italic uppercase">Dashboard</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{memberData.nama}</p>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg font-black text-[10px] tracking-widest uppercase">
          {memberData.referral_code}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.3em] mb-2">Total Akumulasi Omset</p>
        <p className="text-3xl font-black italic mb-6">{formatRupiah(memberData.total_spending || 0)}</p>
        <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
          <div>
            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Transaksi</p>
            <p className="text-lg font-black italic">{memberData.transaction_count || 0}x</p>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Status</p>
            <p className="text-lg font-black italic">Active</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col items-center mb-10">
        <p className="text-[10px] font-black text-slate-300 mb-6 uppercase tracking-[0.3em]">Reseller QR ID</p>
        <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
          <QRCodeSVG value={memberData.id} size={160} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 mt-6 text-center leading-relaxed">Berikan kode ini kepada konsumen <br/>saat bertransaksi di Mutif Store</p>
      </div>

      <button onClick={() => setMemberData(null)} className="w-full text-[10px] font-black text-slate-300 hover:text-red-400 transition-colors uppercase tracking-[0.4em]">
        Switch Account
      </button>
    </div>
  );
}
