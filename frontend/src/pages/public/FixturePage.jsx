import { useEffect, useState } from 'react'
import { getPartidos } from '../../api/partidos'
import TarjetaPartido from '../../components/handball/TarjetaPartido'
import Spinner from '../../components/ui/Spinner'

const ORDEN_FASE = ['Fase de grupos', 'Cuartos de final', 'Semifinal', 'Final']

function ordenarFases(fases) {
  return [...fases].sort((a, b) => {
    const ia = ORDEN_FASE.findIndex((f) => a.toLowerCase().includes(f.toLowerCase()))
    const ib = ORDEN_FASE.findIndex((f) => b.toLowerCase().includes(f.toLowerCase()))
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b)
  })
}

export default function FixturePage() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPartidos()
      .then((res) => setPartidos(res.data))
      .catch(() => setError('No se pudo cargar el fixture.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  if (error) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-500 text-sm">{error}</div>
  }

  const porFase = partidos.reduce((acc, p) => {
    const fase = p.fase || 'General'
    if (!acc[fase]) acc[fase] = []
    acc[fase].push(p)
    return acc
  }, {})

  const fasesOrdenadas = ordenarFases(Object.keys(porFase))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-blue-900">Fixture</h1>
        <p className="text-sm text-slate-500 mt-0.5">{partidos.length} partido{partidos.length !== 1 ? 's' : ''}</p>
      </header>

      {fasesOrdenadas.length === 0 && (
        <p className="text-center text-slate-400 py-12 text-sm">Aún no hay partidos programados.</p>
      )}

      {fasesOrdenadas.map((fase) => (
        <section key={fase}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">
            {fase}
          </h2>
          <div className="space-y-3">
            {porFase[fase]
              .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
              .map((p) => (
                <TarjetaPartido key={p.id} partido={p} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
