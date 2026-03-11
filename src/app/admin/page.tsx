'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabaseService } from '../../lib/supabase/service';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setIsAuthorized(true);
    } else {
      alert("PIN Salah.");
    }
  };

  useEffect(() => {
    if (isAuthorized && !scanResult) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((result) => {
        setScanResult(result);
        scanner.clear();
      }, (err) => {});
      return () => scanner.clear();
    }
  }, [isAuthorized, scanResult]);

  const processPoints = async () => {
    setLoading(true);
    const supabase = supabaseService();
    
    const { data: member } = await supabase
      .from('members')
      .select('referred_by_id')
      .eq('id', scanResult)
      .single();

    if (member?.referred_by_id) {
      const bonus = Math.floor(Number(amount) / 10000);
      const { error } = await supabase.rpc('increment_points', { 
        row_id: member.referred_by_id, 
        amount: bonus 
      });

      if (!error) alert(`Sukses! Pengajak dapat ${bonus} poin.`);
    } else {
      alert("Member ini tidak punya pengajak (Direct Member).");
    }
    
    setScanResult(null);
    setAmount('');
    setLoading(false);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-xl font-bold mb-4">Akses Admin</h1>
        <form onSubmit={handleVerify}>
          <input type="password" placeholder="Masukkan PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-2 border mb-4 rounded" />
          <button className="w-full bg-black text-white p-2 rounded">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Scanner</h1>
      {!scanResult ? (
        <div id="reader"></div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm">Member Terdeteksi:</p>
            <p className="font-mono font-bold break-all">{scanResult}</p>
          </div>
          <input type="number" placeholder="Total Belanja (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded" />
          <button onClick={processPoints} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            {loading ? 'Memproses...' : 'Berikan Poin'}
          </button>
          <button onClick={() => setScanResult(null)} className="w-full text-gray-500">Batal / Scan Ulang</button>
        </div>
      )}
    </div>
  );
}
