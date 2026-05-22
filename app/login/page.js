'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleAction = async (type) => {
    setLoading(true)
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    
    if (error) alert(error.message)
    else if (type === 'signup') alert("Cek email atau silakan langsung login jika sudah konfirmasi!")
    else router.push('/')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* KIRI: Visual & Info (Hidden di HP) */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073" 
            className="w-full h-full object-cover opacity-40" 
            alt="Background"
          />
        </div>
        <div className="relative z-10 text-white max-w-md text-center">
          <h2 className="text-5xl font-bold mb-6">Mulai Petualanganmu.</h2>
          <p className="text-lg text-blue-100 mb-8">Dapatkan akses eksklusif ke destinasi tersembunyi dan promo harga terbaik setiap hari.</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="font-bold text-2xl">500+</p>
              <p className="text-sm">Destinasi</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="font-bold text-2xl">10k+</p>
              <p className="text-sm">Travelers</p>
            </div>
          </div>
        </div>
      </div>

      {/* KANAN: Form Login */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang</h1>
            <p className="text-gray-500">Silakan masuk ke akun TravelKu kamu</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAction('login') }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" placeholder="contoh@email.com" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" placeholder="••••••••" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-blue-600 font-medium">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" /> Ingat saya
              </label>
              <button type="button" className="hover:underline">Lupa password?</button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition duration-300 shadow-lg shadow-blue-200 uppercase tracking-wider">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Belum punya akun?</p>
            <button 
              onClick={() => handleAction('signup')}
              className="mt-2 w-full border-2 border-gray-200 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-100 transition duration-300">
              Daftar Akun Baru
            </button>
          </div>

          {/* Footer Form */}
          <p className="mt-10 text-center text-xs text-gray-400">
            &copy; 2026 TravelKu. Semua hak dilindungi undang-undang.
          </p>
        </div>
      </div>
    </div>
  )
}