import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'
import toast from 'react-hot-toast'

function Katalog() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('aktif', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    setAddingId(product.id)
    try {
      // Cek apakah sudah ada di keranjang (localStorage)
      const cart = JSON.parse(localStorage.getItem(`cart_${profile.id}`) || '[]')
      const existing = cart.find((item) => item.product_id === product.id)
      if (existing) {
        existing.qty += 1
      } else {
        cart.push({
          product_id: product.id,
          nama: product.nama,
          varian: product.varian,
          harga: product.harga,
          gambar_url: product.gambar_url,
          qty: 1,
        })
      }
      localStorage.setItem(`cart_${profile.id}`, JSON.stringify(cart))
      toast.success('Ditambahkan ke keranjang')
    } catch (err) {
      toast.error('Gagal menambahkan ke keranjang')
    } finally {
      setAddingId(null)
    }
  }

  const varianLabel = (v) => {
    const map = { basic: 'Basic', pro: 'Pro', bulk: 'Bulk' }
    return map[v] || v
  }

  const varianBadge = (v) => {
    const map = {
      basic: 'bg-gray-100 text-gray-600',
      pro: 'bg-green-100 text-green-700',
      bulk: 'bg-blue-50 text-blue-600',
    }
    return map[v] || 'bg-gray-100 text-gray-600'
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Katalog Produk</h1>
        <p className="text-sm text-gray-400 mt-0.5">Bioinsektisida organik berbasis nikotin tembakau Jember</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
              <div className="w-full h-40 bg-gray-100 rounded-lg mb-4" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Belum ada produk tersedia</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-green-100 hover:shadow-sm transition-all"
            >
              {/* Gambar */}
              <div className="w-full h-44 bg-gray-50 flex items-center justify-center">
                {product.gambar_url ? (
                  <img
                    src={product.gambar_url}
                    alt={product.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                      <div className="w-5 h-5 bg-green-400 rounded" />
                    </div>
                    <p className="text-xs text-gray-300">Belum ada foto</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${varianBadge(product.varian)}`}>
                    {varianLabel(product.varian)}
                  </span>
                  <span className={`text-xs ${product.stok > 0 ? 'text-green-600' : 'text-red-400'}`}>
                    {product.stok > 0 ? `Stok: ${product.stok}` : 'Habis'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.nama}</h3>
                {product.deskripsi && (
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{product.deskripsi}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-gray-900">
                    Rp {product.harga?.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-gray-400">/liter</span>
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stok === 0 || addingId === product.id}
                  className="mt-3 w-full py-2 text-sm font-medium rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {addingId === product.id ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  )
}

export default Katalog