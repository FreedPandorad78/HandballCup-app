import { useEffect, useState } from 'react'
import { getEquipos } from '../../api/equipos'
import {
  getJugadores,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
} from '../../api/jugadores'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const FORM_EMPTY = { nombre: '', numero_camiseta: '', activo: true }

export default function JugadoresPage() {
  const [equipos, setEquipos] = useState([])
  const [equipoId, setEquipoId] = useState('')
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    getEquipos()
      .then((res) => {
        setEquipos(res.data)
        if (res.data.length > 0) setEquipoId(res.data[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!equipoId) return
    getJugadores(equipoId).then((res) => setJugadores(res.data))
  }, [equipoId])

  function abrirCrear() {
    setForm(FORM_EMPTY)
    setError(null)
    setModal({ mode: 'create' })
  }

  function abrirEditar(jug) {
    setForm({ nombre: jug.nombre, numero_camiseta: String(jug.numero_camiseta), activo: jug.activo })
    setError(null)
    setModal({ mode: 'edit', id: jug.id })
  }

  async function guardar(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        numero_camiseta: parseInt(form.numero_camiseta),
        activo: form.activo,
      }
      if (modal.mode === 'create') {
        await crearJugador({ ...payload, equipo_id: equipoId })
      } else {
        await actualizarJugador(modal.id, payload)
      }
      const res = await getJugadores(equipoId)
      setJugadores(res.data)
      setModal(null)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminarJugador(confirmDelete)
      const res = await getJugadores(equipoId)
      setJugadores(res.data)
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) return <Spinner />

  const equipoActual = equipos.find((e) => e.id === equipoId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-800">Jugadores</h1>
        <button
          onClick={abrirCrear}
          disabled={!equipoId}
          className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {equipos.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">Crea equipos primero.</p>
      ) : (
        <>
          <select
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
            className="w-full mb-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre}
              </option>
            ))}
          </select>

          {jugadores.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">
              Sin jugadores en {equipoActual?.nombre}.
            </p>
          ) : (
            <div className="space-y-2">
              {jugadores.map((jug) => (
                <div
                  key={jug.id}
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {jug.numero_camiseta}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{jug.nombre}</p>
                    {!jug.activo && (
                      <span className="text-xs text-slate-400">Inactivo</span>
                    )}
                  </div>
                  <button
                    onClick={() => abrirEditar(jug)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(jug.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'create' ? `Nuevo jugador — ${equipoActual?.nombre}` : 'Editar jugador'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número de camiseta <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={form.numero_camiseta}
                onChange={(e) => setForm({ ...form, numero_camiseta: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Jugador activo</span>
            </label>
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
        <Modal title="Eliminar jugador" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">¿Eliminás este jugador?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
