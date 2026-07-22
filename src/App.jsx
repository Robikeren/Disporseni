import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User pages
import UserDashboard from './pages/user/Dashboard'
import Profil from './pages/user/Profil'
import Katalog from './pages/user/Katalog'
import Keranjang from './pages/user/Keranjang'
import Pesanan from './pages/user/Pesanan'
import Limbah from './pages/user/Limbah'
import Konsultasi from './pages/user/Konsultasi'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminProduk from './pages/admin/Produk'
import AdminPesanan from './pages/admin/Pesanan'
import AdminLimbah from './pages/admin/Limbah'

function PrivateRoute({ children, role }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-400">Memuat...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (role && profile?.role !== role) return <Navigate to="/" />
  return children
}

function GuestRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-400">Memuat...</p>
    </div>
  )
  if (user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/user'} />
  }
  return children
}

function App() {
  const { setUser, setProfile, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* User */}
        <Route path="/user" element={<PrivateRoute role="user"><UserDashboard /></PrivateRoute>} />
        <Route path="/user/profil" element={<PrivateRoute role="user"><Profil /></PrivateRoute>} />
        <Route path="/user/katalog" element={<PrivateRoute role="user"><Katalog /></PrivateRoute>} />
        <Route path="/user/keranjang" element={<PrivateRoute role="user"><Keranjang /></PrivateRoute>} />
        <Route path="/user/pesanan" element={<PrivateRoute role="user"><Pesanan /></PrivateRoute>} />
        <Route path="/user/limbah" element={<PrivateRoute role="user"><Limbah /></PrivateRoute>} />
        <Route path="/user/konsultasi" element={<PrivateRoute role="user"><Konsultasi /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/produk" element={<PrivateRoute role="admin"><AdminProduk /></PrivateRoute>} />
        <Route path="/admin/pesanan" element={<PrivateRoute role="admin"><AdminPesanan /></PrivateRoute>} />
        <Route path="/admin/limbah" element={<PrivateRoute role="admin"><AdminLimbah /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App