'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabase/service';
import * as XLSX from 'xlsx';
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'manage'>('scan');
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);

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
    const { data } = await supabaseService().from('members').select('*').order('points', { ascending: false });
    if (data) setMembers(data);
    setLoading(false);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(members.map(m => ({
      Nama: m.nama, No_HP: m.no_hp, Poin: m.points, ID: m.referral_code
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_Mutif.xlsx`);
  };

  const processPoints = async () => {
    setLoading(true);
    const { data: member } = await supabaseService().from('members').select('nama, referred_by_id').eq('id', scanResult).single();
    if (member?.referred_by_id) {
      const bonus = Math.floor(Number(amount) / 10000);
      const { error } = await supabaseService().rpc('increment_points', { 
        row_id: member.referred_by_id, amount: bonus, source_description: `Bonus dari belanja ${member.nama}` 
      });
      if (!error) alert("Poin berhasil ditambahkan!");
    } else {
      alert("Member tidak memiliki pengajak.");
    }
    setScanResult(null); setAmount(''); setLoading(false);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-lg border-t-4 border-blue-600">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <input type="password" placeholder="Masukkan PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-3 border rounded-xl" />
          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border-t-4 border-blue-600 mb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">ADMIN PANEL</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('scan')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'scan' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Scanner</button>
          <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'manage' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Database</button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 p-2">
          {!scanResult ? (
            <BarcodeScannerComponent
              width="100%"
              height={300}
              onUpdate={(err, result) => {
                if (result) setScanResult(result.getText());
              }}
            />
          ) : (
            <div className="p-4 space-y-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-[10px] font-bold text-green-600 uppercase">Terdeteksi!</p>
                <p className="text-xs font-mono break-all">{scanResult}</p>
              </div>
              <input type="number" placeholder="Nominal Belanja (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={processPoints} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">
                {loading ? 'Memproses...' : 'Proses Poin'}
              </button>
              <button onClick={() => setScanResult(null)} className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest">Scan Ulang</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold float-right mb-2">Export Excel</button>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
                <th className="p-3 text-left">Nama</th>
                <th className="p-3">Poin</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-3 font-bold">{m.nama}</td>
                  <td className="p-3 text-blue-600 font-black">{m.points}</td>
                  <td className="p-3 text-center space-x-3">
                    <button onClick={() => setEditMember(m)} className="text-blue-500 font-bold">Edit</button>
                    <button onClick={() => { if(confirm("Hapus?")) { supabaseService().from('members').delete().eq('id', m.id).then(fetchMembers) } }} className="text-red-400 font-bold">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
