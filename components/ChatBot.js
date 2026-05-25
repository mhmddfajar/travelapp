'use client'
import { useState, useEffect, useRef } from 'react'

export default function ChatBot({ destinations, onBookNow }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo bray! 👋 Selamat datang di TravelKu. Ada yang bisa gua bantu buat rencana liburan lu? Ketik aja "pantai", "gunung", atau "murah" buat liat rekomendasi gokil!' }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  // Auto scroll ke pesan paling bawah tiap ada chat baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userText = inputValue.trim()
    const userMessage = { id: Date.now(), sender: 'user', text: userText }
    
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Simulasi bot mikir sebentar (500ms) biar makin realistis
    setTimeout(() => {
      const botResponse = generateBotResponse(userText.toLowerCase())
      setMessages((prev) => [...prev, botResponse])
    }, 500)
  }

  // LOGIC PINTAR BOT DINAMIS - SEKARANG MENDUKUNG SEMUA KATEGORI & NAMA WISATA LU BRAY!
  const generateBotResponse = (text) => {
    const baseId = Date.now()

    // 1. Sapaan Halo / Pembuka
    if (text.includes('halo') || text.includes('hai') || text.includes('hello') || text === 'p') {
      return { 
        id: baseId, 
        sender: 'bot', 
        text: 'Halo juga bray! Ada yang bisa dibantu? Coba ketik kategori yang lu mau, misalnya: "pantai", "gunung", "budaya", "danau", atau ketik "murah" bray!' 
      }
    }

    // 2. Keyword MURAH / HEMAT / PROMO
    if (text.includes('murah') || text.includes('hemat') || text.includes('promo')) {
      const murahList = [...destinations].sort((a, b) => a.price - b.price).slice(0, 3)
      return {
        id: baseId,
        sender: 'bot',
        text: 'Siap bray, dompet aman sentosa! Ini 3 destinasi paling ramah kantong di TravelKu saat ini:',
        recommendations: murahList
      }
    }

    // 3. PENCARIAN DINAMIS OTOMATIS (Mencakup Budaya, Danau, Pantai, Gunung, dll.)
    // Logic ini otomatis mencocokkan kata kunci user dengan kolom category, name, atau location di database lu bray
    const matchedDestinations = destinations.filter(dest => {
      const categoryName = dest.category ? dest.category.toLowerCase() : ''
      const destName = dest.name ? dest.name.toLowerCase() : ''
      const destLocation = dest.location ? dest.location.toLowerCase() : ''
      
      return text.includes(categoryName) || text.includes(destName) || text.includes(destLocation)
    })

    // Jika ditemukan destinasi yang cocok dari database
    if (matchedDestinations.length > 0) {
      return {
        id: baseId,
        sender: 'bot',
        text: 'Wih pilihan mantap bray! Ini daftar destinasi terbaik di TravelKu yang cocok sama kata kunci lu. Gas langsung klik pesan sebelum kehabisan!',
        recommendations: matchedDestinations
      }
    }

    // 4. Keyword REKOMENDASI UMUM / JALAN-JALAN
    if (text.includes('rekomendasi') || text.includes('jalan') || text.includes('wisata')) {
      const randomList = [...destinations].sort(() => 0.5 - Math.random()).slice(0, 2)
      return {
        id: baseId,
        sender: 'bot',
        text: 'Bingung mau ke mana? Ini gua pilihin acak 2 tempat super premium yang wajib lu coba minimal sekali seumur hidup:',
        recommendations: randomList
      }
    }

    // 5. Jawaban Default jika kata kunci tidak ketemu bray
    return { 
      id: baseId, 
      sender: 'bot', 
      text: 'Waduh bray, gua kurang paham maksud lu. 🤖 Coba ketik kata kunci kategori aja kayak: "pantai", "gunung", "budaya", "danau", atau sebut nama lokasinya langsung biar gua cariin ya bray.' 
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 🔮 TOMBOL BULAT BOT (DI POJOK KANAN BAWAH) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0194f3] hover:bg-blue-600 text-white rounded-full p-4 shadow-xl hover:scale-110 transition-all cursor-pointer flex items-center justify-center animate-bounce"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </button>
      )}

      {/* 💬 KOTAK WIDGET WIDGET CHAT */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header Chat */}
          <div className="bg-[#0194f3] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-full text-lg">🤖</div>
              <div>
                <h4 className="text-xs font-bold tracking-wide">Asisten TravelKu</h4>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online bray
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-sm font-bold cursor-pointer">✕</button>
          </div>

          {/* Isi Pesan (Scrollable) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Balon Chat */}
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#0194f3] text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>

                {/* 🏷️ KARTU REKOMENDASI LIVE (JIKA ADA MATCHING DATA) */}
                {msg.recommendations && (
                  <div className="w-full mt-2 space-y-2 pl-2 border-l-2 border-orange-400">
                    {msg.recommendations.map((dest) => (
                      <div key={dest.id} className="bg-white border border-slate-100 rounded-xl p-2 flex gap-2 items-center shadow-xs">
                        <img src={dest.image_url} alt={dest.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{dest.name}</p>
                          <p className="text-[10px] text-orange-500 font-bold">Rp {dest.price?.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false)
                            onBookNow(dest) // Trigger buka modal booking asli bawaan lu
                          }}
                          className="bg-[#0194f3] hover:bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        >
                          Pesan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Kirim Chat */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Cari Destinasi"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0194f3]"
            />
            <button
              type="submit"
              className="bg-[#0194f3] hover:bg-blue-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Kirim
            </button>
          </form>
        </div>
      )}
    </div>
  )
}