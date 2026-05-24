'use client'
import React from 'react'

const DUMMY_REVIEWS = {
  1: [
    { id: 1, name: "Andi Wijaya", rating: 5, comment: "Indah banget sunrisenya! Dingin parah tapi worth it. Sangat direkomendasikan!", date: "2 minggu lalu" },
    { id: 2, name: "Siti Rahma", rating: 4, comment: "Pemandangannya juara, cuma pas ke sana agak ramai aja. Jasa jeep-nya ramah.", date: "1 bulan lalu" }
  ],
  2: [
    { id: 3, name: "Budi Santoso", rating: 5, comment: "Tempat yang magis, megah banget Borobudur. Bersih dan tertata rapi.", date: "3 hari lalu" },
    { id: 4, name: "Dewi Lestari", rating: 5, comment: "Keren sejarahnya, wajib sewa pemandu biar paham cerita reliefnya.", date: "3 minggu lalu" }
  ],
  default: [
    { id: 99, name: "Traveler Asik", rating: 5, comment: "Tempatnya bagus banget, bersih, pelayanannya ramah. Mantap pokoknya!", date: "Baru saja" }
  ]
};

export default function ReviewModal({ selectedDestination, onClose, onBookNow }) {
  if (!selectedDestination) return null;

  const reviews = DUMMY_REVIEWS[selectedDestination.id] || DUMMY_REVIEWS.default;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      {/* Kotak Modal */}
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Tombol Close Silang */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Gambar Utama Destinasi */}
        <div className="h-56 sm:h-72 w-full relative">
          <img 
            src={selectedDestination.image_url || "/placeholder.jpg"} 
            alt={selectedDestination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
            <div>
              <span className="bg-blue-500 text-white text-[10px] uppercase font-extrabold px-2 py-1 rounded-md tracking-wider">
                {selectedDestination.category || 'Wisata'}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">{selectedDestination.name}</h2>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">📍 {selectedDestination.location}</p>
            </div>
          </div>
        </div>

        {/* Konten Detail */}
        <div className="p-6">
          
          {/* Deskripsi Lengkap */}
          <h3 className="font-bold text-sm sm:text-base text-slate-800">Tentang Destinasi</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {selectedDestination.description || 'Nikmati keindahan alam dan pengalaman tak terlupakan di destinasi wisata populer ini bersama keluarga atau teman terdekat Anda.'}
          </p>

          <hr className="my-5 border-slate-100" />

          {/* DETAIL ULASAN */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-800">Ulasan Pengunjung</h3>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
              ⭐ 4.8 <span className="text-slate-400 font-normal">({reviews.length} Ulasan)</span>
            </span>
          </div>

          {/* List Review */}
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">{rev.name}</span>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>
                <div className="flex gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < rev.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">"{rev.comment}"</p>
              </div>
            ))}
          </div>

          {/* ACTION BOTTOM BAR */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Harga per tiket</p>
              <p className="text-lg sm:text-xl font-black text-amber-500">
                Rp {selectedDestination.price?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            
            <button 
              onClick={() => {
                onClose(); // Tutup modal ulasan
                onBookNow(selectedDestination); // Oper destinasi ke form booking bawaan lu
              }}
              className="bg-[#0194f3] hover:bg-[#017ccb] text-white px-5 py-2.5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              Pesan Sekarang 🎫
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}