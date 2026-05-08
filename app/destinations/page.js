'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Destinations() {
  const [data, setData] = useState([])
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') // Tendang ke login kalau belum masuk
      } else {
        setUser(session.user)
        fetchDestinations()
      }
    }
    checkUser()
  }, [])

  const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('*')
    setData(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Halo, Traveler! 👋</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
            Keluar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <img src={item.image_url} className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-xl">{item.name}</h3>
                <p className="text-blue-500 text-sm mb-2">{item.location}</p>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{item.description}</p>
                <p className="text-lg font-bold text-orange-500">Rp {item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}