import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEquipos } from '../../api/equipos'
import {
  getPartidos,
  crearPartido,
  actualizarPartido,
  cambiarEstado,
  eliminarPartido,
} from '../../api/partidos'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const FASES = ['Fase de grupos', 'Cuartos de final', 'Semifinal', 'Tercer puesto', 'Final']

const FORM_EMPTY = {
  equipo_local_id: '',
  equipo_visitante_id: '',
  fecha: '',
  fase: 'Fase de grupos',
}

function formatFecha(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function FixtureAdminPage() {
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'create' | { mode:'edit', partido }
  const [form, setForm] = useState(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function cargar() {
    const [pRes, eRes] = await Promise.all([getPartidos(), getEquipos()])
    setPartidos(pRes.data)
    setEquipos(eRes.data)
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false))
  }, [])

  function toLocalDatetime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  function abrirCrear() {
    setForm({ ...FORM_EMPTY, equipo_local_id: equipos[0]?.id ?? '', equipo_visitante_id: equipos[1]?.id ?? '' })
    setError(null)
    setModal('create')
  }

  function abrirEditar(partido) {
    setForm({
      equipo_local_id: partido.equipo_local_id,
      equipo_visitante_id: partido.equipo_visitante_id,
      fecha: toLocalDatetime(partido.fecha),
      fase: partido.fase,
    })
    setError(null)
    setModal({ mode: 'edit', id: partido.id })
  }

  async function guardar(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        equipo_local_id: form.equipo_local_id,
        equipo_visitante_id: form.equipo_visitante_id,
        fecha: new Date(form.fecha).toISOString(),
        fase: form.fase,
      }
      if (modal === 'create') {
        await crearPartido(payload)
      } else {
        await actualizarPartido(modal.id, { fecha: payload.fecha, fase: payload.fase })
      }
      await cargar()
      setModal(null)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function iniciar(id) {
    await cambiarEstado(id, 'EN_CURSO')
    await cargar()
  }

  async function finalizar(id) {
    await cambiarEstado(id, 'FINALIZADO')
    await cargar()
  }

  async function confirmarEliminar() {
    try {
      await eliminarPartido(confirmDelete)
      await cargar()
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) return <Spinner />

  const isCreate = modal === 'create'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-800">Fixture</h1>
        <button
          onClick={abrirCrear}
          disabled={equipos.length < 2}
          className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition-colors"
        >
          + Partido
        </button>
      </div>

      {partidos.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">No hay partidos programados.</p>
      ) : (
        <div className="space-y-3">
          {partidos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {p.fase}
                </span>
                <Badge estado={p.estado} />
              </div>

              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex-1 text-right text-sm font-semibold text-slate-800 truncate">
                  {p.equipo_local}
                </span>
                <span className="text-base font-bold text-blue-900 tabular-nums px-2 shrink-0">
                  {p.estado !== 'PROGRAMADO' ? `${p.goles_local} – ${p.goles_visitante}` : 'vs'}
                </span>
                <span className="flex-1 text-left text-sm font-semibold text-slate-800 truncate">
                  {p.equipo_visitante}
                </span>
              </div>

              <p className="text-xs text-slate-400 text-center mb-3">{formatFecha(p.fecha)}</p>

              <div className="flex flex-wrap gap-2">
                {p.estado === 'PROGRAMADO' && (
                  <>
                    <button
                      onClick={() => iniciar(p.id)}
                      className="flex-1 min-w-[80px] py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      ▶ Iniciar
                    </button>
                    <button
                      onClick={() => abrirEditar(p)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Editar
                    </button>
                  </>
                )}
                {p.estado === 'EN_CURSO' && (
                  <>
                    <Link
                      to={`/admin/planilla/${p.id}`}
                      className="flex-1 min-w-[80px] py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold text-center hover:bg-blue-800 transition-colors"
                    >
                      📋 Planilla
                    </Link>
                    <button
                      onClick={() => finalizar(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      ⏹ Finalizar
                    </button>
                  </>
                )}
                {p.estado === 'FINALIZADO' && (
                  <Link
                    to={`/admin/planilla/${p.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Ver planilla
                  </Link>
                )}
                <button
                  onClick={() => setConfirmDelete(p.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={isCreate ? 'Nuevo partido' : 'Editar partido'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <form onSubmit={guardar} className="space-y-4">
            {isCreate && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Equipo local <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.equipo_local_id}
                    onChange={(e) => setForm({ ...form, equipo_local_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Equipo visitante <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.equipo_visitante_id}
                    onChange={(e) => setForm({ ...form, equipo_visitante_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha y hora <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fase <span className="text-red-500">*</span>
              </label>
              <select
                value={form.fase}
                onChange={(e) => setForm({ ...form, fase: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {FASES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar partido" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">
            ¿Eliminás este partido? Se perderán todos sus eventos registrados.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
