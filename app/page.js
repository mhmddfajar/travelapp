'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell';
import ReviewModal from '@/components/ReviewModal'; 
import ChatBot from '@/components/ChatBot' 

// Ikon SVG per Kategori
const categoryIcons = {
  Semua: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
  ),
  Pantai: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
  ),
  Gunung: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21l7.5-12L15 15l6-9v15H3z"></path></svg>
  ),
  Budaya: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21"></path></svg>
  ),
  Danau: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c3.5 0 6.5-1.5 6.5-3.5S15.5 4 12 4 5.5 5.5 5.5 7.5 8.5 11 12 11zM3 14c2.5 1.5 5.5 1.5 8 0s5.5-1.5 8 0M4 18c2.5 1.5 5.5 1.5 8 0s5.5-1.5 8 0" />
    </svg>
  ),
}

const defaultCategoryIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
)

// 🚀 KOMPONEN KARTU DESTINASI (Strukturnya dirapikan agar ulasan real-time bekerja bray)
function DestinationCard({ item, onBook, onClick }) {
  const [liked, setLiked] = useState(false)

  // Ambil array ulasan dari properti item hasil query Supabase
  const itemReviews = item?.reviews || [];
  const totalRating = itemReviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating = itemReviews.length > 0 
    ? (totalRating / itemReviews.length).toFixed(1) 
    : 'New';

  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group flex flex-col h-full"
    >
      {/* Gambar */}
      <div className="relative h-44 sm:h-48 overflow-hidden flex-shrink-0">
        <img
          src={item.image_url || 'https://via.placeholder.com/400x250'}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay Rating Dinamis */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-700">{averageRating}</span>
          {itemReviews.length > 0 && (
            <span className="text-slate-400 font-normal text-[10px]">({itemReviews.length})</span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
          className="absolute top-2.5 right-2.5 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          {liked ? (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          )}
        </button>
      </div>

      {/* Konten */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1 line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path></svg>
          <span className="line-clamp-1">{item.location}</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Mulai dari</p>
            <p className="text-base font-extrabold text-orange-500">
              Rp {Number(item.price)?.toLocaleString('id-ID')}
              <span className="text-[10px] text-slate-400 font-normal"> /orang</span>
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBook(item); }}
            className="bg-[#0194f3] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
          >
            Pesan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [destinations, setDestinations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modal Booking & Review State
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDest, setSelectedDest] = useState(null)
  const [travelDate, setTravelDate] = useState('')
  const [totalTickets, setTotalTickets] = useState(1)
  const [isBooking, setIsBooking] = useState(false)
  
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState({ type: null, value: 0, message: '' })
  const [promoError, setPromoError] = useState('')

  const router = useRouter()

 useEffect(() => {
  const getData = async () => {
    setLoading(true)
    
    // 1. Ambil session user login
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)

    // 2. Tarik data destinasi + seluruh isi ulasannya
    const { data, error } = await supabase
      .from('destinations')
      .select('*, reviews(*)') 
    
    if (error) {
      console.error("Gagal ambil data wisata bray:", error)
    } else {
      setDestinations(data || [])
      setFiltered(data || [])
    }
    setLoading(false)
  }
  
  getData()

  // Listener buat mantau user login/logout secara real-time
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null)
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

  // Fungsi Filter Search & Category
  useEffect(() => {
    const results = destinations.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase())
      const matchCategory = selectedCategory === 'Semua' ? true : item.category === selectedCategory
      return matchSearch && matchCategory
    })
    setFiltered(results)
  }, [search, selectedCategory, destinations])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const openBookingModal = (item) => {
    if (!user) {
      alert("Silakan login untuk melakukan pemesanan")
      router.push('/login')
    } else {
      setSelectedDest(item)
      setTravelDate('')
      setTotalTickets(1)
      setIsModalOpen(true)
      
      setPromoCode('')
      setAppliedDiscount({ type: null, value: 0, message: '' })
      setPromoError('')
    }
  }

  const handleApplyPromo = () => {
    setPromoError('')
    const code = promoCode.trim().toUpperCase()

    if (!code) {
      setPromoError('Masukkan kode promo terlebih dahulu bray!')
      return
    }

    if (code === 'IKUTIKAN') {
      setAppliedDiscount({
        type: 'PERCENT',
        value: 15,
        message: '🎉 Mantap! Promo IKUTIKAN berhasil dipakai (Diskon 15%)'
      })
    } else if (code === 'JALANASIK') {
      setAppliedDiscount({
        type: 'FIXED',
        value: 50000,
        message: '🎉 Asik! Promo JALANASIK berhasil dipakai (Potongan Rp 50.000)'
      })
    } else {
      setPromoError('❌ Yah, kode promo gak valid atau udah hangus bray.')
      setAppliedDiscount({ type: null, value: 0, message: '' })
    }
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!user || !selectedDest || !travelDate || totalTickets < 1) return

    setIsBooking(true)

    const hargaAsliTotal = selectedDest.price * totalTickets
    let totalPotongan = 0

    if (appliedDiscount.type === 'PERCENT') {
      totalPotongan = hargaAsliTotal * (appliedDiscount.value / 100)
    } else if (appliedDiscount.type === 'FIXED') {
      totalPotongan = appliedDiscount.value
    }

    const hargaFinal = Math.max(0, hargaAsliTotal - totalPotongan)

    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        destination_id: selectedDest.id,
        travel_date: travelDate,
        total_tickets: totalTickets,
        total_price: hargaFinal,
        status: 'Pending'
      })
      .select('id')
      .single()

    setIsBooking(false)
    
    if (error) {
      alert("Gagal melakukan pemesanan: " + error.message)
    } else {
      setIsModalOpen(false)
      router.push(`/checkout/${newBooking.id}`)
    }
  }

  const categories = ['Semua', ...new Set(destinations.map(d => d.category).filter(Boolean))]

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f3f7]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#0194f3] mb-3"></div>
      <p className="text-[#0194f3] font-medium text-sm">Memuat destinasi...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f2f3f7] font-sans">

      {/* ===== NAVBAR + HERO BIRU ===== */}
      <header className="bg-[#0194f3] relative pb-16 sm:pb-20">

        {/* Nav Bar */}
        <nav className="px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">TravelKu</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 relative">
            {user ? (
              <>
                <NotificationBell userId={user.id} />

                <div className="hidden md:flex items-center gap-3">
                  <span className="text-xs text-white/80 font-medium">{user.email}</span>
                  
                  <button 
                    onClick={() => router.push('/bookings')} 
                    className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-semibold transition-colors bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg cursor-pointer"
                  >
                    Pesanan
                  </button>

                  <button 
                    onClick={handleLogout} 
                    className="text-white/90 hover:text-white text-xs font-semibold bg-white/10 hover:bg-red-500/80 px-3 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Keluar
                  </button>
                </div>

                <div className="md:hidden relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase border border-white/20 shadow-inner transition cursor-pointer"
                  >
                    {user.email?.substring(0, 1)}
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium">Akun Saya</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/bookings');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0194f3] flex items-center gap-2 transition-colors"
                      >
                        🎫 Pesanan Saya
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-50"
                      >
                        🚪 Keluar Akun
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => router.push('/login')} 
                className="bg-white text-[#0194f3] px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
              >
                Masuk
              </button>
            )}
            </div>
          </div>
        </nav>

        {/* Hero Text */}
        <div className="text-center px-6 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Mau pergi ke mana?</h1>
          <p className="text-blue-100 text-sm max-w-md mx-auto">Temukan destinasi impian dengan harga terbaik dan pengalaman tak terlupakan.</p>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute -bottom-6 left-0 right-0 px-4 sm:px-6 z-20">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-2 flex items-center gap-2">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari destinasi atau kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0194f3]/30 transition-all"
              />
            </div>
            <button className="bg-[#0194f3] text-white p-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== CATEGORY SCROLLBAR ===== */}
      <section className="pt-12 pb-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-5 overflow-x-auto no-scrollbar py-2 px-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex flex-col items-center gap-2 min-w-[64px] group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#0194f3] text-white shadow-md shadow-blue-200'
                    : 'bg-white text-slate-500 shadow-sm group-hover:shadow-md group-hover:text-[#0194f3]'
                }`}>
                  {categoryIcons[cat] || defaultCategoryIcon}
                </div>
                <span className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'text-[#0194f3]' : 'text-slate-500 group-hover:text-slate-700'
                }`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESTINATION GRID ===== */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h2 className="text-lg font-bold text-slate-800">
              {selectedCategory === 'Semua' ? 'Destinasi Populer' : `Destinasi ${selectedCategory}`}
            </h2>
            <span className="text-xs text-slate-400 font-medium">{filtered.length} destinasi</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((item) => (
                <DestinationCard 
                  key={item.id} 
                  item={item} 
                  onBook={openBookingModal} 
                  onClick={() => setSelectedDestination(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Destinasi tidak ditemukan</h3>
              <p className="text-slate-400 text-sm">
                Pencarian &quot;{search}&quot; {selectedCategory !== 'Semua' ? `di kategori "${selectedCategory}"` : ''} tidak ada hasil.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-xs">
          <p>&copy; 2026 TravelKu. All rights reserved.</p>
          <p className="mt-1 text-slate-400">Developed for IT Practicum.</p>
        </div>
      </footer>

      {/* ===== MODAL BOOKING (DENGAN FITUR PROMO) ===== */}
      {isModalOpen && selectedDest && (() => {
        const hargaAsliTotal = selectedDest.price * totalTickets
        let totalPotongan = 0

        if (appliedDiscount.type === 'PERCENT') {
          totalPotongan = hargaAsliTotal * (appliedDiscount.value / 100)
        } else if (appliedDiscount.type === 'FIXED') {
          totalPotongan = appliedDiscount.value
        }

        const hargaFinal = Math.max(0, hargaAsliTotal - totalPotongan)

        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isBooking && setIsModalOpen(false)}></div>

            <div className="relative bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 md:p-8 shadow-2xl slideUpOrFade">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden"></div>

              {!isBooking && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}

              <h3 className="text-xl font-bold text-slate-800 mb-1">Pesan Tiket</h3>
              <p className="text-slate-500 text-sm mb-5 pb-4 border-b border-slate-100">{selectedDest.name} — {selectedDest.location}</p>

              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Perjalanan</label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl p-3.5 focus:ring-2 focus:ring-[#0194f3] focus:border-[#0194f3] outline-none transition-all cursor-pointer text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Tiket</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalTickets}
                    onChange={(e) => setTotalTickets(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl p-3.5 focus:ring-2 focus:ring-[#0194f3] focus:border-[#0194f3] outline-none transition-all text-sm"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Punya Kode Promo?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan Kode Promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0194f3] uppercase placeholder:normal-case"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                  {appliedDiscount.message && <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">{appliedDiscount.message}</p>}
                  {promoError && <p className="text-[11px] text-red-500 font-semibold mt-1.5">{promoError}</p>}
                </div>

                <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Harga per tiket</span>
                    <span>Rp {Number(selectedDest.price).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Jumlah</span>
                    <span>x{totalTickets}</span>
                  </div>
                  
                  {totalPotongan > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Potongan Promo</span>
                      <span>- Rp {totalPotongan.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-slate-800 border-t border-blue-100 pt-2 items-end">
                    <span>Total Harga</span>
                    <div className="text-right">
                      {totalPotongan > 0 && (
                        <p className="text-xs text-slate-400 font-normal line-through mb-0.5">
                          Rp {hargaAsliTotal.toLocaleString('id-ID')}
                        </p>
                      )}
                      <span className="text-[#0194f3] text-lg font-black">
                        Rp {hargaFinal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-[#0194f3] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-200/50 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
                >
                  {isBooking ? (
                    <span className="animate-pulse">Memproses pemesanan...</span>
                  ) : (
                    'Pesan Sekarang'
                  )}
                </button>
              </form>
            </div>
          </div>
        )
      })()}

      {/* ===== MODAL DETAIL WISATA & REVIEW ===== */}
      <ReviewModal 
        selectedDestination={selectedDestination} 
        onClose={() => setSelectedDestination(null)} 
        onBookNow={(targetDest) => openBookingModal(targetDest)} 
      />

      {/* ===== KOMPONEN SMART CHAT BOT ASISTEN ===== */}
      <ChatBot 
        destinations={destinations} 
        onBookNow={openBookingModal} 
      />
    
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .slideUpOrFade {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (min-width: 768px) {
          .slideUpOrFade {
            animation: fadeIn 0.3s ease-out forwards;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
}