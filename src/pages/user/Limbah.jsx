import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'
import toast from 'react-hot-toast'

function Limbah() {
  const { profile, fetchProfile } = useAuthStore()
  const [verifikasi, setVerifikasi] = useState(null)
  const [pengajuan, setPengajuan] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pengajuan')

  // Form verifikasi kebun
  const [formVerif, setFormVerif] = useState({
    nama_kebun: '', lokasi: '', luas_kebun: '', jumlah_limbah: '', catatan: ''
  })
  const [fotoVerif, setFotoVerif] = useState(null)
  const [loadingVerif, setLoadingVerif] = useState(false)

  // Form pengajuan limbah
  const [formLimbah, setFormLimbah] = useState({
    jenis_limbah: '', volume_kg: '', kondisi: '', harga_tawar: '', catatan: ''
  })
  const [fotoLimbah, setFotoLimbah] = useState(null)
  const [loadingLimbah, setLoadingLimbah] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [verifRes, pengajuanRes] = await Promise.all([
        supabase
          .from('verifikasi_kebun')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('pengajuan_limbah')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
      ])
      setVerifikasi(verifRes.data)
      setPengajuan(pengajuanRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVerif = async (e) => {
    e.preventDefault()
    setLoadingVerif(true)
    try {
      let foto_url = null
      if (fotoVerif) {
        const ext = fotoVerif.name.split('.').pop()
        const fileName = `verif_${profile.id}_${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('verifikasi')
          .upload(fileName, fotoVerif)
        if (uploadErr) throw uploadErr
        const { data } = supabase.storage.from('verifikasi').getPublicUrl(fileName)
        foto_url = data.publicUrl
      }

      const { error } = await supabase.from('verifikasi_kebun').insert({
        user_id: profile.id,
        ...formVerif,
        foto_url,
        status: 'pending',
      })
      if (error) throw error

      toast.success('Permohonan verifikasi berhasil dikirim')
      await fetchData()
      setFormVerif({ nama_kebun: '', lokasi: '', luas_kebun: '', jumlah_limbah: '', catatan: '' })
      setFotoVerif(null)
    } catch (err) {
      toast.error('Gagal mengirim permohonan verifikasi')
    } finally {
      setLoadingVerif(false)
    }
  }

  const handleSubmitLimbah = async (e) => {
    e.preventDefault()
    setLoadingLimbah(true)
    try {
      let foto_url = null
      if (fotoLimbah) {
        const ext = fotoLimbah.name.split('.').pop()
        const fileName = `limbah_${profile.id}_${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('limbah')
          .upload(fileName, fotoLimbah)
        if (uploadErr) throw uploadErr
        const { data } = supabase.storage.from('limbah').getPublicUrl(fileName)
        foto_url = data.publicUrl
      }

      const { error } = await supabase.from('pengajuan_limbah').insert({
        user_id: profile.id,
        jenis_limbah: formLimbah.jenis_limbah,
        volume_kg: parseFloat(formLimbah.volume_kg),
        kondisi: formLimbah.kondisi,
        harga_tawar: parseInt(formLimbah.harga_tawar) || null,
        catatan: formLimbah.catatan,
        foto_url,
        status: 'pending',
      })
      if (error) throw error

      toast.success('Pengajuan limbah berhasil dikirim')
      await fetchData()
      setFormLimbah({ jenis_limbah: '', volume_kg: '', kondisi: '', harga_tawar: '', catatan: '' })
      setFotoLimbah(null)
    } catch (err) {
      toast.error('Gagal mengirim pengajuan limbah')
    } finally {
      setLoadingLimbah(false)
    }
  }

  const statusConfig = (status) => {
    const map = {
      pending: { label: 'Menunggu Review', color: 'bg-yellow-50 text-yellow-700' },
      approved: { label: 'Disetujui', color: 'bg-green-50 text-green-700' },
      rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-700' },
    }
    return map[status] || { label: status, color: 'bg-gray-50 text-gray-600' }
  }

  const isVerified = verifikasi?.status === 'approved'
  const isPending = verifikasi?.status === 'pending'
  const isRejected = verifikasi?.status === 'rejected'

  if (loading) return (
    <UserLayout>
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    </UserLayout>
  )

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fitur Limbah</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kelola dan ajukan limbah tembakau kebun kamu</p>
      </div>

      {/* BELUM VERIFIKASI — tampilkan form verifikasi */}
      {!verifikasi || isRejected ? (
        <div className="max-w-xl">
          <div className={`rounded-xl p-4 mb-6 ${isRejected ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
            <p className={`text-sm font-medium ${isRejected ? 'text-red-700' : 'text-yellow-700'}`}>
              {isRejected
                ? 'Permohonan verifikasi kamu ditolak. Silakan ajukan kembali dengan data yang benar.'
                : 'Kamu perlu verifikasi kebun terlebih dahulu sebelum dapat mengajukan limbah.'}
            </p>
            {isRejected && verifikasi?.catatan_admin && (
              <p className="text-xs text-red-500 mt-1">Alasan: {verifikasi.catatan_admin}</p>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">
              {isRejected ? 'Ajukan Ulang Verifikasi Kebun' : 'Verifikasi Kebun'}
            </h2>
            <form onSubmit={handleSubmitVerif} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Kebun</label>
                <input
                  type="text"
                  value={formVerif.nama_kebun}
                  onChange={(e) => setFormVerif({ ...formVerif, nama_kebun: e.target.value })}
                  placeholder="Nama kebun tembakau kamu"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Lokasi Kebun</label>
                <input
                  type="text"
                  value={formVerif.lokasi}
                  onChange={(e) => setFormVerif({ ...formVerif, lokasi: e.target.value })}
                  placeholder="Desa, Kecamatan, Kabupaten"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Luas Kebun</label>
                  <input
                    type="text"
                    value={formVerif.luas_kebun}
                    onChange={(e) => setFormVerif({ ...formVerif, luas_kebun: e.target.value })}
                    placeholder="contoh: 2 hektar"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Estimasi Limbah</label>
                  <input
                    type="text"
                    value={formVerif.jumlah_limbah}
                    onChange={(e) => setFormVerif({ ...formVerif, jumlah_limbah: e.target.value })}
                    placeholder="contoh: 500 kg/panen"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Foto Kebun</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoVerif(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Catatan Tambahan</label>
                <textarea
                  value={formVerif.catatan}
                  onChange={(e) => setFormVerif({ ...formVerif, catatan: e.target.value })}
                  placeholder="Informasi tambahan tentang kebun kamu (opsional)"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loadingVerif}
                className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingVerif ? 'Mengirim...' : 'Kirim Permohonan Verifikasi'}
              </button>
            </form>
          </div>
        </div>
      ) : isPending ? (
        /* MENUNGGU VERIFIKASI */
        <div className="max-w-xl">
          <div className="bg-white border border-yellow-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-yellow-400 rounded-full" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Permohonan Sedang Ditinjau</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tim TechLeaf sedang meninjau data kebun kamu. Proses ini biasanya memakan waktu 1–2 hari kerja.
              Kamu akan mendapat notifikasi setelah disetujui.
            </p>
            <div className="mt-5 p-3 bg-gray-50 rounded-lg text-left">
              <p className="text-xs font-medium text-gray-700 mb-1">{verifikasi.nama_kebun}</p>
              <p className="text-xs text-gray-400">{verifikasi.lokasi}</p>
              <p className="text-xs text-gray-400">{verifikasi.luas_kebun} · {verifikasi.jumlah_limbah}</p>
            </div>
          </div>
        </div>
      ) : (
        /* SUDAH TERVERIFIKASI */
        <div>
          {/* STATUS VERIFIKASI */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Kebun Terverifikasi</p>
              <p className="text-xs text-green-600">{verifikasi.nama_kebun} · {verifikasi.lokasi}</p>
            </div>
            <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium">Aktif</span>
          </div>

          {/* TABS */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
            {[
              { key: 'pengajuan', label: 'Riwayat Pengajuan' },
              { key: 'baru', label: 'Ajukan Limbah Baru' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
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

          {/* RIWAYAT PENGAJUAN */}
          {tab === 'pengajuan' && (
            <div className="space-y-3">
              {pengajuan.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
                  <p className="text-sm text-gray-400 mb-3">Belum ada pengajuan limbah</p>
                  <button
                    onClick={() => setTab('baru')}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Ajukan Limbah Pertama
                  </button>
                </div>
              ) : (
                pengajuan.map((item) => {
                  const cfg = statusConfig(item.status)
                  return (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.jenis_limbah}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.volume_kg} kg · {item.kondisi}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                        <span>
                          Harga tawar:{' '}
                          <span className="text-gray-700 font-medium">
                            {item.harga_tawar ? `Rp ${item.harga_tawar.toLocaleString('id-ID')}` : '-'}
                          </span>
                        </span>
                        {item.harga_deal && (
                          <span>
                            Harga deal:{' '}
                            <span className="text-green-600 font-medium">
                              Rp {item.harga_deal.toLocaleString('id-ID')}
                            </span>
                          </span>
                        )}
                        <span>
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      {item.catatan_admin && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-500">Catatan admin: {item.catatan_admin}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* FORM PENGAJUAN LIMBAH BARU */}
          {tab === 'baru' && (
            <div className="max-w-xl">
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-5">Ajukan Limbah Baru</h2>
                <form onSubmit={handleSubmitLimbah} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Jenis Limbah</label>
                    <select
                      value={formLimbah.jenis_limbah}
                      onChange={(e) => setFormLimbah({ ...formLimbah, jenis_limbah: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white text-gray-700"
                    >
                      <option value="">Pilih jenis limbah</option>
                      <option value="Batang Tembakau">Batang Tembakau</option>
                      <option value="Tulang Daun">Tulang Daun</option>
                      <option value="Pucuk Pangkasan">Pucuk Pangkasan</option>
                      <option value="Sisa Rajangan">Sisa Rajangan</option>
                      <option value="Campuran">Campuran</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Volume (kg)</label>
                      <input
                        type="number"
                        value={formLimbah.volume_kg}
                        onChange={(e) => setFormLimbah({ ...formLimbah, volume_kg: e.target.value })}
                        placeholder="contoh: 200"
                        min="1"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Kondisi</label>
                      <select
                        value={formLimbah.kondisi}
                        onChange={(e) => setFormLimbah({ ...formLimbah, kondisi: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white text-gray-700"
                      >
                        <option value="">Pilih kondisi</option>
                        <option value="Basah">Basah</option>
                        <option value="Kering">Kering</option>
                        <option value="Setengah Kering">Setengah Kering</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Harga Tawar (Rp/kg) <span className="text-gray-300 font-normal">— opsional</span>
                    </label>
                    <input
                      type="number"
                      value={formLimbah.harga_tawar}
                      onChange={(e) => setFormLimbah({ ...formLimbah, harga_tawar: e.target.value })}
                      placeholder="contoh: 2000"
                      min="0"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Foto Limbah</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoLimbah(e.target.files[0])}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Catatan <span className="text-gray-300 font-normal">— opsional</span>
                    </label>
                    <textarea
                      value={formLimbah.catatan}
                      onChange={(e) => setFormLimbah({ ...formLimbah, catatan: e.target.value })}
                      placeholder="Informasi tambahan tentang limbah kamu"
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingLimbah}
                    className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingLimbah ? 'Mengirim...' : 'Kirim Pengajuan Limbah'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </UserLayout>
  )
}

export default Limbah