import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

function Login() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      await fetchProfile(data.user.id)
      toast.success('Berhasil masuk!')

      if (profile?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/user')
      }
    } catch (err) {
      toast.error(err.message || 'Email atau password salah')
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Masuk</h1>
            <p className="text-sm text-gray-400">Masuk ke akun TechLeaf kamu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Login