import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

function AdminLimbah() {
  const [tab, setTab] = useState('verifikasi')
  const [verifikasi, setVerifikasi] = useState([])
  const [pengajuan, setPengajuan] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [modalData, setModalData] = useState(null)
  const [catatanAdmin, setCatatanAdmin] = useState('')
  const [hargaDeal, setHargaDeal] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [verifRes, pengajuanRes] = await Promise.all([
        supabase
          .from('verifikasi_kebun')
          .select('*, profiles(nama, telepon, alamat)')
          .order('created_at', { ascending: false }),
        supabase
          .from('pengajuan_limbah')
          .select('*, profiles(nama, telepon)')
          .order('created_at', { ascending: false }),
      ])
      setVerifikasi(verifRes.data || [])
      setPengajuan(pengajuanRes.data || [])
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateVerif = async (id, status) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('verifikasi_kebun')
        .update({ status, catatan_admin: catatanAdmin })
        .eq('id', id)
      if (error) throw error
      toast.success(status === 'approved' ? 'Verifikasi disetujui' : 'Verifikasi ditolak')
      setModalData(null)
      setCatatanAdmin('')
      await fetchData()
    } catch {
      toast.error('Gagal memperbarui verifikasi')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePengajuan = async (id, status) => {
    setUpdating(true)
    try {
      const payload = {
        status,
        catatan_admin: catatanAdmin,
      }
      if (status === 'approved' && hargaDeal) {
        payload.harga_deal = parseInt(hargaDeal)
      }
      const { error } = await supabase
        .from('pengajuan_limbah')
        .update(payload)
        .eq('id', id)
      if (error) throw error
      toast.success(status === 'approved' ? 'Pengajuan disetujui' : 'Pengajuan ditolak')
      setModalData(null)
      setCatatanAdmin('')
      setHargaDeal('')
      await fetchData()
    } catch {
      toast.error('Gagal memperbarui pengajuan')
    } finally {
      setUpdating(false)
    }
  }

  const statusConfig = (status) => {
    const map = {
      pending: { label: 'Menunggu', color: 'bg-yellow-50 text-yellow-700' },
      approved: { label: 'Disetujui', color: 'bg-green-50 text-green-700' },
      rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-700' },
    }
    return map[status] || { label: status, color: 'bg-gray-50 text-gray-600' }
  }

  const filteredVerif = verifikasi.filter((v) =>
    filterStatus === 'all' ? true : v.status === filterStatus
  )
  const filteredPengajuan = pengajuan.filter((p) =>
    filterStatus === 'all' ? true : p.status === filterStatus
  )

  const pendingVerifCount = verifikasi.filter((v) => v.status === 'pending').length
  const pendingPengajuanCount = pengajuan.filter((p) => p.status === 'pending').length

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manajemen Limbah</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kelola verifikasi kebun dan pengajuan limbah petani</p>
      </div>

      {/* TABS */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {[
          { key: 'verifikasi', label: `Verifikasi Kebun${pendingVerifCount > 0 ? ` (${pendingVerifCount})` : ''}` },
          { key: 'pengajuan', label: `Pengajuan Limbah${pendingPengajuanCount > 0 ? ` (${pendingPengajuanCount})` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelected(null) }}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FILTER STATUS */}
      <div className="flex gap-2 mb-5">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'pending', label: 'Menunggu' },
          { value: 'approved', label: 'Disetujui' },
          { value: 'rejected', label: 'Ditolak' },
        ].map((s) => (
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
      ) : (
        <>
          {/* TAB VERIFIKASI KEBUN */}
          {tab === 'verifikasi' && (
            <div className="space-y-3">
              {filteredVerif.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                  <p className="text-sm text-gray-400">Tidak ada data verifikasi</p>
                </div>
              ) : (
                filteredVerif.map((item) => {
                  const cfg = statusConfig(item.status)
                  const isOpen = selected?.id === item.id && selected?.type === 'verif'
                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-xl overflow-hidden transition-all ${
                        isOpen ? 'border-green-200' : 'border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => setSelected(
                          isOpen ? null : { id: item.id, type: 'verif' }
                        )}
                        className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.nama_kebun}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.profiles?.nama} · {item.lokasi}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 p-5 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="text-xs font-medium text-gray-700">Detail Kebun</p>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500">Nama: <span className="text-gray-900">{item.nama_kebun}</span></p>
                                <p className="text-xs text-gray-500">Lokasi: <span className="text-gray-900">{item.lokasi}</span></p>
                                <p className="text-xs text-gray-500">Luas: <span className="text-gray-900">{item.luas_kebun}</span></p>
                                <p className="text-xs text-gray-500">Est. Limbah: <span className="text-gray-900">{item.jumlah_limbah}</span></p>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="text-xs font-medium text-gray-700">Info Petani</p>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500">Nama: <span className="text-gray-900">{item.profiles?.nama}</span></p>
                                <p className="text-xs text-gray-500">Telepon: <span className="text-gray-900">{item.profiles?.telepon || '-'}</span></p>
                                <p className="text-xs text-gray-500">Alamat: <span className="text-gray-900">{item.profiles?.alamat || '-'}</span></p>
                              </div>
                            </div>
                          </div>

                          {item.foto_url && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Foto Kebun</p>
                              <img
                                src={item.foto_url}
                                alt="Foto kebun"
                                className="w-48 h-36 object-cover rounded-lg border border-gray-100"
                              />
                            </div>
                          )}

                          {item.catatan && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Catatan Petani</p>
                              <p className="text-xs text-gray-500">{item.catatan}</p>
                            </div>
                          )}

                          {item.status === 'pending' && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Tindakan</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setModalData({ type: 'verif', item }); setCatatanAdmin('') }}
                                  className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Setujui / Tolak
                                </button>
                              </div>
                            </div>
                          )}

                          {item.catatan_admin && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-700 mb-1">Catatan Admin</p>
                              <p className="text-xs text-blue-600">{item.catatan_admin}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* TAB PENGAJUAN LIMBAH */}
          {tab === 'pengajuan' && (
            <div className="space-y-3">
              {filteredPengajuan.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                  <p className="text-sm text-gray-400">Tidak ada pengajuan limbah</p>
                </div>
              ) : (
                filteredPengajuan.map((item) => {
                  const cfg = statusConfig(item.status)
                  const isOpen = selected?.id === item.id && selected?.type === 'pengajuan'
                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-xl overflow-hidden transition-all ${
                        isOpen ? 'border-green-200' : 'border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => setSelected(
                          isOpen ? null : { id: item.id, type: 'pengajuan' }
                        )}
                        className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.jenis_limbah}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.profiles?.nama} · {item.volume_kg} kg · {item.kondisi}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 p-5 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="text-xs font-medium text-gray-700">Detail Limbah</p>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500">Jenis: <span className="text-gray-900">{item.jenis_limbah}</span></p>
                                <p className="text-xs text-gray-500">Volume: <span className="text-gray-900">{item.volume_kg} kg</span></p>
                                <p className="text-xs text-gray-500">Kondisi: <span className="text-gray-900">{item.kondisi}</span></p>
                                <p className="text-xs text-gray-500">
                                  Harga Tawar:{' '}
                                  <span className="text-gray-900">
                                    {item.harga_tawar ? `Rp ${item.harga_tawar.toLocaleString('id-ID')}/kg` : '-'}
                                  </span>
                                </p>
                                {item.harga_deal && (
                                  <p className="text-xs text-gray-500">
                                    Harga Deal:{' '}
                                    <span className="text-green-600 font-medium">
                                      Rp {item.harga_deal.toLocaleString('id-ID')}/kg
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="text-xs font-medium text-gray-700">Info Petani</p>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500">Nama: <span className="text-gray-900">{item.profiles?.nama}</span></p>
                                <p className="text-xs text-gray-500">Telepon: <span className="text-gray-900">{item.profiles?.telepon || '-'}</span></p>
                              </div>
                            </div>
                          </div>

                          {item.foto_url && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Foto Limbah</p>
                              <img
                                src={item.foto_url}
                                alt="Foto limbah"
                                className="w-48 h-36 object-cover rounded-lg border border-gray-100"
                              />
                            </div>
                          )}

                          {item.catatan && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Catatan Petani</p>
                              <p className="text-xs text-gray-500">{item.catatan}</p>
                            </div>
                          )}

                          {item.status === 'pending' && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Tindakan</p>
                              <button
                                onClick={() => { setModalData({ type: 'pengajuan', item }); setCatatanAdmin(''); setHargaDeal('') }}
                                className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Setujui / Tolak
                              </button>
                            </div>
                          )}

                          {item.catatan_admin && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-700 mb-1">Catatan Admin</p>
                              <p className="text-xs text-blue-600">{item.catatan_admin}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL TINDAKAN VERIFIKASI */}
      {modalData?.type === 'verif' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalData(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Tindakan Verifikasi</h2>
            <p className="text-xs text-gray-400 mb-4">{modalData.item.nama_kebun} — {modalData.item.profiles?.nama}</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Catatan Admin <span className="text-gray-300 font-normal">— opsional</span>
              </label>
              <textarea
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                placeholder="Catatan untuk petani"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateVerif(modalData.item.id, 'rejected')}
                disabled={updating}
                className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Tolak
              </button>
              <button
                onClick={() => handleUpdateVerif(modalData.item.id, 'approved')}
                disabled={updating}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TINDAKAN PENGAJUAN LIMBAH */}
      {modalData?.type === 'pengajuan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalData(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Tindakan Pengajuan Limbah</h2>
            <p className="text-xs text-gray-400 mb-4">
              {modalData.item.jenis_limbah} · {modalData.item.volume_kg} kg — {modalData.item.profiles?.nama}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Harga Deal (Rp/kg) <span className="text-gray-300 font-normal">— isi jika disetujui</span>
                </label>
                <input
                  type="number"
                  value={hargaDeal}
                  onChange={(e) => setHargaDeal(e.target.value)}
                  placeholder="contoh: 2000"
                  min="0"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Catatan Admin <span className="text-gray-300 font-normal">— opsional</span>
                </label>
                <textarea
                  value={catatanAdmin}
                  onChange={(e) => setCatatanAdmin(e.target.value)}
                  placeholder="Catatan untuk petani"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdatePengajuan(modalData.item.id, 'rejected')}
                disabled={updating}
                className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Tolak
              </button>
              <button
                onClick={() => handleUpdatePengajuan(modalData.item.id, 'approved')}
                disabled={updating}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminLimbah