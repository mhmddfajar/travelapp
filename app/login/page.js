'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') 
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = mode === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    
    if (error) {
      alert(error.message)
    } else if (mode === 'register') {
      alert("Pendaftaran sukses! Silakan cek email kamu untuk konfirmasi.")
      setMode('login')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* SISI KIRI: Visual */}
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
        </div>
      </div>

      {/* SISI KANAN: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {mode === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
            </h1>
            <p className="text-gray-500">
              {mode === 'login' ? 'Silakan masuk ke akun TravelKu kamu' : 'Daftar untuk memulai perjalanan'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                placeholder="Alamat Email" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900"
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900"
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition duration-300 shadow-lg uppercase tracking-wider disabled:bg-blue-400"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            </p>
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="mt-2 w-full border-2 border-gray-200 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-100 transition duration-300"
            >
              {mode === 'login' ? 'Daftar Akun Baru' : 'Kembali ke Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}