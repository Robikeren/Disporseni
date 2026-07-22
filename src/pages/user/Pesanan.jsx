import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'

function Pesanan() {
  const { profile } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error(err)
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

  const statusConfig = (status) => {
    const map = {
      pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-50 text-yellow-700', step: 1 },
      processing: { label: 'Sedang Diproses', color: 'bg-blue-50 text-blue-700', step: 2 },
      shipped: { label: 'Dalam Pengiriman', color: 'bg-purple-50 text-purple-700', step: 3 },
      delivered: { label: 'Selesai', color: 'bg-green-50 text-green-700', step: 4 },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-700', step: 0 },
    }
    return map[status] || { label: status, color: 'bg-gray-50 text-gray-600', step: 0 }
  }

  const steps = ['Menunggu', 'Diproses', 'Dikirim', 'Selesai']

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pesanan Saya</h1>
        <p className="text-sm text-gray-400 mt-0.5">Riwayat dan tracking pesanan kamu</p>
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
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig(order.status)
            const isOpen = selected?.id === order.id
            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isOpen ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                {/* HEADER */}
                <button
                  onClick={() => handleSelect(order)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Rp {order.total?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* DETAIL */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-5 space-y-5">

                    {/* TRACKING STEPS */}
                    {order.status !== 'cancelled' && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-4">Status Pesanan</p>
                        <div className="flex items-center">
                          {steps.map((step, i) => {
                            const stepNum = i + 1
                            const isActive = config.step >= stepNum
                            const isDone = config.step > stepNum
                            return (
                              <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                    isActive
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {isDone ? '✓' : stepNum}
                                  </div>
                                  <p className={`text-xs mt-1.5 text-center ${
                                    isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                                  }`}>
                                    {step}
                                  </p>
                                </div>
                                {i < steps.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${
                                    config.step > stepNum ? 'bg-green-400' : 'bg-gray-100'
                                  }`} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium">Pesanan ini telah dibatalkan</p>
                      </div>
                    )}

                    {/* ITEMS */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-3">Detail Produk</p>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm text-gray-900">{item.nama_produk}</p>
                              <p className="text-xs text-gray-400 capitalize">{item.varian} · {item.qty} liter</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ALAMAT */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Alamat Pengiriman</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{order.alamat_pengiriman || '-'}</p>
                      {order.catatan && (
                        <p className="text-xs text-gray-400 mt-1">Catatan: {order.catatan}</p>
                      )}
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Total Pembayaran</span>
                      <span className="text-sm font-bold text-green-600">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </span>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </UserLayout>
  )
}

export default Pesanan