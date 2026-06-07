import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const linkCls = ({ isActive }) =>
  `font-body text-sm font-medium transition-colors ${
    isActive ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-text'
  }`

export default function Navbar() {
  const { dark, toggle } = useTheme()

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-brand-bg border-b border-brand-border">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 h-14">
        <span className="mr-auto font-display text-xl tracking-widest text-brand-text">
          HBC
        </span>
        <NavLink to="/" className={linkCls} end>Inicio</NavLink>
        <NavLink to="/fixture" className={linkCls}>Fixture</NavLink>
        <NavLink to="/estadisticas" className={linkCls}>Estadísticas</NavLink>
        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-faint transition-colors"
        >
          {dark ? '☀' : '◑'}
        </button>
        <NavLink
          to="/admin/login"
          className="ml-1 rounded-lg border border-brand-border px-3 py-1 text-xs font-body font-semibold text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-colors"
        >
          Admin
        </NavLink>
      </div>
    </nav>
  )
}
