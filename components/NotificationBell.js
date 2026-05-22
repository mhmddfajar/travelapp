'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Ambil data notifikasi pertama kali saat halaman dimuat
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    // 2. LOGIKA REAL-TIME (Dengerin data masuk dari Supabase secara live!)
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Begitu ada data insert baru, langsung selipin ke daftar paling atas
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // 3. Fungsi tandai semua sudah dibaca
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative z-50">
      {/* Tombol Lonceng */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead(); // Otomatis baca semua pas diklik
        }}
        className="relative p-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>

        {/* Badge Angka Merah jika ada yang belum dibaca */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN NOTIFIKASI */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-slate-800">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-sm">Notifikasi</h3>
            {unreadCount > 0 && <span className="text-[11px] text-[#0194f3] font-medium">Baru ({unreadCount})</span>}
          </div>

          <div className="max-h-64 overflow-y-auto split-y divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Belum ada notifikasi baru</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors ${!notif.is_read ? 'bg-blue-50/50 font-medium' : 'bg-white'}`}
                >
                  <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}