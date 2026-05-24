'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // State untuk modal ubah tanggal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [newTravelDate, setNewTravelDate] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // State filter tabs (visual)
  const [activeTab, setActiveTab] = useState('Semua Pesanan')
  const tabs = ['Semua Pesanan', 'Menunggu Pembayaran', 'Selesai']

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }
    
    setUser(session.user)

    // Fetch bookings with joined destinations
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        destinations (*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error("Error fetching bookings:", error)
    }

    setBookings(data || [])
    setLoading(false)
  }

  // Handle Batalkan Pesanan
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled' })
      .eq('id', bookingId)

    if (error) {
      alert("Gagal membatalkan pesanan: " + error.message)
    } else {
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
      )
    }
  }

  const openEditDateModal = (booking) => {
    setSelectedBooking(booking)
    setNewTravelDate(booking.travel_date)
    setIsEditModalOpen(true)
  }

  const submitUpdateDate = async (e) => {
    e.preventDefault()
    if (!selectedBooking || !newTravelDate) return

    setIsUpdating(true)
    const { error } = await supabase
      .from('bookings')
      .update({ travel_date: newTravelDate })
      .eq('id', selectedBooking.id)

    setIsUpdating(false)
    if (error) {
      alert("Gagal memperbarui tanggal: " + error.message)
    } else {
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, travel_date: newTravelDate } : b)
      )
      setIsEditModalOpen(false)
    }
  }

  // Helper warna badge status
const getStatusStyle = (status) => {
  switch (status) {
    case 'Paid':
    case 'Success':
      return 'bg-green-100 text-green-700' // 👈 Ini warna ijo bawaan lu bray!
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-amber-100 text-amber-700' // Warna kuning untuk Pending
  }
}
  
  // Helper label status
const getStatusLabel = (status) => {
  switch (status) {
    case 'Paid':
    case 'Success': 
      return 'Berhasil'
    case 'Cancelled': 
      return 'Dibatalkan'
    default: 
      return 'Menunggu Pembayaran'
  }
}

  // Filter logika dummy sesuai tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Semua Pesanan') return true
    if (activeTab === 'Menunggu Pembayaran') return b.status === 'Pending'
    if (activeTab === 'Selesai') return b.status === 'Success'
    return true
  })

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f3f7] text-slate-600">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0194f3] mb-4"></div>
      <p className="font-medium text-[#0194f3]">Memuat Pesanan Saya...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f2f3f7] text-slate-800 font-sans pb-12">
      {/* Header Ala Traveloka */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-lg font-bold text-slate-800">Pesanan Saya</h1>
        </div>
        
        {/* Tabs Filter */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-slate-200">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab 
                  ? 'border-[#0194f3] text-[#0194f3]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm mt-4">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada pesanan</h3>
             <p className="text-slate-500 text-sm mb-6">Yuk, rencanakan liburanmu dan pesan sekarang!</p>
             <button 
               onClick={() => router.push('/')}
               className="bg-[#0194f3] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-sm text-sm"
             >
               Cari Destinasi
             </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              const dest = booking.destinations
              if (!dest) return null
              
             const totalPrice = booking.total_price !== null && booking.total_price !== undefined
              ? booking.total_price 
              : booking.total_tickets * dest.price;
              const statusStyle = getStatusStyle(booking.status)
              
              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-md transition-shadow">
                  
                  {/* Bagian Gambar */}
                  <div className="w-full md:w-48 h-40 md:h-36 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      <span className="text-[10px] font-bold text-white uppercase">{dest.category}</span>
                    </div>
                  </div>
                  
                  {/* Bagian Konten Kanan */}
                  <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Header Card: Judul dan Status */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-tight mb-1">{dest.name}</h2>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                           <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                           {dest.location}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border-transparent ${statusStyle}`}>
                         {getStatusLabel(booking.status)}
                      </div>
                    </div>

                    {/* Info Ringkas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Tanggal Perjalanan</p>
                        <p className="text-sm text-slate-800 font-medium">{booking.travel_date}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Jumlah Tiket</p>
                        <p className="text-sm text-slate-800 font-medium">{booking.total_tickets} Pax</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Total Harga</p>
                        <p className="text-base text-[#0194f3] font-bold">Rp {totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    {/* Aksi User HANYA jika status Pending */}
                    {booking.status === 'Pending' && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-1 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors text-center"
                        >
                          Batalkan Pesanan
                        </button>
                        <button 
                          onClick={() => openEditDateModal(booking)}
                          className="w-full sm:w-auto px-5 py-2.5 border border-[#0194f3] text-[#0194f3] hover:bg-blue-50 rounded-xl text-sm font-bold transition-colors text-center"
                        >
                          Ubah Tanggal
                        </button>
                      </div>
                    )}
                    {/* 2. AKSI USER JIKA STATUS SUCCESS (SEJAJAR, DI LUAR BLOK PENDING) */}
                   {(booking.status === 'Paid' || booking.status === 'Success') && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-1 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => router.push(`/bookings/${booking.id}/ticket`)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#0194f3] hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        🎫 Lihat E-Tiket Resmi
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL UBAH TANGGAL (MOBILE BOTTOM SHEET & PC CENTER) */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fadeIn">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isUpdating && setIsEditModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 md:p-8 shadow-2xl slideUpOrFade">
            
            {/* Handle bar for mobile */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
            
            {!isUpdating && (
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 right-5 md:top-6 md:right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">Ubah Tanggal</h3>
            <p className="text-slate-500 text-sm mb-6 pb-4 border-b border-slate-100">{selectedBooking.destinations?.name}</p>

            <form onSubmit={submitUpdateDate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Tanggal Baru</label>
                <input 
                  type="date" 
                  required
                  value={newTravelDate}
                  onChange={(e) => setNewTravelDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-[#0194f3] focus:border-[#0194f3] outline-none transition-all cursor-pointer"
                />
              </div>

              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full bg-[#0194f3] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isUpdating ? (
                  <span className="animate-pulse">Menyimpan...</span>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

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
    </div>
  )
}
