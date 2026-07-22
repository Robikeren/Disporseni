import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import UserLayout from '../../components/UserLayout'
import toast from 'react-hot-toast'

function Profil() {
  const { profile, fetchProfile, user } = useAuthStore()
  const [form, setForm] = useState({ nama: '', telepon: '', alamat: '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        nama: profile.nama || '',
        telepon: profile.telepon || '',
        alamat: profile.alamat || '',
      })
    }
  }, [profile])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nama: form.nama,
          telepon: form.telepon,
          alamat: form.alamat,
        })
        .eq('id', profile.id)
      if (error) throw error
      await fetchProfile(profile.id)
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error('Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB')
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${profile.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('profiles').getPublicUrl(fileName)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: data.publicUrl })
        .eq('id', profile.id)
      if (updateError) throw updateError

      await fetchProfile(profile.id)
      toast.success('Foto profil diperbarui')
    } catch (err) {
      toast.error('Gagal mengupload foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Profil Saya</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kelola informasi akun kamu</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* FOTO PROFIL */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-green-50 flex items-center justify-center">
            {profile?.foto_url ? (
              <img src={profile.foto_url} alt="Foto profil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-green-600">
                {profile?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{profile?.nama || '-'}</p>
          <p className="text-xs text-gray-400 mb-4">{user?.email}</p>
          <label className="cursor-pointer">
            <span className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
              {uploading ? 'Mengupload...' : 'Ganti Foto'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadFoto}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <div className="mt-6 pt-4 border-t border-gray-100 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Role</span>
              <span className="text-xs font-medium text-gray-700 capitalize">{profile?.role || 'user'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Status Kebun</span>
              <span className={`text-xs font-medium ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {profile?.verified ? 'Terverifikasi' : 'Belum Verifikasi'}
              </span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Informasi Pribadi</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-300 mt-1">Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nomor Telepon</label>
              <input
                type="tel"
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Alamat lengkap kamu"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </UserLayout>
  )
}

export default Profil