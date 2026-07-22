import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'
import toast from 'react-hot-toast'

function Keranjang() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [alamat, setAlamat] = useState('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const data = JSON.parse(localStorage.getItem(`cart_${profile.id}`) || '[]')
    setCart(data)
  }

  const updateQty = (productId, delta) => {
    const updated = cart.map((item) => {
      if (item.product_id === productId) {
        return { ...item, qty: Math.max(1, item.qty + delta) }
      }
      return item
    })
    setCart(updated)
    localStorage.setItem(`cart_${profile.id}`, JSON.stringify(updated))
  }

  const removeItem = (productId) => {
    const updated = cart.filter((item) => item.product_id !== productId)
    setCart(updated)
    localStorage.setItem(`cart_${profile.id}`, JSON.stringify(updated))
    toast.success('Item dihapus dari keranjang')
  }

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }
    if (!alamat.trim()) {
      toast.error('Masukkan alamat pengiriman')
      return
    }
    setLoading(true)
    try {
      // Buat order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          total,
          status: 'pending',
          alamat_pengiriman: alamat,
          catatan,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Buat order items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        nama_produk: item.nama,
        varian: item.varian,
        qty: item.qty,
        harga_satuan: item.harga,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items)

      if (itemsError) throw itemsError

      // Kurangi stok langsung via update (tanpa RPC)
      for (const item of cart) {
        const { data: product } = await supabase
          .from('products')
          .select('stok')
          .eq('id', item.product_id)
          .single()

        if (product && product.stok >= item.qty) {
          await supabase
            .from('products')
            .update({ stok: product.stok - item.qty })
            .eq('id', item.product_id)
        }
      }

      // Kosongkan keranjang
      localStorage.removeItem(`cart_${profile.id}`)
      setCart([])
      setAlamat('')
      setCatatan('')

      toast.success('Pesanan berhasil dibuat!')
      navigate('/user/pesanan')
    } catch (err) {
      console.error(err)
      toast.error('Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Keranjang</h1>
        <p className="text-sm text-gray-400 mt-0.5">{cart.length} item dalam keranjang</p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400 mb-4">Keranjang kamu masih kosong</p>
          <button
            onClick={() => navigate('/user/katalog')}
            className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Lihat Katalog
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {/* ITEM LIST */}
          <div className="md:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.product_id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {item.gambar_url ? (
                    <img src={item.gambar_url} alt={item.nama} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="w-6 h-6 bg-green-200 rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.nama}</p>
                  <p className="text-xs text-gray-400 capitalize mb-2">{item.varian}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Hapus
                  </button>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.product_id, -1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product_id, 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate mr-2">{item.nama} x{item.qty}</span>
                    <span className="flex-shrink-0">Rp {(item.harga * item.qty).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-sm font-bold text-green-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Detail Pengiriman</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat Pengiriman</label>
                  <textarea
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Masukkan alamat lengkap pengiriman"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan untuk penjual"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>

        </div>
      )}
    </UserLayout>
  )
}

export default Keranjang