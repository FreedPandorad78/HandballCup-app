import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEquipos } from '../../api/equipos'
import { getJugadores } from '../../api/jugadores'
import { getPartidos } from '../../api/partidos'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, to, color }) {
  return (
    <Link
      to={to}
      className={`block bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([getEquipos(), getJugadores(), getPartidos()]).then(
      ([eq, jug, part]) => {
        const partidos = part.data
        setStats({
          equipos: eq.data.length,
          jugadores: jug.data.length,
          partidos: partidos.length,
          enCurso: partidos.filter((p) => p.estado === 'EN_CURSO').length,
          finalizados: partidos.filter((p) => p.estado === 'FINALIZADO').length,
        })
      },
    )
  }, [])

  if (!stats) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-extrabold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Equipos" value={stats.equipos} to="/admin/equipos" color="text-blue-700" />
        <StatCard label="Jugadores" value={stats.jugadores} to="/admin/jugadores" color="text-indigo-700" />
        <StatCard label="Partidos" value={stats.partidos} to="/admin/fixture" color="text-slate-700" />
        <StatCard
          label={stats.enCurso > 0 ? `${stats.enCurso} en curso` : 'Finalizados'}
          value={stats.enCurso > 0 ? stats.enCurso : stats.finalizados}
          to="/admin/fixture"
          color={stats.enCurso > 0 ? 'text-green-600' : 'text-slate-500'}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Accesos rápidos
        </p>
        {[
          { to: '/admin/equipos', label: 'Gestionar equipos y jugadores' },
          { to: '/admin/fixture', label: 'Crear o editar partidos' },
          { to: '/admin/fixture', label: 'Abrir planilla en vivo' },
        ].map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {l.label}
            <span className="text-slate-300">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
