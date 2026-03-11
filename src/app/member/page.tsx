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
    
    // 1. Cari data member
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('*')
      .eq('no_hp', noHp)
      .single();

    if (memberErr || !member) {
      setErrorMsg("Nomor HP tidak ditemukan. Pastikan sudah terdaftar.");
      setLoading(false);
      return;
    } 

    setMemberData(member);

    // 2. Ambil riwayat poin (5 transaksi terakhir)
    const { data: historyData } = await supabase
      .from('point_history')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyData) setHistory(historyData);
    
    setLoading(false);
  };

  // Format tanggal agar enak dibaca
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (!memberData) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Cek Poin Member</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Masukkan nomor WhatsApp Anda yang terdaftar</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="tel" 
            placeholder="Contoh: 08123456789" 
            value={noHp} 
            onChange={(e) => setNoHp(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Mencari Data...' : 'Cek Poin Saya'}
          </button>
          {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
        </form>
      </div>
    );
  }

  const referralLink = `http://localhost:3000/register?ref=${memberData.id}`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border-t-4 border-blue-600 pb-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Halo, {memberData.nama}!</h1>
        <p className="text-gray-500 text-sm">Member ID: {memberData.referral_code}</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center justify-center mb-6">
        <p className="text-gray-600 text-sm mb-1">Total Poin Anda</p>
        <p className="text-5xl font-extrabold text-blue-700">{memberData.points}</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <p className="text-sm font-semibold mb-2">Tunjukkan QR ini saat belanja:</p>
        <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
          <QRCodeSVG value={memberData.id} size={150} />
        </div>
      </div>

      {/* Bagian Riwayat Poin Baru */}
      <div className="mb-6">
        <p className="text-sm font-bold text-slate-700 mb-3">Riwayat Poin Terakhir</p>
        {history.length === 0 ? (
          <p className="text-xs text-center text-gray-400 p-4 border rounded-lg bg-gray-50">Belum ada mutasi poin.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{item.description}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(item.created_at)}</p>
                </div>
                <div className="text-green-600 font-bold text-sm">
                  +{item.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border mb-4">
        <p className="text-sm font-semibold mb-2">Sebar Link Referral Anda:</p>
        <input 
          type="text" 
          readOnly 
          value={referralLink} 
          className="w-full p-2 text-xs text-gray-500 bg-white border rounded mb-2 outline-none" 
        />
        <button 
          onClick={() => {
            navigator.clipboard.writeText(referralLink);
            alert('Link berhasil disalin!');
          }}
          className="w-full bg-green-500 text-white py-2 rounded text-sm font-bold hover:bg-green-600"
        >
          Salin Link Referral
        </button>
      </div>

      <button 
        onClick={() => setMemberData(null)} 
        className="w-full mt-2 text-gray-500 text-sm font-medium hover:text-slate-800 transition"
      >
        Keluar
      </button>
    </div>
  );
}
