import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getGoleadores, getTarjetas } from '../../api/estadisticas'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'tarjetas',   label: 'Tarjetas'   },
]

const th = 'py-3 text-xs font-body font-semibold uppercase tracking-widest text-brand-muted'
const td = 'py-3 text-sm font-body'

function TablaGoleadores({ rows }) {
  if (rows.length === 0) return <Empty msg="Aún no hay goles en esta categoría." />
  return (
    <div className="rounded-xl border border-brand-border overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-brand-faint">
          <tr>
            <th className={`pl-4 pr-2 ${th} text-left w-8`}>#</th>
            <th className={`px-2 ${th} text-left`}>Jugador</th>
            <th className={`px-2 ${th} text-left hidden sm:table-cell`}>Equipo</th>
            <th className={`px-4 ${th} text-center text-brand-accent`}>Goles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={`transition-colors ${i === 0 ? 'bg-brand-card-alt border-l-2 border-l-brand-accent' : 'bg-brand-card hover:bg-brand-card-alt'}`}>
              <td className={`pl-4 pr-2 ${td} text-brand-muted`}>{i + 1}</td>
              <td className={`px-2 ${td}`}>
                <p className="font-semibold text-brand-text">{r.nombre}</p>
                <p className="text-xs text-brand-muted sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className={`px-2 ${td} text-brand-muted hidden sm:table-cell`}>
                {r.equipo} <span className="text-xs">#{r.numero_camiseta}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-display text-2xl text-brand-accent tabular-nums leading-none">{r.goles}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaTarjetas({ rows }) {
  if (rows.length === 0) return <Empty msg="Aún no hay tarjetas en esta categoría." />
  return (
    <div className="rounded-xl border border-brand-border overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-brand-faint">
          <tr>
            <th className={`pl-4 pr-2 ${th} text-left w-8`}>#</th>
            <th className={`px-2 ${th} text-left`}>Jugador</th>
            <th className={`px-2 ${th} text-left hidden sm:table-cell`}>Equipo</th>
            <th className={`px-4 ${th} text-center`}>🟡</th>
            <th className={`px-4 ${th} text-center`}>🔴</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={`transition-colors ${i === 0 ? 'bg-brand-card-alt border-l-2 border-l-brand-accent' : 'bg-brand-card hover:bg-brand-card-alt'}`}>
              <td className={`pl-4 pr-2 ${td} text-brand-muted`}>{i + 1}</td>
              <td className={`px-2 ${td}`}>
                <p className="font-semibold text-brand-text">{r.nombre}</p>
                <p className="text-xs text-brand-muted sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className={`px-2 ${td} text-brand-muted hidden sm:table-cell`}>
                {r.equipo} <span className="text-xs">#{r.numero_camiseta}</span>
              </td>
              <td className={`px-4 ${td} text-center font-semibold text-yellow-400 tabular-nums`}>{r.amarillas}</td>
              <td className={`px-4 ${td} text-center font-semibold text-brand-accent tabular-nums`}>{r.rojas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Empty({ msg }) {
  return (
    <div className="rounded-xl border border-brand-border py-12 text-center text-sm font-body text-brand-muted">
      {msg}
    </div>
  )
}

export default function EstadisticasPage() {
  const [categorias, setCategorias]   = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [tab, setTab]                 = useState('goleadores')
  const [goleadores, setGoleadores]   = useState([])
  const [tarjetas, setTarjetas]       = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getCategorias().then((res) => {
      setCategorias(res.data)
      if (res.data.length > 0) setCategoriaId(res.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!categoriaId) return
    setLoading(true)
    Promise.all([getGoleadores(categoriaId), getTarjetas(categoriaId)])
      .then(([gRes, tRes]) => { setGoleadores(gRes.data); setTarjetas(tRes.data) })
      .finally(() => setLoading(false))
  }, [categoriaId])

  if (!categoriaId) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <header>
        <p className="font-display text-brand-accent text-sm tracking-widest2 mb-1">DATOS DEL TORNEO</p>
        <h1 className="font-display text-5xl sm:text-6xl leading-none text-brand-text">ESTADÍSTICAS</h1>
        <div className="mt-4">
          <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-brand-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 font-display text-lg tracking-widest border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : tab === 'goleadores' ? (
        <TablaGoleadores rows={goleadores} />
      ) : (
        <TablaTarjetas rows={tarjetas} />
      )}
    </div>
  )
}
