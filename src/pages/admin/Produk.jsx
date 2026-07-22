import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

const emptyForm = {
  nama: '', varian: 'basic', harga: '', stok: '', deskripsi: '', aktif: true
}

function AdminProduk() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [foto, setFoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditData(null)
    setForm(emptyForm)
    setFoto(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditData(product)
    setForm({
      nama: product.nama,
      varian: product.varian,
      harga: product.harga,
      stok: product.stok,
      deskripsi: product.deskripsi || '',
      aktif: product.aktif,
    })
    setFoto(null)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let gambar_url = editData?.gambar_url || null

      if (foto) {
        const ext = foto.name.split('.').pop()
        const fileName = `product_${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('products')
          .upload(fileName, foto, { upsert: true })
        if (uploadErr) throw uploadErr
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        gambar_url = data.publicUrl
      }

      const payload = {
        nama: form.nama,
        varian: form.varian,
        harga: parseInt(form.harga),
        stok: parseInt(form.stok),
        deskripsi: form.deskripsi,
        aktif: form.aktif,
        gambar_url,
      }

      if (editData) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success('Produk berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload)
        if (error) throw error
        toast.success('Produk berhasil ditambahkan')
      }

      setModalOpen(false)
      await fetchProducts()
    } catch (err) {
      toast.error('Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAktif = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ aktif: !product.aktif })
        .eq('id', product.id)
      if (error) throw error
      toast.success(product.aktif ? 'Produk dinonaktifkan' : 'Produk diaktifkan')
      await fetchProducts()
    } catch {
      toast.error('Gagal mengubah status produk')
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast.success('Produk dihapus')
      setDeleteId(null)
      await fetchProducts()
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  const varianLabel = (v) => ({ basic: 'Basic', pro: 'Pro', bulk: 'Bulk' })[v] || v
  const varianColor = (v) => ({
    basic: 'bg-gray-100 text-gray-600',
    pro: 'bg-green-100 text-green-700',
    bulk: 'bg-blue-50 text-blue-600',
  })[v] || 'bg-gray-100 text-gray-600'

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} produk terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Tambah Produk
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400 mb-4">Belum ada produk</p>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Produk</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Varian</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Harga</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Stok</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.gambar_url ? (
                          <img src={product.gambar_url} alt={product.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-200 rounded" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.nama}</p>
                        {product.deskripsi && (
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{product.deskripsi}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${varianColor(product.varian)}`}>
                      {varianLabel(product.varian)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">Rp {product.harga?.toLocaleString('id-ID')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-medium ${product.stok < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                      {product.stok}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleAktif(product)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        product.aktif
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {product.aktif ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editData ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Produk</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama produk"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Varian</label>
                <select
                  value={form.varian}
                  onChange={(e) => setForm({ ...form, varian: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Harga (Rp/liter)</label>
                  <input
                    type="number"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                    placeholder="contoh: 18000"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Stok</label>
                  <input
                    type="number"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    placeholder="contoh: 100"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi singkat produk"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Foto Produk {editData && <span className="text-gray-300 font-normal">— kosongkan jika tidak diubah</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aktif"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="aktif" className="text-xs font-medium text-gray-700">
                  Produk aktif (tampil di katalog)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Hapus Produk?</h2>
            <p className="text-xs text-gray-400 mb-5">
              Produk yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus produk ini?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminProduk