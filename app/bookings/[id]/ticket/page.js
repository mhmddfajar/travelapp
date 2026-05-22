'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

export default function TicketPage({ params }) {
  const { id } = use(params)
  const [booking, setBooking] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          destinations (*)
        `)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()

      if (error || !data) {
        alert('Tiket tidak ditemukan atau Anda tidak memiliki akses.')
        router.push('/bookings')
        return
      }

      if (data.status !== 'Success') {
        alert('E-Tiket hanya tersedia untuk pesanan yang sudah berhasil (Success).')
        router.push('/bookings')
        return
      }

      setBooking(data)
      setLoading(false)
    }

    fetchTicket()
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f3f7]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#0194f3] mb-3"></div>
      <p className="text-[#0194f3] font-medium text-sm">Memuat E-Tiket...</p>
    </div>
  )

  if (!booking) return null

  const dest = booking.destinations
  const totalPrice = booking.total_tickets * dest.price
  const qrValue = `VALID-TICKET-${booking.id}`
  const bookingCode = `TRV-${String(booking.id).padStart(6, '0')}`

  return (
    <div className="min-h-screen bg-[#f2f3f7] font-sans py-8 px-4">

      {/* Tombol Aksi Atas (Tidak dicetak) */}
      <div className="max-w-lg mx-auto flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.push('/bookings')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#0194f3] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Cetak / Simpan PDF
        </button>
      </div>

      {/* ===== KARTU E-TIKET ===== */}
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg overflow-hidden relative print:shadow-none print:rounded-none">

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 select-none">
          <span className="text-[120px] font-black text-slate-900 -rotate-[30deg] whitespace-nowrap tracking-widest">TravelKu</span>
        </div>

        {/* === Header Biru === */}
        <div className="bg-[#0194f3] px-6 py-6 text-white text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight">TravelKu</span>
          </div>
          <h1 className="text-lg font-bold tracking-wide">E-TIKET PERJALANAN</h1>
          <p className="text-blue-100 text-xs mt-1">Tiket elektronik resmi — harap ditunjukkan saat check-in</p>
        </div>

        {/* === Potongan Tiket (Garis Putus-Putus) === */}
        <div className="relative z-10">
          <div className="flex items-center -mx-4">
            <div className="w-8 h-8 bg-[#f2f3f7] rounded-full -ml-4 flex-shrink-0 print:bg-gray-100"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
            <div className="w-8 h-8 bg-[#f2f3f7] rounded-full -mr-4 flex-shrink-0 print:bg-gray-100"></div>
          </div>
        </div>

        {/* === Konten Utama Tiket === */}
        <div className="px-6 py-5 relative z-10">

          {/* Kode Booking */}
          <div className="text-center mb-5">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Nomor Pesanan</p>
            <p className="text-2xl font-extrabold text-slate-800 tracking-wider font-mono">{bookingCode}</p>
            <div className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              ✓ Pembayaran Berhasil
            </div>
          </div>

          {/* Detail Info Grid */}
          <div className="space-y-4 mb-6">
            {/* Destinasi */}
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">{dest.name}</h2>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                  {dest.location}
                </div>
              </div>
            </div>

            {/* Grid Detail */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">Tanggal Perjalanan</p>
                <p className="text-sm text-slate-800 font-bold">{booking.travel_date}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">Jumlah Tiket</p>
                <p className="text-sm text-slate-800 font-bold">{booking.total_tickets} Pax</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">Nama Penumpang</p>
                <p className="text-sm text-slate-800 font-bold">{user?.email}</p>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <p className="text-sm text-slate-600 font-semibold">Total Pembayaran</p>
              <p className="text-xl font-extrabold text-[#0194f3]">Rp {totalPrice.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* === Potongan Tiket Bawah === */}
          <div className="flex items-center -mx-6 mb-5">
            <div className="w-8 h-8 bg-[#f2f3f7] rounded-full -ml-4 flex-shrink-0 print:bg-gray-100"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
            <div className="w-8 h-8 bg-[#f2f3f7] rounded-full -mr-4 flex-shrink-0 print:bg-gray-100"></div>
          </div>

          {/* === QR Code === */}
          <div className="text-center pb-2">
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest mb-3">Scan untuk validasi tiket</p>
            <div className="inline-block bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1e293b"
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-mono tracking-wide">{qrValue}</p>
          </div>
        </div>

        {/* === Footer Tiket === */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100 relative z-10">
          <p className="text-[10px] text-slate-400">Tiket ini sah dan berlaku sebagai bukti pemesanan resmi.</p>
          <p className="text-[10px] text-slate-400 mt-0.5">&copy; 2026 TravelKu — Semua hak dilindungi.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>
    </div>
  )
}
