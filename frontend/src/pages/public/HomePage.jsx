import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getPosiciones } from '../../api/estadisticas'
import { getPartidos } from '../../api/partidos'
import TarjetaPartido from '../../components/handball/TarjetaPartido'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

function GdCell({ value }) {
  const color =
    value > 0 ? 'text-emerald-600 dark:text-emerald-400'
    : value < 0 ? 'text-rose-500 dark:text-rose-400'
    : 'text-slate-400 dark:text-zinc-500'
  return (
    <td className={`px-2 py-2.5 text-center tabular-nums text-sm ${color}`}>
      {value > 0 ? `+${value}` : value}
    </td>
  )
}

export default function HomePage() {
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [posiciones, setPosiciones] = useState([])
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategorias()
      .then((res) => {
        setCategorias(res.data)
        if (res.data.length > 0) setCategoriaId(res.data[0].id)
      })
      .catch(() => setError('No se pudo cargar la información.'))
  }, [])

  useEffect(() => {
    if (!categoriaId) return
    setLoading(true)
    Promise.all([getPosiciones(categoriaId), getPartidos(categoriaId)])
      .then(([posRes, partRes]) => {
        setPosiciones(posRes.data)
        setPartidos(partRes.data)
      })
      .catch(() => setError('No se pudo cargar la información.'))
      .finally(() => setLoading(false))
  }, [categoriaId])

  const enCurso = partidos.filter((p) => p.estado === 'EN_CURSO')
  const proximos = partidos
    .filter((p) => p.estado === 'PROGRAMADO')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5)

  if (!categoriaId && !error) return <Spinner />
  if (error)
    return <p className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-500 dark:text-zinc-400 text-sm">{error}</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <header className="text-center pt-2 pb-2">
        <h1 className="text-3xl font-extrabold text-hc-900 dark:text-white">
          Medellín Handball Cup
        </h1>
        <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
          Torneo universitario de balonmano
        </p>
      </header>

      <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {enCurso.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                En curso
              </h2>
              <div className="space-y-3">
                {enCurso.map((p) => <TarjetaPartido key={p.id} partido={p} />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
              Tabla de Posiciones
            </h2>
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-hc-900 text-white">
                    <tr>
                      <th className="pl-4 pr-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide w-7">#</th>
                      <th className="px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Equipo</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Partidos jugados">PJ</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Ganados">PG</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Empatados">PE</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Perdidos">PP</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Goles a favor">GF</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" title="Goles en contra">GC</th>
                      <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide" title="Diferencia de goles">DG</th>
                      <th className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {posiciones.map((e, i) => (
                      <tr
                        key={e.id}
                        className={i % 2 === 0
                          ? 'bg-white dark:bg-zinc-900'
                          : 'bg-slate-50 dark:bg-zinc-800/50'}
                      >
                        <td className="pl-4 pr-2 py-2.5 text-slate-400 dark:text-zinc-500 text-xs font-medium">{e.pos}</td>
                        <td className="px-2 py-2.5 font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">{e.nombre}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.pj}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.pg}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.pe}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.pp}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.gf}</td>
                        <td className="px-2 py-2.5 text-center text-slate-600 dark:text-zinc-400 tabular-nums hidden sm:table-cell">{e.gc}</td>
                        <GdCell value={e.gd} />
                        <td className="px-3 py-2.5 text-center font-black text-hc-900 dark:text-orange-400 tabular-nums">{e.pts}</td>
                      </tr>
                    ))}
                    {posiciones.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                          Aún no hay partidos finalizados en esta categoría
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {proximos.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
                Próximos Partidos
              </h2>
              <div className="space-y-3">
                {proximos.map((p) => <TarjetaPartido key={p.id} partido={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
