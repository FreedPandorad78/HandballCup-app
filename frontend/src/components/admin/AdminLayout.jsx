import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/equipos', label: 'Equipos' },
  { to: '/admin/jugadores', label: 'Jugadores' },
  { to: '/admin/fixture', label: 'Fixture' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function salir() {
    logout()
    navigate('/admin/login')
  }

  const linkCls = ({ isActive }) =>
    `px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="fixed inset-x-0 top-0 z-50 bg-slate-900 h-12 flex items-center px-4 gap-3 shadow">
        <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors shrink-0">
          ← Público
        </Link>
        <span className="flex-1 text-white font-semibold text-sm text-center">🤾 Admin</span>
        <button
          onClick={salir}
          className="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
        >
          Salir
        </button>
      </div>

      <div className="fixed inset-x-0 top-12 z-40 bg-slate-800 h-10 shadow">
        <div className="overflow-x-auto h-full">
          <div className="flex items-center gap-1 px-3 h-full min-w-max">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '88px' }}>
        <Outlet />
      </div>
    </div>
  )
}
