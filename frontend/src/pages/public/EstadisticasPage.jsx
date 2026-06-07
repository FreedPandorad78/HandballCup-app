import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getGoleadores, getTarjetas } from '../../api/estadisticas'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'tarjetas', label: 'Tarjetas' },
]

function TablaGoleadores({ rows }) {
  if (rows.length === 0)
    return <EmptyState msg="Aún no hay goles registrados en esta categoría." />
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="pl-4 pr-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-8">#</th>
            <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide">Jugador</th>
            <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">Equipo</th>
            <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide">Goles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="pl-4 pr-2 py-2.5 text-slate-400 text-xs">{i + 1}</td>
              <td className="px-2 py-2.5">
                <p className="font-medium text-slate-800">{r.nombre}</p>
                <p className="text-xs text-slate-400 sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className="px-2 py-2.5 text-slate-500 text-sm hidden sm:table-cell">
                {r.equipo} <span className="text-xs text-slate-400">#{r.numero_camiseta}</span>
              </td>
              <td className="px-3 py-2.5 text-center font-bold text-blue-900 tabular-nums text-base">{r.goles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaTarjetas({ rows }) {
  if (rows.length === 0)
    return <EmptyState msg="Aún no hay tarjetas registradas en esta categoría." />
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="pl-4 pr-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-8">#</th>
            <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide">Jugador</th>
            <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">Equipo</th>
            <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide">🟡</th>
            <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide">🔴</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="pl-4 pr-2 py-2.5 text-slate-400 text-xs">{i + 1}</td>
              <td className="px-2 py-2.5">
                <p className="font-medium text-slate-800">{r.nombre}</p>
                <p className="text-xs text-slate-400 sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className="px-2 py-2.5 text-slate-500 text-sm hidden sm:table-cell">
                {r.equipo} <span className="text-xs text-slate-400">#{r.numero_camiseta}</span>
              </td>
              <td className="px-3 py-2.5 text-center font-semibold text-yellow-600 tabular-nums">{r.amarillas}</td>
              <td className="px-3 py-2.5 text-center font-semibold text-red-600 tabular-nums">{r.rojas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-sm text-slate-400">
      {msg}
    </div>
  )
}

export default function EstadisticasPage() {
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [tab, setTab] = useState('goleadores')
  const [goleadores, setGoleadores] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)

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
      .then(([gRes, tRes]) => {
        setGoleadores(gRes.data)
        setTarjetas(tRes.data)
      })
      .finally(() => setLoading(false))
  }, [categoriaId])

  if (!categoriaId) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-blue-900">Estadísticas</h1>
      </header>

      <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />

      <div className="flex border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
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
