'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
    const supabase = supabaseService();
    const { data } = await supabase.from('members').select('*').order('points', { ascending: false });
    if (data) setMembers(data);
    setLoading(false);
  };

  // FUNGSI EXPORT EXCEL
  const exportToExcel = () => {
    const fileDate = new Date().toISOString().split('T')[0];
    const worksheet = XLSX.utils.json_to_sheet(members.map(m => ({
      Nama: m.nama,
      No_HP: m.no_hp,
      Total_Poin: m.points,
      ID_Member: m.referral_code,
      Tanggal_Daftar: new Date(m.created_at).toLocaleDateString('id-ID')
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Poin");
    XLSX.writeFile(workbook, `Laporan_Poin_Mutif_${fileDate}.xlsx`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus member ini?")) {
      const supabase = supabaseService();
      await supabase.from('members').delete().eq('id', id);
      fetchMembers();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = supabaseService();
    await supabase.from('members').update({ 
      nama: editMember.nama, 
      no_hp: editMember.no_hp 
    }).eq('id', editMember.id);
    setEditMember(null);
    fetchMembers();
  };

  useEffect(() => {
    if (isAuthorized && activeTab === 'scan' && !scanResult) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((result) => {
        setScanResult(result);
        scanner.clear();
      }, (err) => {});
      return () => scanner.clear();
    }
  }, [isAuthorized, activeTab, scanResult]);

  const processPoints = async () => {
    setLoading(true);
    const supabase = supabaseService();
    const { data: member } = await supabase.from('members').select('nama, referred_by_id').eq('id', scanResult).single();

    if (member?.referred_by_id) {
      const bonus = Math.floor(Number(amount) / 10000);
      const deskripsi = `Bonus referral dari belanja ${member.nama}`;
      const { error } = await supabase.rpc('increment_points', { row_id: member.referred_by_id, amount: bonus, source_description: deskripsi });
      if (!error) alert(`Sukses! Pengajak dapat ${bonus} poin.`);
    } else {
      alert("Member ini tidak punya pengajak.");
    }
    setScanResult(null);
    setAmount('');
    setLoading(false);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-xl font-bold mb-4">Akses Admin Mutif</h1>
        <form onSubmit={handleVerify}>
          <input type="password" placeholder="Masukkan PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-2 border mb-4 rounded" />
          <button className="w-full bg-black text-white p-2 rounded">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border-t-4 border-blue-600 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">ADMIN PANEL</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('scan')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'scan' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Scanner</button>
          <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'manage' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Manajemen Member</button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="max-w-md mx-auto">
          {!scanResult ? (
            <div id="reader"></div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Member Terdeteksi</p>
                <p className="font-mono font-bold text-slate-700 break-all">{scanResult}</p>
              </div>
              <input type="number" placeholder="Total Belanja (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <button onClick={processPoints} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {loading ? 'Memproses...' : 'Berikan Poin'}
              </button>
              <button onClick={() => setScanResult(null)} className="w-full text-gray-500 text-sm hover:underline">Batal / Scan Ulang</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export ke Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 border-b">Nama</th>
                  <th className="p-3 border-b">No HP</th>
                  <th className="p-3 border-b">Poin</th>
                  <th className="p-3 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b font-medium">{m.nama}</td>
                    <td className="p-3 border-b text-gray-500">{m.no_hp}</td>
                    <td className="p-3 border-b font-bold text-blue-600">{m.points}</td>
                    <td className="p-3 border-b text-center space-x-4">
                      <button onClick={() => setEditMember(m)} className="text-blue-500 font-bold hover:underline">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-500 font-bold hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Edit Data Member</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">NAMA LENGKAP</label>
                <input type="text" value={editMember.nama} onChange={(e) => setEditMember({...editMember, nama: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">NOMOR WHATSAPP</label>
                <input type="tel" value={editMember.no_hp} onChange={(e) => setEditMember({...editMember, no_hp: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="No HP" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">Simpan</button>
                <button type="button" onClick={() => setEditMember(null)} className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
