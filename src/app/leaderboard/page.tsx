'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabase/service';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const supabase = supabaseService();
    // Mengambil 10 member dengan poin tertinggi
    const { data, error } = await supabase
      .from('members')
      .select('nama, points, referral_code')
      .order('points', { ascending: false })
      .limit(10);

    if (data) setLeaders(data);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border-t-4 border-yellow-500">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">🏆 Top 10</h1>
        <p className="text-gray-500 text-sm">Pahlawan Penjualan Bulan Ini</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Menyiapkan panggung juara...</p>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                index === 0 ? 'bg-yellow-50 border-yellow-200' : 
                index === 1 ? 'bg-gray-50 border-gray-200' : 
                index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-gray-400' : 
                  index === 2 ? 'text-orange-500' : 'text-slate-300'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-800 uppercase">{leader.nama}</p>
                  <p className="text-xs text-gray-400">ID: {leader.referral_code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-blue-600">{leader.points}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Poin</p>
              </div>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">Belum ada juara bulan ini. Jadilah yang pertama!</p>
          )}
        </div>
      )}
    </div>
  );
}
