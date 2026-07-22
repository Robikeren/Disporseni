import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalPesanan: 0,
    pesananPending: 0,
    totalProduk: 0,
    verifikasiPending: 0,
    pengajuanLimbah: 0,
    totalUsers: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentLimbah, setRecentLimbah] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [
        totalPesanan,
        pesananPending,
        totalProduk,
        verifikasiPending,
        pengajuanLimbah,
        totalUsers,
        orders,
        limbah,
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact' }).eq('aktif', true),
        supabase.from('verifikasi_kebun').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('pengajuan_limbah').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('pengajuan_limbah').select('*, profiles(nama)').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalPesanan: totalPesanan.count || 0,
        pesananPending: pesananPending.count || 0,
        totalProduk: totalProduk.count || 0,
        verifikasiPending: verifikasiPending.count || 0,
        pengajuanLimbah: pengajuanLimbah.count || 0,
        totalUsers: totalUsers.count || 0,
      })
      setRecentOrders(orders.data || [])
      setRecentLimbah(limbah.data || [])
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
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Ringkasan aktivitas platform TechLeaf</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pesanan', value: stats.totalPesanan, sub: `${stats.pesananPending} menunggu`, to: '/admin/pesanan', alert: stats.pesananPending > 0 },
          { label: 'Total Pengguna', value: stats.totalUsers, sub: 'pengguna terdaftar', to: null },
          { label: 'Produk Aktif', value: stats.totalProduk, sub: 'produk tersedia', to: '/admin/produk' },
          { label: 'Verifikasi Kebun', value: stats.verifikasiPending, sub: 'menunggu review', to: '/admin/limbah', alert: stats.verifikasiPending > 0 },
          { label: 'Pengajuan Limbah', value: stats.pengajuanLimbah, sub: 'menunggu review', to: '/admin/limbah', alert: stats.pengajuanLimbah > 0 },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => s.to && navigate(s.to)}
            className={`bg-white border rounded-xl p-5 text-left transition-all ${
              s.to ? 'hover:border-green-200 hover:shadow-sm cursor-pointer' : 'cursor-default'
            } ${s.alert ? 'border-yellow-200' : 'border-gray-100'}`}
          >
            <p className={`text-2xl font-bold ${s.alert ? 'text-yellow-600' : 'text-gray-900'}`}>
              {loading ? '—' : s.value}
            </p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* PESANAN TERBARU */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Pesanan Terbaru</h2>
            <button
              onClick={() => navigate('/admin/pesanan')}
              className="text-xs text-green-600 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">Memuat...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">Belum ada pesanan</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Rp {order.total?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PENGAJUAN LIMBAH TERBARU */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Pengajuan Limbah Terbaru</h2>
            <button
              onClick={() => navigate('/admin/limbah')}
              className="text-xs text-green-600 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">Memuat...</p>
              </div>
            ) : recentLimbah.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">Belum ada pengajuan</p>
              </div>
            ) : (
              recentLimbah.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">{item.jenis_limbah}</p>
                    <p className="text-xs text-gray-400">
                      {item.profiles?.nama} · {item.volume_kg} kg
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    item.status === 'approved' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {item.status === 'pending' ? 'Menunggu' :
                     item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminDashboard