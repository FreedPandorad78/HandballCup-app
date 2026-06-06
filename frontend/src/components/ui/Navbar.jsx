import { NavLink } from 'react-router-dom'

const linkCls = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-blue-200 hover:text-white'}`

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-blue-900 shadow-md">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 h-14">
        <span className="mr-auto font-bold text-white tracking-wide text-sm sm:text-base">
          🤾 Handball Cup
        </span>
        <NavLink to="/" className={linkCls} end>
          Inicio
        </NavLink>
        <NavLink to="/fixture" className={linkCls}>
          Fixture
        </NavLink>
        <NavLink to="/estadisticas" className={linkCls}>
          Estadísticas
        </NavLink>
        <NavLink
          to="/admin/login"
          className="ml-3 rounded-lg border border-blue-400 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
        >
          Admin
        </NavLink>
      </div>
    </nav>
  )
}
