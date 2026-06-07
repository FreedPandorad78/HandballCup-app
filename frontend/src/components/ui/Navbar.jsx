import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const linkCls = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-orange-400' : 'text-hc-200 hover:text-white'
  }`

export default function Navbar() {
  const { dark, toggle } = useTheme()

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-hc-900 shadow-lg">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 h-14">
        <span className="mr-auto font-bold text-white tracking-wide text-sm sm:text-base">
          🤾 Handball Cup
        </span>
        <NavLink to="/" className={linkCls} end>Inicio</NavLink>
        <NavLink to="/fixture" className={linkCls}>Fixture</NavLink>
        <NavLink to="/estadisticas" className={linkCls}>Estadísticas</NavLink>
        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-hc-300 hover:text-white hover:bg-hc-800 transition-colors text-base"
        >
          {dark ? '☀' : '◑'}
        </button>
        <NavLink
          to="/admin/login"
          className="ml-1 rounded-lg border border-hc-700 px-3 py-1 text-xs font-semibold text-hc-200 hover:bg-hc-800 hover:text-white transition-colors"
        >
          Admin
        </NavLink>
      </div>
    </nav>
  )
}
