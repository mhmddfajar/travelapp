'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [destinations, setDestinations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        const { data } = await supabase.from('destinations').select('*')
        setDestinations(data || [])
        setFiltered(data || [])
        setLoading(false)
      }
    }
    getData()
  }, [router])

  // Fungsi Filter Search
  useEffect(() => {
    const results = destinations.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(results)
  }, [search, destinations])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      <p className="text-blue-200 font-medium text-lg animate-pulse">Menyiapkan Perjalananmu...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. HERO SECTION WITH BACKGROUND VIDEO OVERLAY */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        {/* Background Video (Fallback Image) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068" 
            className="w-full h-full object-cover opacity-30 scale-105 blur-sm" 
            alt="Hero Background"
          />
          {/* Kamu bisa ganti ini dengan tag <video> jika punya file video */}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>

        {/* Content Hero */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <span className="inline-block bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-500/20 backdrop-blur-sm">
            Eksklusif di TravelKu
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            Tulis Cerita <span className="text-blue-500">Petualanganmu</span> Sendiri.
          </h1>
          <p className="text-slate-300 max-w-2xl text-xl mb-12 leading-relaxed">
            Dari puncak gunung salju hingga pantai pasir putih, temukan destinasi impian dengan penawaran terbaik dan layanan premium.
          </p>

          {/* Premium Search Bar */}
          <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl p-3 rounded-full border border-white/10 shadow-2xl shadow-blue-500/10 flex items-center gap-3">
            <div className="flex-1 relative">
              <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Cari keajaiban dunia (contoh: Labuan Bajo...)"
                className="w-full p-4 pl-14 rounded-full bg-slate-800/50 text-white border-none focus:ring-2 focus:ring-blue-500 shadow-inner outline-none transition-all placeholder:text-slate-500"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
              Temukan
            </button>
          </div>
        </div>

        {/* Custom Navbar (Inside Hero for style) */}
        <nav className="absolute top-0 left-0 w-full z-30 py-6 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-lg px-6 py-4 rounded-full border border-white/10">
            <div className="flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="bg-blue-600 p-2.5 rounded-full shadow-lg shadow-blue-600/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 2 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tighter">Travel<span className="text-blue-500">Ku</span></span>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="hidden lg:block text-sm font-medium text-slate-300">Logged in as: <span className="text-white font-bold">{user?.email}</span></span>
              <button onClick={handleLogout} className="bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-slate-700 hover:border-red-700 shadow-md">
                Keluar
              </button>
            </div>
          </div>
        </nav>
      </section>

      {/* 2. DESTINASI SECTION WITH GLOW CARDS */}
      <section className="relative z-20 max-w-7xl mx-auto p-6 md:p-12 -mt-20">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Penawaran Eksklusif</h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Destinasi <span className="text-blue-500">Pilihan</span> Minggu Ini</h2>
          </div>
          <p className="text-slate-400 text-lg font-medium border-l-2 border-blue-500 pl-4">
            Hasil pencarian: <span className="text-white font-bold text-2xl">{filtered.length}</span> tempat menakjubkan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((item, index) => (
            <div key={item.id} className={`group relative bg-slate-900 rounded-[30px] overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 hover:border-blue-500/50 hover:shadow-blue-500/20 hover:-translate-y-2 animate-fadeIn`} style={{animationDelay: `${index * 100}ms`}}>
              
              {/* Image with Gradient Overlay on hover */}
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/400x250'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                
                {/* Location Badge */}
                <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{item.location}</span>
                </div>
              </div>

              {/* Content Card */}
              <div className="p-8 relative">
                <h2 className="text-3xl font-extrabold text-white mb-3 group-hover:text-blue-400 transition-colors tracking-tight">{item.name}</h2>
                <p className="text-slate-400 text-base leading-relaxed line-clamp-2 mb-8 h-12">
                  {item.description || "Rasakan keajaiban alam dan budaya yang tak tertandingi di destinasi legendaris ini. Pengalaman sekali seumur hidup menantimu."}
                </p>
                
                <div className="flex justify-between items-center border-t border-slate-800 pt-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Harga Mulai</p>
                    <p className="text-2xl font-black text-orange-400 font-mono">
                      <span className="text-sm font-normal text-slate-400">Rp</span> {Number(item.price)?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95">
                    Pesan Sekarang
                  </button>
                </div>
              </div>

              {/* Subtle Glow Effect on Hover */}
              <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 z-0"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-24 bg-slate-900 rounded-[30px] border-4 border-dashed border-slate-800 flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 2 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-slate-500 text-xl font-medium italic mb-2">Maaf, petualangan ke "{search}" belum tersedia.</p>
            <p className="text-slate-600 text-sm">Coba cari destinasi lain yang tak kalah seru!</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-20 py-10 px-6 border-t border-slate-800 bg-black/30">
        <div className="max-w-7xl mx-auto text-center text-slate-600 text-sm">
          <p>&copy; 2026 TravelKu Premium Experience. All rights reserved.</p>
          <p className="mt-2 text-xs">Developed by Team Blue & Team Red for IT Practicum.</p>
        </div>
      </footer>

      {/* Tambahkan CSS Animasi di globals.css */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

    </main>
  )
}