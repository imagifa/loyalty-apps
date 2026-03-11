'use client';

import { useState } from 'react';
import { supabaseService } from '../../lib/supabase/service';
import { QRCodeSVG } from 'qrcode.react';

export default function MemberDashboard() {
  const [noHp, setNoHp] = useState('');
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const supabase = supabaseService();
    
    // Cari member berdasarkan No HP
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('no_hp', noHp)
      .single();

    if (error || !data) {
      setErrorMsg("Nomor HP tidak ditemukan. Pastikan sudah terdaftar.");
    } else {
      setMemberData(data);
    }
    setLoading(false);
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

  // Tampilan Dashboard setelah berhasil masuk
  const referralLink = `http://localhost:3000/register?ref=${memberData.id}`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border-t-4 border-blue-600">
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
          <QRCodeSVG value={memberData.id} size={180} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm font-semibold mb-2">Sebar Link Referral Anda:</p>
        <input 
          type="text" 
          readOnly 
          value={referralLink} 
          className="w-full p-2 text-xs text-gray-500 bg-white border rounded mb-2" 
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
        className="w-full mt-6 text-gray-500 text-sm hover:underline"
      >
        Keluar
      </button>
    </div>
  );
}
