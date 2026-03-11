'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseService } from '../../lib/supabase/service';
import { QRCodeSVG } from 'qrcode.react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const supabase = supabaseService();

  // State untuk form
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [referralDari, setReferralDari] = useState('');
  const [memberBaru, setMemberBaru] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Ambil kode pengajak dari URL (?ref=...)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralDari(ref);
  }, [searchParams]);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('members')
      .insert([
        { 
          nama, 
          no_hp: noHp, 
          referred_by_id: referralDari || null,
          referral_code: `REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        }
      ])
      .select()
      .single();

    if (error) {
      alert("Gagal daftar: " + error.message);
    } else {
      setMemberBaru(data);
    }
    setLoading(false);
  };

  if (memberBaru) {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Pendaftaran Berhasil!</h2>
        <p className="mb-4 text-center">Simpan QR Code ini untuk ditunjukkan saat bertransaksi.</p>
        <QRCodeSVG value={memberBaru.id} size={200} />
        <p className="mt-4 font-mono text-sm bg-gray-100 p-2 rounded">{memberBaru.id}</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-blue-500 underline">Daftar Member Lain</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Daftar Member Loyalty</h1>
      <form onSubmit={handleDaftar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nama Lengkap</label>
          <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Contoh: Efran Talks" />
        </div>
        <div>
          <label className="block text-sm font-medium">No. HP (WhatsApp)</label>
          <input type="tel" required value={noHp} onChange={(e) => setNoHp(e.target.value)} className="w-full p-2 border rounded-md" placeholder="08123456789" />
        </div>
        {referralDari && (
          <div className="p-2 bg-blue-50 text-blue-700 text-sm rounded">
            ✨ Anda diundang oleh: <strong>{referralDari}</strong>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
          {loading ? 'Memproses...' : 'Daftar & Buat QR Code'}
        </button>
      </form>
    </div>
  );
}