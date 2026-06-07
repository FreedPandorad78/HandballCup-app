import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getPosiciones } from '../../api/estadisticas'
import { getPartidos } from '../../api/partidos'
import TarjetaPartido from '../../components/handball/TarjetaPartido'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-display text-2xl tracking-widest text-brand-text">{children}</h2>
      <div className="flex-1 h-px bg-brand-border" />
    </div>
  )
}

function GdCell({ value }) {
  const cls =
    value > 0 ? 'text-emerald-400'
    : value < 0 ? 'text-brand-accent'
    : 'text-brand-muted'
  return (
    <td className={`px-2 py-3 text-center tabular-nums text-sm font-medium ${cls}`}>
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
    return (
      <p className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-muted text-sm">{error}</p>
    )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* ── Hero ── */}
      <header className="pt-2">
        <p className="font-display text-brand-accent text-sm tracking-widest2 mb-1">
          TORNEO UNIVERSITARIO · 2026
        </p>
        <h1 className="font-display text-6xl sm:text-7xl leading-none text-brand-text">
          MEDELLÍN<br />HANDBALL CUP
        </h1>
        <div className="mt-4">
          <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />
        </div>
      </header>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* ── En curso ── */}
          {enCurso.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-accent" />
                </span>
                <h2 className="font-display text-2xl tracking-widest text-brand-accent">EN CURSO</h2>
              </div>
              <div className="space-y-3">
                {enCurso.map((p) => <TarjetaPartido key={p.id} partido={p} />)}
              </div>
            </section>
          )}

          {/* ── Tabla de posiciones ── */}
          <section>
            <SectionTitle>POSICIONES</SectionTitle>
            <div className="rounded-xl overflow-hidden border border-brand-border">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-brand-faint">
                    <th className="pl-4 pr-2 py-3 text-left text-xs font-body font-semibold uppercase tracking-widest text-brand-muted w-8">#</th>
                    <th className="px-2 py-3 text-left text-xs font-body font-semibold uppercase tracking-widest text-brand-muted">Equipo</th>
                    <th className="px-2 py-3 text-center text-xs font-body font-semibold uppercase tracking-widest text-brand-muted hidden sm:table-cell">PJ</th>
                    <th className="px-2 py-3 text-center text-xs font-body font-semibold uppercase tracking-widest text-brand-muted hidden sm:table-cell">PG</th>
                    <th className="px-2 py-3 text-center text-xs font-body font-semibold uppercase tracking-widest text-brand-muted hidden sm:table-cell">PP</th>
                    <th className="px-2 py-3 text-center text-xs font-body font-semibold uppercase tracking-widest text-brand-muted">DG</th>
                    <th className="px-4 py-3 text-center text-xs font-body font-semibold uppercase tracking-widest text-brand-accent">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {posiciones.map((e, i) => (
                    <tr
                      key={e.id}
                      className={`transition-colors ${
                        i === 0
                          ? 'bg-brand-card-alt border-l-2 border-l-brand-accent'
                          : 'bg-brand-card hover:bg-brand-card-alt'
                      }`}
                    >
                      <td className="pl-4 pr-2 py-3">
                        <span className={`text-sm font-bold tabular-nums ${i === 0 ? 'text-brand-accent' : 'text-brand-muted'}`}>
                          {e.pos}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-body font-semibold text-brand-text text-sm whitespace-nowrap">
                        {e.nombre}
                      </td>
                      <td className="px-2 py-3 text-center text-brand-muted tabular-nums text-sm hidden sm:table-cell">{e.pj}</td>
                      <td className="px-2 py-3 text-center text-brand-muted tabular-nums text-sm hidden sm:table-cell">{e.pg}</td>
                      <td className="px-2 py-3 text-center text-brand-muted tabular-nums text-sm hidden sm:table-cell">{e.pp}</td>
                      <GdCell value={e.gd} />
                      <td className="px-4 py-3 text-center">
                        <span className="font-display text-2xl text-brand-accent tabular-nums leading-none">{e.pts}</span>
                      </td>
                    </tr>
                  ))}
                  {posiciones.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-muted">
                        Aún no hay partidos finalizados en esta categoría
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Próximos partidos ── */}
          {proximos.length > 0 && (
            <section>
              <SectionTitle>PRÓXIMOS</SectionTitle>
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
