import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.konfirmasi) {
      toast.error('Password dan konfirmasi password tidak sama')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { nama: form.nama }
        }
      })
      if (error) throw error

      // Sign out dulu biar tidak auto-login sebelum redirect
      await supabase.auth.signOut()

      toast.success('Akun berhasil dibuat! Silakan masuk.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Gagal membuat akun')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TL</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              Tech<span className="text-green-600">Leaf</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Buat Akun</h1>
            <p className="text-sm text-gray-400">Daftar dan mulai gunakan platform TechLeaf</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama kamu"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input
                type="password"
                name="konfirmasi"
                value={form.konfirmasi}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Masuk sekarang
            </Link>
          </p>

          <p className="text-xs text-gray-300 text-center mt-4 leading-relaxed">
            Dengan mendaftar, akun kamu otomatis terdaftar sebagai pengguna platform TechLeaf.
          </p>

        </div>
      </div>

    </div>
  )
}

export default Register