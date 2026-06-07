import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getPartidos } from '../../api/partidos'
import TarjetaPartido from '../../components/handball/TarjetaPartido'
import CategoriaTabs from '../../components/ui/CategoriaTabs'
import Spinner from '../../components/ui/Spinner'

const ORDEN_FASE = ['Fase de grupos', 'Cuartos de final', 'Semifinal', 'Tercer puesto', 'Final']

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
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [partidos, setPartidos] = useState([])
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
    getPartidos(categoriaId).then((res) => setPartidos(res.data)).finally(() => setLoading(false))
  }, [categoriaId])

  if (!categoriaId) return <Spinner />

  const porFase = partidos.reduce((acc, p) => {
    const fase = p.fase || 'General'
    if (!acc[fase]) acc[fase] = []
    acc[fase].push(p)
    return acc
  }, {})
  const fasesOrdenadas = ordenarFases(Object.keys(porFase))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <header>
        <p className="font-display text-brand-accent text-sm tracking-widest2 mb-1">CALENDARIO</p>
        <h1 className="font-display text-5xl sm:text-6xl leading-none text-brand-text">FIXTURE</h1>
        <div className="mt-4">
          <CategoriaTabs categorias={categorias} selected={categoriaId} onChange={setCategoriaId} />
        </div>
      </header>

      {loading ? (
        <Spinner />
      ) : fasesOrdenadas.length === 0 ? (
        <p className="text-center text-brand-muted py-10 text-sm font-body">
          No hay partidos en esta categoría.
        </p>
      ) : (
        <div className="space-y-8">
          {fasesOrdenadas.map((fase) => (
            <section key={fase}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-xl tracking-widest text-brand-text">{fase.toUpperCase()}</h2>
                <div className="flex-1 h-px bg-brand-border" />
              </div>
              <div className="space-y-3">
                {porFase[fase]
                  .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                  .map((p) => <TarjetaPartido key={p.id} partido={p} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
