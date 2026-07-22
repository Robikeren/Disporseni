import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu Konfirmasi' },
  { value: 'processing', label: 'Sedang Diproses' },
  { value: 'shipped', label: 'Dalam Pengiriman' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

function AdminPesanan() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(nama, telepon)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async (orderId) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    setItems(data || [])
  }

  const handleSelect = (order) => {
    if (selected?.id === order.id) {
      setSelected(null)
      setItems([])
    } else {
      setSelected(order)
      fetchItems(order.id)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error
      toast.success('Status pesanan diperbarui')
      await fetchOrders()
      setSelected((prev) => prev ? { ...prev, status: newStatus } : null)
    } catch {
      toast.error('Gagal memperbarui status')
    } finally {
      setUpdating(false)
    }
  }

  const statusConfig = (status) => {
    const map = {
      pending: { label: 'Menunggu', color: 'bg-yellow-50 text-yellow-700' },
      processing: { label: 'Diproses', color: 'bg-blue-50 text-blue-700' },
      shipped: { label: 'Dikirim', color: 'bg-purple-50 text-purple-700' },
      delivered: { label: 'Selesai', color: 'bg-green-50 text-green-700' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-700' },
    }
    return map[status] || { label: status, color: 'bg-gray-50 text-gray-600' }
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus)

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manajemen Pesanan</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} total pesanan</p>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[{ value: 'all', label: 'Semua' }, ...STATUS_OPTIONS].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterStatus === s.value
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = statusConfig(order.status)
            const isOpen = selected?.id === order.id
            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isOpen ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                {/* HEADER ROW */}
                <button
                  onClick={() => handleSelect(order)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs font-medium text-gray-700">{order.profiles?.nama || '-'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* DETAIL */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-5 space-y-5">

                    {/* INFO PEMBELI */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Info Pembeli</p>
                        <p className="text-sm text-gray-900">{order.profiles?.nama || '-'}</p>
                        {order.profiles?.telepon && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.profiles.telepon}</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Alamat Pengiriman</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{order.alamat_pengiriman || '-'}</p>
                        {order.catatan && (
                          <p className="text-xs text-gray-400 mt-1">Catatan: {order.catatan}</p>
                        )}
                      </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-3">Detail Produk</p>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        {items.map((item, i) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 ${
                              i < items.length - 1 ? 'border-b border-gray-50' : ''
                            }`}
                          >
                            <div>
                              <p className="text-sm text-gray-900">{item.nama_produk}</p>
                              <p className="text-xs text-gray-400 capitalize">{item.varian} · {item.qty} liter</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-700">Total</span>
                          <span className="text-sm font-bold text-green-600">
                            Rp {order.total?.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* UPDATE STATUS */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-3">Update Status Pesanan</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => handleUpdateStatus(order.id, s.value)}
                            disabled={order.status === s.value || updating}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                              order.status === s.value
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700 disabled:opacity-50'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminPesanan