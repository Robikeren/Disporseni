import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/produk', label: 'Manajemen Produk' },
  { to: '/admin/pesanan', label: 'Manajemen Pesanan' },
  { to: '/admin/limbah', label: 'Manajemen Limbah' },
]

function AdminLayout({ children }) {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TL</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm">
                Tech<span className="text-green-600">Leaf</span>
              </span>
              <p className="text-xs text-gray-400 leading-none">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 font-medium px-2 mb-2 uppercase tracking-wide">Menu</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-gray-900 truncate">{profile?.nama || 'Admin'}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">TL</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            Tech<span className="text-green-600">Leaf</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium"
        >
          Menu
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-5 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{profile?.nama || 'Admin'}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
            <nav className="px-3 py-4 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-56 pt-16 md:pt-0">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

    </div>
  )
}

export default AdminLayout