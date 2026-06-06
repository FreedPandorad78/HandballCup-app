import { useEffect, useState } from 'react'
import { getPosiciones } from '../../api/estadisticas'
import { getPartidos } from '../../api/partidos'
import TarjetaPartido from '../../components/handball/TarjetaPartido'
import Spinner from '../../components/ui/Spinner'

function GdCell({ value }) {
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-slate-400'
  return <td className={`px-2 py-2.5 text-center tabular-nums ${color}`}>{value > 0 ? `+${value}` : value}</td>
}

function TablaHeader({ label, title }) {
  return (
    <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide" title={title}>
      {label}
    </th>
  )
}

export default function HomePage() {
  const [posiciones, setPosiciones] = useState([])
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getPosiciones(), getPartidos()])
      .then(([posRes, partRes]) => {
        setPosiciones(posRes.data)
        setPartidos(partRes.data)
      })
      .catch(() => setError('No se pudo cargar la información. Verificá que el servidor esté activo.'))
      .finally(() => setLoading(false))
  }, [])

  const enCurso = partidos.filter((p) => p.estado === 'EN_CURSO')
  const proximos = partidos
    .filter((p) => p.estado === 'PROGRAMADO')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5)

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-500 text-sm">{error}</div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <header className="text-center pt-2 pb-4">
        <h1 className="text-3xl font-extrabold text-blue-900">Medellín Handball Cup</h1>
        <p className="mt-1 text-slate-500 text-sm">Torneo universitario de balonmano</p>
      </header>

      {/* En curso */}
      {enCurso.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            En curso
          </h2>
          <div className="space-y-3">
            {enCurso.map((p) => (
              <TarjetaPartido key={p.id} partido={p} />
            ))}
          </div>
        </section>
      )}

      {/* Tabla de posiciones */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Tabla de Posiciones</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="pl-4 pr-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-8">#</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide">Equipo</th>
                  <TablaHeader label="PJ" title="Partidos jugados" />
                  <TablaHeader label="PG" title="Partidos ganados" />
                  <TablaHeader label="PE" title="Partidos empatados" />
                  <TablaHeader label="PP" title="Partidos perdidos" />
                  <TablaHeader label="GF" title="Goles a favor" />
                  <TablaHeader label="GC" title="Goles en contra" />
                  <TablaHeader label="DG" title="Diferencia de goles" />
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posiciones.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="pl-4 pr-2 py-2.5 text-slate-400 text-xs font-medium">{e.pos}</td>
                    <td className="px-2 py-2.5 font-medium text-slate-800 whitespace-nowrap">{e.nombre}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.pj}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.pg}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.pe}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.pp}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.gf}</td>
                    <td className="px-2 py-2.5 text-center text-slate-600 tabular-nums">{e.gc}</td>
                    <GdCell value={e.gd} />
                    <td className="px-3 py-2.5 text-center font-bold text-blue-900 tabular-nums">{e.pts}</td>
                  </tr>
                ))}
                {posiciones.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
                      Aún no hay partidos finalizados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Próximos partidos */}
      {proximos.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Próximos Partidos</h2>
          <div className="space-y-3">
            {proximos.map((p) => (
              <TarjetaPartido key={p.id} partido={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
