import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getGoleadores, getTarjetas } from '../../api/estadisticas'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'tarjetas', label: 'Tarjetas' },
]

const tdBase = 'py-2.5 text-sm'
const thBase = 'py-2.5 text-xs font-semibold uppercase tracking-wide'

function TablaGoleadores({ rows }) {
  if (rows.length === 0) return <Empty msg="Aún no hay goles en esta categoría." />
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-hc-900 text-white">
          <tr>
            <th className={`pl-4 pr-2 ${thBase} w-8 text-left`}>#</th>
            <th className={`px-2 ${thBase} text-left`}>Jugador</th>
            <th className={`px-2 ${thBase} text-left hidden sm:table-cell`}>Equipo</th>
            <th className={`px-3 ${thBase} text-center font-bold`}>Goles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-slate-50 dark:bg-zinc-800/50'}>
              <td className={`pl-4 pr-2 ${tdBase} text-slate-400 dark:text-zinc-500`}>{i + 1}</td>
              <td className={`px-2 ${tdBase}`}>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{r.nombre}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className={`px-2 ${tdBase} text-slate-500 dark:text-zinc-400 hidden sm:table-cell`}>
                {r.equipo} <span className="text-xs text-slate-400">#{r.numero_camiseta}</span>
              </td>
              <td className={`px-3 ${tdBase} text-center font-black text-hc-900 dark:text-orange-400 tabular-nums text-base`}>{r.goles}</td>
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
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-hc-900 text-white">
          <tr>
            <th className={`pl-4 pr-2 ${thBase} w-8 text-left`}>#</th>
            <th className={`px-2 ${thBase} text-left`}>Jugador</th>
            <th className={`px-2 ${thBase} text-left hidden sm:table-cell`}>Equipo</th>
            <th className={`px-3 ${thBase} text-center`}>🟡</th>
            <th className={`px-3 ${thBase} text-center`}>🔴</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
          {rows.map((r, i) => (
            <tr key={r.jugador_id} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-slate-50 dark:bg-zinc-800/50'}>
              <td className={`pl-4 pr-2 ${tdBase} text-slate-400 dark:text-zinc-500`}>{i + 1}</td>
              <td className={`px-2 ${tdBase}`}>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{r.nombre}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 sm:hidden">{r.equipo} · #{r.numero_camiseta}</p>
              </td>
              <td className={`px-2 ${tdBase} text-slate-500 dark:text-zinc-400 hidden sm:table-cell`}>
                {r.equipo} <span className="text-xs text-slate-400">#{r.numero_camiseta}</span>
              </td>
              <td className={`px-3 ${tdBase} text-center font-semibold text-yellow-600 dark:text-yellow-400 tabular-nums`}>{r.amarillas}</td>
              <td className={`px-3 ${tdBase} text-center font-semibold text-red-600 dark:text-red-400 tabular-nums`}>{r.rojas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Empty({ msg }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
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
      .then(([gRes, tRes]) => { setGoleadores(gRes.data); setTarjetas(tRes.data) })
      .finally(() => setLoading(false))
  }, [categoriaId])

  if (!categoriaId) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-hc-900 dark:text-white">Estadísticas</h1>
      </header>

      <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />

      <div className="flex border-b border-slate-200 dark:border-zinc-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : tab === 'goleadores' ? <TablaGoleadores rows={goleadores} /> : <TablaTarjetas rows={tarjetas} />}
    </div>
  )
}
