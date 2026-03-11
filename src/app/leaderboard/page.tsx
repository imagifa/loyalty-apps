'use client';
import { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabase/service';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabaseService()
        .from('members')
        .select('nama, total_spending, transaction_count')
        .order('total_spending', { ascending: false })
        .limit(10);
      setLeaders(data || []);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(num);
  };

  return (
    <div className="max-w-md mx-auto pt-10 px-6 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Top Reseller</h1>
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Berdasarkan Total Omset</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400 font-bold animate-pulse uppercase text-xs">Menghitung Data...</p>
        ) : (
          leaders.map((m, index) => (
            <div key={index} className={`relative flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${index === 0 ? 'bg-blue-600 border-transparent shadow-xl shadow-blue-200' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className={`font-black uppercase text-sm leading-none mb-1 ${index === 0 ? 'text-white' : 'text-slate-700'}`}>{m.nama}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'text-blue-100' : 'text-slate-400'}`}>{m.transaction_count || 0} Transaksi</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${index === 0 ? 'text-white' : 'text-green-600'}`}>
                  {formatRupiah(m.total_spending || 0)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
