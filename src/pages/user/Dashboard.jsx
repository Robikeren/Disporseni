import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'

function UserDashboard() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pesanan: 0, keranjang: 0, limbah: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [pesanan, limbah] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('pengajuan_limbah').select('id', { count: 'exact' }).eq('user_id', profile.id),
      ])
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setStats({
        pesanan: pesanan.count || 0,
        limbah: limbah.count || 0,
      })
      setRecentOrders(orders || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700',
      processing: 'bg-blue-50 text-blue-700',
      shipped: 'bg-purple-50 text-purple-700',
      delivered: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700',
    }
    return map[status] || 'bg-gray-50 text-gray-600'
  }

  const statusLabel = (status) => {
    const map = {
      pending: 'Menunggu',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    return map[status] || status
  }

  return (
    <UserLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Selamat datang, {profile?.nama?.split(' ')[0] || 'Pengguna'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Ini ringkasan aktivitas akun kamu</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pesanan', value: stats.pesanan, action: () => navigate('/user/pesanan') },
          { label: 'Pengajuan Limbah', value: stats.limbah, action: () => navigate('/user/limbah') },
          { label: 'Status Verifikasi', value: profile?.verified ? 'Terverifikasi' : 'Belum', action: () => navigate('/user/limbah') },
        ].map((s, i) => (
          <button
            key={i}
            onClick={s.action}
            className="bg-white border border-gray-100 rounded-xl p-5 text-left hover:border-green-200 hover:shadow-sm transition-all"
          >
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Lihat Katalog', to: '/user/katalog' },
            { label: 'Keranjang', to: '/user/keranjang' },
            { label: 'Pesanan Saya', to: '/user/pesanan' },
            { label: 'Fitur Limbah', to: '/user/limbah' },
          ].map((a, i) => (
            <button
              key={i}
              onClick={() => navigate(a.to)}
              className="py-3 px-4 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-green-200 hover:text-green-700 hover:bg-green-50 transition-all"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Pesanan Terbaru</h2>
          <button
            onClick={() => navigate('/user/pesanan')}
            className="text-xs text-green-600 hover:underline"
          >
            Lihat semua
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">Memuat...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Belum ada pesanan</p>
            <button
              onClick={() => navigate('/user/katalog')}
              className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                  <p className="text-xs font-semibold text-gray-900 mt-1">
                    Rp {order.total?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}

export default UserDashboard