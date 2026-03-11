'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabaseService } from '../../lib/supabase/service';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'manage'>('scan');
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setIsAuthorized(true);
      fetchMembers();
    } else {
      alert("PIN Salah.");
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabaseService().from('members').select('*').order('total_spending', { ascending: false });
    if (data) setMembers(data);
    setLoading(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(members.map(m => ({
      Nama: m.nama, 
      No_HP: m.no_hp, 
      Poin: m.points, 
      Jml_Transaksi: m.transaction_count || 0,
      Total_Belanja: m.total_spending || 0,
      ID: m.referral_code
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Lengkap");
    XLSX.writeFile(wb, `Laporan_Performa_Mitra_${new Date().toLocaleDateString()}.xlsx`);
  };

  const processPoints = async () => {
    setLoading(true);
    const supabase = supabaseService();
    const { data: member } = await supabase.from('members').select('nama, referred_by_id').eq('id', scanResult).single();
    
    if (member?.referred_by_id) {
      const nominalBelanja = Number(amount);
      const bonus = Math.floor(nominalBelanja / 10000);
      
      const { error } = await supabase.rpc('increment_points', { 
        row_id: member.referred_by_id, 
        amount_points: bonus, 
        source_description: `Bonus referral belanja ${member.nama}`,
        spend_amount: nominalBelanja
      });
      
      if (!error) alert("Poin & Transaksi berhasil dicatat!");
    } else {
      alert("Pembeli Umum: Tidak ada potongan/poin referral.");
    }
    setScanResult(null); setAmount(''); setLoading(false);
    fetchMembers();
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-2xl border-t-4 border-blue-600">
        <h1 className="text-xl font-bold mb-4 text-center">Admin Mutif</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <input type="password" placeholder="PIN Admin" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 border rounded-xl text-center text-2xl tracking-widest" />
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">MASUK</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-3xl border-t-8 border-blue-600 mb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">DASHBOARD ADMIN</h1>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('scan')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'scan' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>SCAN QR</button>
          <button onClick={() => setActiveTab('manage')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>MITRA AKTIF</button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="max-w-sm mx-auto">
          {!scanResult ? (
            <div className="rounded-3xl overflow-hidden border-4 border-blue-50">
              <Scanner onScan={(res) => res[0]?.rawValue && setScanResult(res[0].rawValue)} allowMultiple={false} scanDelay={500} />
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-blue-200 space-y-4">
              <input type="number" placeholder="Nominal Belanja (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 border-2 rounded-2xl text-center font-bold text-xl outline-none focus:border-blue-500" />
              <button onClick={processPoints} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg">PROSES TRANSAKSI</button>
              <button onClick={() => setScanResult(null)} className="w-full text-xs font-bold text-slate-400 uppercase text-center">Batal</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-400 text-sm uppercase">Monitoring Performa Reseller</h3>
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition">📥 Download Laporan</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-4 text-left">Reseller</th>
                  <th className="p-4 text-center">Poin</th>
                  <th className="p-4 text-center">Jml Transaksi</th>
                  <th className="p-4 text-right">Total Omset</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-slate-50 hover:bg-blue-50/30 transition">
                    <td className="p-4 font-bold text-slate-700">{m.nama}</td>
                    <td className="p-4 text-center text-blue-600 font-black">{m.points}</td>
                    <td className="p-4 text-center font-bold text-slate-600">{m.transaction_count || 0}x</td>
                    <td className="p-4 text-right font-black text-green-600">{formatRupiah(m.total_spending || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
