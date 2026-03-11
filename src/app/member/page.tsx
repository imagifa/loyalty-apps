'use client';

import { useState } from 'react';
import { supabaseService } from '../../lib/supabase/service';
import { QRCodeSVG } from 'qrcode.react';

export default function MemberDashboard() {
  const [noHp, setNoHp] = useState('');
  const [memberData, setMemberData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const supabase = supabaseService();
    
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('*')
      .eq('no_hp', noHp)
      .single();

    if (memberErr || !member) {
      setErrorMsg("Nomor HP tidak ditemukan.");
      setLoading(false);
      return;
    } 

    setMemberData(member);

    const { data: historyData } = await supabase
      .from('point_history')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyData) setHistory(historyData);
    setLoading(false);
  };

  // Fungsi format tanggal & waktu Indonesia
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!memberData) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-lg border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Cek Poin Member</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Masukkan nomor WhatsApp terdaftar</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="tel" placeholder="Contoh: 08123456789" value={noHp} onChange={(e) => setNoHp(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">{loading ? 'Mencari...' : 'Masuk Ke Dashboard'}</button>
          {errorMsg && <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>}
        </form>
      </div>
    );
  }

  const referralLink = `http://localhost:3000/register?ref=${memberData.id}`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border-t-4 border-blue-600 pb-10">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Kartu Member Digital</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{memberData.nama}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-inner mb-6 flex flex-col items-center">
        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Tabungan Poin</p>
        <p className="text-6xl font-black my-1">{memberData.points}</p>
        <p className="text-[10px] font-medium opacity-70 italic tracking-tighter">ID: {memberData.referral_code}</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
          <QRCodeSVG value={memberData.id} size={140} />
        </div>
        <p className="text-[10px] mt-2 font-bold text-gray-400 uppercase tracking-widest">Scan QR ini saat bertransaksi</p>
      </div>

      {/* SEKSI RIWAYAT POIN DENGAN TANGGAL */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Riwayat Mutasi</h3>
          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold text-slate-500">10 TERBARU</span>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium italic">Belum ada transaksi poin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 leading-tight">{item.description}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                    📅 {formatDateTime(item.created_at)}
                  </p>
                </div>
                <div className="text-lg font-black text-green-600 ml-2">
                  +{item.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-4">
        <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest text-center">Bagikan Referral Anda</p>
        <div className="flex gap-2">
          <input type="text" readOnly value={referralLink} className="flex-1 p-2 text-[10px] text-slate-500 bg-white border rounded-lg outline-none" />
          <button onClick={() => { navigator.clipboard.writeText(referralLink); alert('Link disalin!'); }} className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-700 transition">SALIN</button>
        </div>
      </div>

      <button onClick={() => setMemberData(null)} className="w-full mt-4 text-[10px] font-bold text-gray-400 hover:text-red-500 transition tracking-widest uppercase">
        &larr; Ganti Akun Member
      </button>
    </div>
  );
}
