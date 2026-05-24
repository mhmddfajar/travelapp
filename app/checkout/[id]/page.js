'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CheckoutPage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const bookingId = params.id
  const router = useRouter()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Pilih Metode, 2: Instruksi Bayar

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, destinations(*)')
        .eq('id', bookingId)
        .single()

      if (error || !data) {
        alert('Data pemesanan tidak ditemukan bray!')
        router.push('/')
      } else {
        setBooking(data)
      }
      setLoading(false)
    }

    if (bookingId) fetchBooking()
  }, [bookingId])

  // simulasi payment!
  const handlePaySimulation = async () => {
    setIsProcessing(true)
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Success' }) // 👈 Diubah dari 'Paid' jadi 'Success'
      .eq('id', bookingId)

    setIsProcessing(false)
    if (error) {
      alert('Gagal memproses pembayaran: ' + error.message)
    } else {
      alert('🎉 Pembayaran Berhasil Disimulasikan! Tiket Anda sudah aktif.')
      router.push('/bookings')
    }
  }
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f3f7]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#0194f3] mb-3"></div>
      <p className="text-[#0194f3] font-medium text-sm">Memuat instruksi pembayaran...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f2f3f7] p-4 sm:p-6 font-sans text-slate-800">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header Biru Khas Traveloka */}
        <div className="bg-[#0194f3] p-5 text-white text-center">
          <h2 className="text-lg font-bold tracking-tight">Proses Pembayaran</h2>
          <p className="text-xs text-blue-100 mt-0.5">Selesaikan pembayaran untuk mengamankan tiket Anda</p>
        </div>

        {/* Ringkasan Pesanan Ringkas */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-slate-700">{booking.destinations?.name}</p>
            <p className="text-slate-400 mt-0.5">🗓️ {booking.travel_date} | 🎫 {booking.total_tickets} Tiket</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-medium">Total Tagihan</p>
            <p className="text-sm font-black text-orange-500">Rp {booking.total_price?.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* STEP 1: PILIH METODE PEMBAYARAN */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Pilih Metode Transfer / E-Wallet</h3>
            
            {/* Opsi Virtual Account */}
            <div 
              onClick={() => setSelectedMethod('BCA')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedMethod === 'BCA' ? 'border-[#0194f3] bg-blue-50/40' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white font-black text-[10px] px-2 py-1 rounded">BCA</div>
                <span className="text-xs font-bold text-slate-700">BCA Virtual Account</span>
              </div>
              <input type="radio" checked={selectedMethod === 'BCA'} readOnly className="accent-[#0194f3]" />
            </div>

            <div 
              onClick={() => setSelectedMethod('MANDIRI')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedMethod === 'MANDIRI' ? 'border-[#0194f3] bg-blue-50/40' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 text-blue-900 font-black text-[10px] px-1.5 py-1 rounded">mandırı</div>
                <span className="text-xs font-bold text-slate-700">Mandiri Virtual Account</span>
              </div>
              <input type="radio" checked={selectedMethod === 'MANDIRI'} readOnly className="accent-[#0194f3]" />
            </div>

            {/* Opsi E-Wallet */}
            <div 
              onClick={() => setSelectedMethod('QRIS')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedMethod === 'QRIS' ? 'border-[#0194f3] bg-blue-50/40' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-black text-[9px] px-2 py-1 rounded">QRIS</div>
                <span className="text-xs font-bold text-slate-700">Gopay / OVO / Dana / LinkAja</span>
              </div>
              <input type="radio" checked={selectedMethod === 'QRIS'} readOnly className="accent-[#0194f3]" />
            </div>

            <button
              disabled={!selectedMethod}
              onClick={() => setStep(2)}
              className="w-full bg-[#0194f3] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm mt-4 shadow-md shadow-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        )}

        {/* STEP 2: HALAMAN INSTRUKSI & SIMULASI BAYAR */}
        {step === 2 && (
          <div className="p-5 text-center space-y-5">
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-600 font-medium">
              ⏰ Selesaikan pembayaran dalam waktu <span className="font-bold">10:00 menit</span>
            </div>

            {/* Tampilan Kondisional Berdasarkan Pilihan VA / QRIS */}
            {selectedMethod === 'QRIS' ? (
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs font-semibold text-slate-600">Scan Kode QRIS berikut bray:</p>
                {/* QR Code Dummy Menggunakan API Open Source Gratisan */}
                <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TravelKu-BookingID-${bookingId}`} 
                    alt="QRIS Dummy"
                    className="w-44 h-44"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Bisa di-scan via Gojek, OVO, Dana, dll.</p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nomor Virtual Account ({selectedMethod})</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="text-xl font-black text-slate-700 tracking-wider">88012 {bookingId.substring(0, 5)}</span>
                  <button 
                    onClick={() => alert('Nomor VA disalin bray!')} 
                    className="text-[10px] bg-white text-[#0194f3] border border-slate-200 px-2 py-1 rounded font-bold active:scale-95 transition-transform"
                  >
                    Salin
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                disabled={isProcessing}
                onClick={handlePaySimulation}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50 flex justify-center items-center"
              >
                {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi Pembayaran'}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-slate-400 hover:text-slate-600 font-semibold text-xs mt-3 transition-colors cursor-pointer"
              >
                Kembali & Ubah Metode
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}